import cron from 'node-cron';
import {
  carryForwardBudgetsToMonth,
  ensureArchiveTable,
  getNextMonth,
  getPreviousMonth,
  getUsersForMonth,
  isCompletedMonth,
  saveAutoMonthlyReport,
  validateMonth,
} from './reportService.js';

const runMonthEndAutoReports = async (month) => {
  if (!validateMonth(month) || !isCompletedMonth(month)) {
    return;
  }

  await ensureArchiveTable();
  const users = await getUsersForMonth(month);
  for (const userId of users) {
    try {
      await saveAutoMonthlyReport(userId, month);
      console.log(`[auto-report] generated for user ${userId}, month ${month}`);
    } catch (err) {
      console.error(`[auto-report] failed for user ${userId}, month ${month}: ${err.message}`);
    }
  }

  const carryForwardEnabled = process.env.AUTO_REPORTS_CARRY_FORWARD === 'true';
  if (carryForwardEnabled) {
    const nextMonth = getNextMonth(month);
    const copiedCount = await carryForwardBudgetsToMonth(month, nextMonth);
    console.log(`[auto-report] carried forward ${copiedCount} budget(s) from ${month} to ${nextMonth}`);
  } else {
    console.log('[auto-report] carry-forward disabled via AUTO_REPORTS_CARRY_FORWARD=false');
  }
};

export const startAutoReportScheduler = () => {
  const enabled = process.env.AUTO_REPORTS_ENABLED !== 'false';
  if (!enabled) {
    console.log('[auto-report] scheduler disabled via AUTO_REPORTS_ENABLED=false');
    return;
  }

  cron.schedule('5 0 1 * *', async () => {
    const targetMonth = getPreviousMonth();
    await runMonthEndAutoReports(targetMonth);
  });

  console.log('[auto-report] scheduler started (runs at 00:05 on day 1 of each month)');
};

export const runAutoReportsNowForPreviousMonth = async () => {
  const targetMonth = getPreviousMonth();
  await runMonthEndAutoReports(targetMonth);
};
