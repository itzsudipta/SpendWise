import express from 'express';
import {
  generateLiveMonthlyReport,
  getAutoMonthlyReportBuffer,
  getUsersForMonth,
  isCompletedMonth,
  saveAutoMonthlyReport,
  validateMonth,
} from '../services/reportService.js';

const router = express.Router();

const parseUserId = (raw) => Number(raw);

router.get('/monthly/live', async (req, res, next) => {
  const userId = parseUserId(req.query.user_id);
  const month = String(req.query.month || '');

  if (!Number.isFinite(userId)) {
    return res.status(400).json({ status: 400, message: 'user_id is required and must be numeric' });
  }
  if (!validateMonth(month)) {
    return res.status(400).json({ status: 400, message: 'month must be in YYYY-MM format' });
  }

  try {
    const { buffer } = await generateLiveMonthlyReport(userId, month);
    const filename = `SpendWise_Live_Report_User_${userId}_${month}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.post('/monthly/auto/generate', async (req, res, next) => {
  const userId = parseUserId(req.body.user_id);
  const month = String(req.body.month || '');

  if (!Number.isFinite(userId)) {
    return res.status(400).json({ status: 400, message: 'user_id is required and must be numeric' });
  }
  if (!validateMonth(month)) {
    return res.status(400).json({ status: 400, message: 'month must be in YYYY-MM format' });
  }
  if (!isCompletedMonth(month)) {
    return res.status(400).json({ status: 400, message: 'Auto reports are available only for completed months' });
  }

  try {
    const result = await saveAutoMonthlyReport(userId, month);
    res.status(201).json({
      status: 201,
      message: 'Auto monthly report generated',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/monthly/auto', async (req, res, next) => {
  const userId = parseUserId(req.query.user_id);
  const month = String(req.query.month || '');

  if (!Number.isFinite(userId)) {
    return res.status(400).json({ status: 400, message: 'user_id is required and must be numeric' });
  }
  if (!validateMonth(month)) {
    return res.status(400).json({ status: 400, message: 'month must be in YYYY-MM format' });
  }

  try {
    const fileBuffer = await getAutoMonthlyReportBuffer(userId, month);
    if (!fileBuffer) {
      return res.status(404).json({ status: 404, message: 'Auto monthly report not generated yet' });
    }
    const filename = `SpendWise_Auto_Report_User_${userId}_${month}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
});

router.get('/monthly/auto/users', async (req, res, next) => {
  const month = String(req.query.month || '');
  if (!validateMonth(month)) {
    return res.status(400).json({ status: 400, message: 'month must be in YYYY-MM format' });
  }

  try {
    const users = await getUsersForMonth(month);
    res.status(200).json({
      status: 200,
      message: 'Users fetched for month',
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
