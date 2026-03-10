import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import pool from '../config/db.js';



const MONTH_REGEX = /^\d{4}-\d{2}$/;

const THEME = {
  colors: {
    primary: '#1e293b',    
    secondary: '#64748b',  
    headerBg: '#f1f5f9',   
    rowAlt: '#f8fafc',     
    border: '#e2e8f0',     
    white: '#ffffff',
    danger: '#ef4444',
  },
  fonts: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  layout: {
    margin: 40,
    rowHeight: 24, 
  }
};


export const validateMonth = (month) => MONTH_REGEX.test(String(month || ''));

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const truncateText = (value, maxLength) => {
  const text = String(value || '');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? String(dateStr) : d.toISOString().split('T')[0];
};

const getMonthBounds = (month) => {
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);
  return { start, end };
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

export const isCompletedMonth = (month) => {
  if (!validateMonth(month)) return false;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return month < currentMonth;
};

/* ==========================================================================
   DATABASE LAYER (Logic Unchanged)
   ========================================================================== */

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
  await pool.query(`ALTER TABLE monthly_report_archive ADD COLUMN IF NOT EXISTS pdf_data BYTEA;`);
  await pool.query(`ALTER TABLE monthly_report_archive ADD COLUMN IF NOT EXISTS file_path TEXT;`);
  await pool.query(`ALTER TABLE monthly_report_archive ALTER COLUMN file_path DROP NOT NULL;`);
};

export const getMonthlyReportData = async (userId, month) => {
  const budgetResult = await pool.query(
    `SELECT * FROM budget WHERE user_id = $1 AND LEFT(CAST(b_mnth AS TEXT), 7) = $2 LIMIT 1`,
    [userId, month]
  );

  const expenseResult = await pool.query(
    `SELECT e.ex_id, e.user_id, e.ex_amount, e.ex_desc, e.ex_data, e.ex_type, c.cy_name AS category_name
     FROM expense e
     LEFT JOIN category c ON e.cy_id = c.cy_id
     WHERE e.user_id = $1
       AND TO_CHAR(e.ex_data, 'YYYY-MM') = $2
       AND COALESCE(e.ex_type, 'expense') = 'expense'
     ORDER BY e.ex_data ASC, e.ex_id ASC`,
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

  return { user, month, budget, expenses, categoryTotals, totalSpent, budgetLimit, remaining };
};

/* ==========================================================================
   PDF GENERATION (Improved Layout Engine)
   ========================================================================== */

/* --- Helper: Draw Table Header --- */
const drawTableHeader = (doc, x, y, width) => {
  const height = 24;
  doc.rect(x, y, width, height).fill(THEME.colors.headerBg);
  doc.fillColor(THEME.colors.primary).font(THEME.fonts.bold).fontSize(9);

  // Columns: Date (15%), Category (20%), Description (45%), Amount (20%)
  doc.text('DATE', x + 10, y + 8, { width: width * 0.15 });
  doc.text('CATEGORY', x + 10 + width * 0.15, y + 8, { width: width * 0.20 });
  doc.text('DESCRIPTION', x + 10 + width * 0.35, y + 8, { width: width * 0.45 });
  doc.text('AMOUNT', x + width - 10 - (width * 0.20), y + 8, { width: width * 0.20, align: 'right' });

  return y + height;
};

/* --- Main PDF Builder --- */
export const buildMonthlyPdfBuffer = async (reportData) => {
  // Disable automatic paging to handle it manually and cleaner
  const doc = new PDFDocument({
    size: 'A4',
    margin: THEME.layout.margin,
    autoFirstPage: true
  });

  const chunks = [];
  return await new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const margin = THEME.layout.margin;
    const pageWidth = doc.page.width - margin * 2;
    const pageBottom = doc.page.height - margin;

    // --- Header Section ---
    const generatedAt = new Date();
    const invoiceNo = `INV-${reportData.month.replace('-', '')}-${reportData.user.user_id}`;

    // Brand
    doc.fillColor(THEME.colors.primary).fontSize(20).font(THEME.fonts.bold).text('SpendWise');
    doc.fontSize(9).font(THEME.fonts.regular).fillColor(THEME.colors.secondary).text('Financial Tracking');

    // Invoice Info (Top Right)
    doc.fontSize(24).font(THEME.fonts.bold).fillColor('#e2e8f0')
      .text('STATEMENT', 0, margin, { align: 'right', width: doc.page.width - margin });

    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(THEME.colors.primary).font(THEME.fonts.bold)
      .text(`Statement #: ${invoiceNo}`, { align: 'right' });
    doc.font(THEME.fonts.regular)
      .text(`Date: ${generatedAt.toISOString().slice(0, 10)}`, { align: 'right' });

    // Divider
    doc.moveDown(1);
    const yHeaderBottom = doc.y;
    doc.strokeColor(THEME.colors.border).lineWidth(1)
      .moveTo(margin, yHeaderBottom).lineTo(doc.page.width - margin, yHeaderBottom).stroke();

    // User Details
    doc.y = yHeaderBottom + 15;
    doc.font(THEME.fonts.bold).fontSize(9).text('BILL TO:', margin, doc.y);
    doc.font(THEME.fonts.regular).fontSize(10).text(reportData.user.user_name);
    doc.text(reportData.user.user_email);
    doc.text(`User ID: ${reportData.user.user_id}`);

    doc.moveDown(2);

    // --- Expenses Table ---

    // 1. Initial Table Header
    let currentY = doc.y;
    currentY = drawTableHeader(doc, margin, currentY, pageWidth);

    // 2. Loop Rows
    if (reportData.expenses.length === 0) {
      doc.y = currentY + 10;
      doc.font(THEME.fonts.regular).fontSize(10).text('No transactions found.', { align: 'center' });
    } else {
      const rowHeight = 20;

      reportData.expenses.forEach((row, index) => {
        // Check if we need a new page
        // 50px buffer for footer/margin
        if (currentY + rowHeight > pageBottom - 50) {
          doc.addPage();
          currentY = margin; // Reset to top
          currentY = drawTableHeader(doc, margin, currentY, pageWidth); // Re-draw header
        }

        // Draw Row Background (Zebra)
        if (index % 2 === 0) {
          doc.rect(margin, currentY, pageWidth, rowHeight).fill(THEME.colors.rowAlt);
        }

        // Draw Text
        doc.fillColor(THEME.colors.primary).font(THEME.fonts.regular).fontSize(9);
        const textY = currentY + 6;

        doc.text(formatDate(row.ex_data), margin + 10, textY, { width: pageWidth * 0.15 });
        doc.text(truncateText(row.category_name, 18), margin + 10 + pageWidth * 0.15, textY, { width: pageWidth * 0.20 });
        doc.text(truncateText(row.ex_desc, 45), margin + 10 + pageWidth * 0.35, textY, { width: pageWidth * 0.45 });
        doc.text(formatCurrency(row.ex_amount), margin + pageWidth - 10 - (pageWidth * 0.20), textY, { width: pageWidth * 0.20, align: 'right' });

        currentY += rowHeight;
      });
    }

    doc.y = currentY + 20;

    // --- Summary Section ---

    const summaryHeight = 100;
    // Check if summary fits, else move to next page
    if (doc.y + summaryHeight > pageBottom) {
      doc.addPage();
      doc.y = margin;
    }

    const summaryWidth = 220;
    const summaryX = doc.page.width - margin - summaryWidth;

    // Summary Box Background
    doc.rect(summaryX, doc.y, summaryWidth, 85).fill(THEME.colors.headerBg);

    const startSummaryY = doc.y + 10;
    const pad = 10;
    const innerWidth = summaryWidth - (pad * 2);

    // Rows inside summary
    const drawSummaryLine = (label, val, isBold = false, color = THEME.colors.primary) => {
      doc.font(isBold ? THEME.fonts.bold : THEME.fonts.regular).fontSize(isBold ? 11 : 9).fillColor(color);
      doc.text(label, summaryX + pad, startSummaryY + offset);
      doc.text(val, summaryX + pad, startSummaryY + offset, { width: innerWidth, align: 'right' });
    };

    let offset = 0;
    drawSummaryLine('Count', String(reportData.expenses.length));

    offset += 18;
    drawSummaryLine('Budget Limit', formatCurrency(reportData.budgetLimit));

    offset += 18;
    const isOver = reportData.remaining < 0;
    drawSummaryLine('Balance', formatCurrency(reportData.remaining), false, isOver ? THEME.colors.danger : THEME.colors.primary);

    // Total Divider
    offset += 12;
    doc.strokeColor(THEME.colors.border).lineWidth(1)
      .moveTo(summaryX + pad, startSummaryY + offset).lineTo(summaryX + summaryWidth - pad, startSummaryY + offset).stroke();

    offset += 10;
    drawSummaryLine('TOTAL SPENT', formatCurrency(reportData.totalSpent), true);

    // --- Footer ---
    // We add the footer to the bottom of the *current* page (the last page)
    const footerY = doc.page.height - 40;
    doc.fontSize(8).fillColor(THEME.colors.secondary).font(THEME.fonts.regular);
    doc.text('This is a system-generated statement. No signature required.', margin, footerY, { align: 'center', width: pageWidth });

    doc.end();
  });
};

/* ==========================================================================
   PUBLIC INTERFACE (Logic Unchanged)
   ========================================================================== */

export const generateLiveMonthlyReport = async (userId, month) => {
  const data = await getMonthlyReportData(userId, month);
  const buffer = await buildMonthlyPdfBuffer(data);
  return { buffer, data };
};

export const saveAutoMonthlyReport = async (userId, month) => {
  await ensureArchiveTable();
  const { buffer } = await generateLiveMonthlyReport(userId, month);

  await pool.query(
    `INSERT INTO monthly_report_archive (user_id, report_month, pdf_data, file_path)
     VALUES ($1, $2, $3, 'stored_in_database')
     ON CONFLICT (user_id, report_month)
     DO UPDATE SET
       pdf_data = EXCLUDED.pdf_data,
       file_path = EXCLUDED.file_path,
       created_at = CURRENT_TIMESTAMP`,
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
    try { return await fs.readFile(row.file_path); } catch { return null; }
  }
  return null;
};

export const getUsersForMonth = async (month) => {
  const result = await pool.query(
    `SELECT DISTINCT user_id FROM (
       SELECT user_id FROM budget WHERE LEFT(CAST(b_mnth AS TEXT), 7) = $1
       UNION
       SELECT user_id FROM expense WHERE TO_CHAR(ex_data, 'YYYY-MM') = $1
     ) u ORDER BY user_id`,
    [month]
  );
  return result.rows.map((row) => Number(row.user_id));
};

export const carryForwardBudgetsToMonth = async (fromMonth, toMonth) => {
  if (!validateMonth(fromMonth) || !validateMonth(toMonth)) return 0;
  const result = await pool.query(
    `INSERT INTO budget (user_id, b_mnth, limit_amount)
     SELECT b.user_id, TO_DATE($2, 'YYYY-MM'), b.limit_amount
     FROM budget b
     WHERE b.b_mnth = TO_DATE($1, 'YYYY-MM')
     AND NOT EXISTS (
       SELECT 1 FROM budget existing
       WHERE existing.user_id = b.user_id AND existing.b_mnth = TO_DATE($2, 'YYYY-MM')
     ) RETURNING b_id`,
    [fromMonth, toMonth]
  );
  return result.rowCount || 0;
};

export { ensureArchiveTable, getMonthBounds };
