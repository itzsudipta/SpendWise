import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import pool from '../config/db.js';

const monthRegex = /^\d{4}-\d{2}$/;

const ensureArchiveTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_report_archive (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      report_month VARCHAR(7) NOT NULL,
      pdf_data BYTEA NOT NULL,
      file_path TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, report_month)
    );
  `);
  await pool.query(`
    ALTER TABLE monthly_report_archive
    ADD COLUMN IF NOT EXISTS pdf_data BYTEA;
  `);
  await pool.query(`
    ALTER TABLE monthly_report_archive
    ADD COLUMN IF NOT EXISTS file_path TEXT;
  `);
  await pool.query(`
    ALTER TABLE monthly_report_archive
    ALTER COLUMN file_path DROP NOT NULL;
  `);
};

export const validateMonth = (month) => monthRegex.test(String(month || ''));

const getMonthBounds = (month) => {
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);
  return { start, end };
};

export const getMonthlyReportData = async (userId, month) => {
  const budgetResult = await pool.query(
    `SELECT * FROM budget WHERE user_id = $1 AND b_mnth = $2 LIMIT 1`,
    [userId, month]
  );

  const expenseResult = await pool.query(
    `
      SELECT
        e.ex_id,
        e.user_id,
        e.ex_amount,
        e.ex_desc,
        e.ex_data,
        c.cy_name AS category_name
      FROM expense e
      LEFT JOIN category c ON e.cy_id = c.cy_id
      WHERE e.user_id = $1
        AND TO_CHAR(e.ex_data, 'YYYY-MM') = $2
      ORDER BY e.ex_data ASC, e.ex_id ASC
    `,
    [userId, month]
  );

  const userResult = await pool.query(
    `SELECT user_id, user_name, user_email FROM user_data WHERE user_id = $1 LIMIT 1`,
    [userId]
  );

  const budget = budgetResult.rows[0] || null;
  const expenses = expenseResult.rows;
  const user = userResult.rows[0] || { user_id: userId, user_name: `User ${userId}`, user_email: '-' };

  const totalSpent = expenses.reduce((sum, row) => sum + Number(row.ex_amount || 0), 0);
  const budgetLimit = Number(budget?.limit_amount || 0);
  const remaining = budgetLimit - totalSpent;

  const categoryTotalsMap = expenses.reduce((acc, row) => {
    const key = row.category_name || 'Uncategorized';
    acc[key] = (acc[key] || 0) + Number(row.ex_amount || 0);
    return acc;
  }, {});

  const categoryTotals = Object.entries(categoryTotalsMap).map(([name, amount]) => ({ name, amount }));

  return {
    user,
    month,
    budget,
    expenses,
    categoryTotals,
    totalSpent,
    budgetLimit,
    remaining,
  };
};

const inr = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export const buildMonthlyPdfBuffer = async (reportData) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];

  return await new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const generatedAt = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    doc.fontSize(18).text('SpendWise Monthly Expense Report');
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`User: ${reportData.user.user_name} (${reportData.user.user_email})`);
    doc.text(`User ID: ${reportData.user.user_id}`);
    doc.text(`Report Month: ${reportData.month}`);
    doc.text(`Generated: ${generatedAt.toLocaleString()} (${tz})`);
    doc.moveDown();

    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10);
    doc.text(`Budget Limit: ${inr(reportData.budgetLimit)}`);
    doc.text(`Total Spent: ${inr(reportData.totalSpent)}`);
    doc.text(`Remaining: ${inr(reportData.remaining)}`);
    doc.text(`Expense Count: ${reportData.expenses.length}`);
    doc.moveDown();

    doc.fontSize(12).text('Category Totals', { underline: true });
    doc.fontSize(10);
    if (reportData.categoryTotals.length === 0) {
      doc.text('No category data available.');
    } else {
      reportData.categoryTotals.forEach((row) => {
        doc.text(`${row.name}: ${inr(row.amount)}`);
      });
    }
    doc.moveDown();

    doc.fontSize(12).text('Expense Details', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(9);
    if (reportData.expenses.length === 0) {
      doc.text('No expenses for this month.');
    } else {
      reportData.expenses.forEach((row) => {
        const line = `${row.ex_data} | ${row.category_name || 'Uncategorized'} | ${row.ex_desc || '-'} | ${inr(row.ex_amount)}`;
        doc.text(line, { width: 520 });
      });
    }

    doc.end();
  });
};

export const generateLiveMonthlyReport = async (userId, month) => {
  const data = await getMonthlyReportData(userId, month);
  const buffer = await buildMonthlyPdfBuffer(data);
  return { buffer, data };
};

export const saveAutoMonthlyReport = async (userId, month) => {
  await ensureArchiveTable();
  const { buffer } = await generateLiveMonthlyReport(userId, month);

  await pool.query(
    `
      INSERT INTO monthly_report_archive (user_id, report_month, pdf_data, file_path)
      VALUES ($1, $2, $3, 'stored_in_database')
      ON CONFLICT (user_id, report_month)
      DO UPDATE SET
        pdf_data = EXCLUDED.pdf_data,
        file_path = EXCLUDED.file_path,
        created_at = CURRENT_TIMESTAMP
    `,
    [userId, month, buffer]
  );

  return { storedInDatabase: true, userId, month };
};

export const getAutoMonthlyReportBuffer = async (userId, month) => {
  await ensureArchiveTable();
  const result = await pool.query(
    `SELECT pdf_data, file_path FROM monthly_report_archive WHERE user_id = $1 AND report_month = $2 LIMIT 1`,
    [userId, month]
  );
  const row = result.rows[0];
  if (!row) return null;
  if (row.pdf_data) return row.pdf_data;
  if (row.file_path && row.file_path !== 'stored_in_database') {
    try {
      return await fs.readFile(row.file_path);
    } catch {
      return null;
    }
  }
  return null;
};

export const getUsersForMonth = async (month) => {
  const result = await pool.query(
    `
      SELECT DISTINCT user_id
      FROM (
        SELECT user_id FROM budget WHERE b_mnth = $1
        UNION
        SELECT user_id FROM expense WHERE TO_CHAR(ex_data, 'YYYY-MM') = $1
      ) u
      ORDER BY user_id
    `,
    [month]
  );
  return result.rows.map((row) => Number(row.user_id));
};

export const getPreviousMonth = () => {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const y = prev.getFullYear();
  const m = String(prev.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const getNextMonth = (month) => {
  const [year, mon] = month.split('-').map(Number);
  const next = new Date(year, mon, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const carryForwardBudgetsToMonth = async (fromMonth, toMonth) => {
  if (!validateMonth(fromMonth) || !validateMonth(toMonth)) return 0;
  const result = await pool.query(
    `
      INSERT INTO budget (user_id, b_mnth, limit_amount)
      SELECT b.user_id, $2, b.limit_amount
      FROM budget b
      WHERE b.b_mnth = $1
      AND NOT EXISTS (
        SELECT 1
        FROM budget existing
        WHERE existing.user_id = b.user_id
          AND existing.b_mnth = $2
      )
      RETURNING b_id
    `,
    [fromMonth, toMonth]
  );
  return result.rowCount || 0;
};

export const isCompletedMonth = (month) => {
  if (!validateMonth(month)) return false;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return month < currentMonth;
};

export { ensureArchiveTable, getMonthBounds };
