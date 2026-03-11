import React, { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Card, ProgressBar, Button } from '../../components/ui/BaseComponents';
import {
  createBudget,
  deleteBudget,
  getBudgetsByUser,
  updateBudget,
} from '../../api/budgetService';
import { getExpenseDetails } from '../../api/expenseService';
import { useAuth } from '../../hooks/useAuth';
import {
  downloadAutoMonthlyReport,
  downloadLiveMonthlyReport,
  generateAutoMonthlyReport,
} from '../../api/reportService';

const getLocalMonth = () => {
  const now = new Date();
  const tzAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().slice(0, 7);
};

const isCompletedMonth = (month) => month < getLocalMonth();
const DEFAULT_TX_TYPE = 'expense';
const isExpenseTx = (tx) => (tx.ex_type || DEFAULT_TX_TYPE) !== 'income';

export default function Budgets() {
  const [items, setItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const { user } = useAuth();
  const currentUserId = Number(user?.user_id || 1);
  const currentMonth = getLocalMonth();
  const [form, setForm] = useState({
    user_id: currentUserId,
    b_mnth: currentMonth,
    limit_amount: '',
  });

  const load = async () => {
    try {
      const [budgetRes, expenseRes] = await Promise.all([getBudgetsByUser(currentUserId), getExpenseDetails()]);
      const rows = budgetRes?.data || [];
      const expenses = expenseRes?.data || [];
      const summaries = rows.map((row) => {
        const spentAmount = expenses
          .filter(
            (tx) =>
              Number(tx.user_id) === Number(row.user_id) &&
              String(tx.ex_data || '').startsWith(String(row.b_mnth || '')) &&
              isExpenseTx(tx)
          )
          .reduce((sum, tx) => sum + Number(tx.ex_amount || 0), 0);

        const limitAmount = Number(row.limit_amount || 0);
        return {
          ...row,
          spent_amount: spentAmount,
          remaining_amount: limitAmount - spentAmount,
        };
      });
      setItems(summaries);

      const allUserMonths = [...new Set(
        summaries
          .filter((item) => Number(item.user_id) === currentUserId)
          .map((item) => item.b_mnth)
      )].sort().reverse();

      if (!reportMonth) setReportMonth(allUserMonths[0] || getLocalMonth());
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load().catch(() => setItems([]));
    const id = setInterval(() => {
      load().catch(() => setItems([]));
    }, 10000);

    const onFocus = () => load().catch(() => setItems([]));
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentUserId]);

  const addBudget = async (e) => {
    e.preventDefault();
    const existingForMonth = items.find((item) => item.b_mnth === form.b_mnth);
    if (existingForMonth) {
      setStatus(
        `Budget already exists for ${form.b_mnth}. You can only Edit Amount or Delete existing budget.`
      );
      return;
    }

    try {
      await createBudget({
        user_id: currentUserId,
        b_mnth: form.b_mnth,
        limit_amount: Number(form.limit_amount),
      });
      setStatus('Budget created');
      setFormOpen(false);
      setForm((prev) => ({ ...prev, limit_amount: '' }));
      await load();
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Failed to create budget');
    }
  };

  const startEdit = (budget) => {
    setEditingBudgetId(Number(budget.b_id));
    setEditingAmount(String(Number(budget.limit_amount || 0)));
    setStatus('');
  };

  const cancelEdit = () => {
    setEditingBudgetId(null);
    setEditingAmount('');
  };

  const saveEdit = async (budget) => {
    try {
      await updateBudget(Number(budget.b_id), {
        user_id: Number(budget.user_id),
        b_mnth: budget.b_mnth,
        limit_amount: Number(editingAmount),
      });
      setStatus('Budget amount updated. Calculations refreshed automatically.');
      cancelEdit();
      await load();
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Failed to update budget amount.');
    }
  };

  const removeBudget = async (budget) => {
    try {
      await deleteBudget(Number(budget.b_id));
      setStatus('Budget deleted.');
      cancelEdit();
      await load();
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Failed to delete budget.');
    }
  };

  const downloadLiveReport = async () => {
    if (!reportMonth) {
      setReportStatus('Please select a month.');
      return;
    }
    try {
      await downloadLiveMonthlyReport(currentUserId, reportMonth);
      setReportStatus('Live report downloaded from real-time data up to latest expense.');
    } catch (err) {
      setReportStatus(err?.response?.data?.message || 'Failed to download live report.');
    }
  };

  const downloadAutoReport = async () => {
    if (!reportMonth) {
      setReportStatus('Please select a month.');
      return;
    }
    if (!isCompletedMonth(reportMonth)) {
      setReportStatus('Auto report is available only after month completion.');
      return;
    }

    try {
      await downloadAutoMonthlyReport(currentUserId, reportMonth);
      setReportStatus('Auto-generated month-end report downloaded.');
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await generateAutoMonthlyReport(currentUserId, reportMonth);
          await downloadAutoMonthlyReport(currentUserId, reportMonth);
          setReportStatus('Auto report generated and downloaded.');
          return;
        } catch (nestedErr) {
          setReportStatus(nestedErr?.response?.data?.message || 'Failed to generate auto report.');
          return;
        }
      }
      setReportStatus(err?.response?.data?.message || 'Failed to download auto report.');
    }
  };

  const userItems = items;
  const monthKey = (value) => String(value || '').slice(0, 7);
  const uniqueMonths = [...new Set(userItems.map((item) => monthKey(item.b_mnth)).filter(Boolean))].sort();
  const startMonth = uniqueMonths[0] || currentMonth;
  const allUserMonths = [];
  if (startMonth && currentMonth && startMonth <= currentMonth) {
    const [startYear, startMon] = startMonth.split('-').map(Number);
    const [endYear, endMon] = currentMonth.split('-').map(Number);
    let y = startYear;
    let m = startMon;
    while (y < endYear || (y === endYear && m <= endMon)) {
      allUserMonths.push(`${y}-${String(m).padStart(2, '0')}`);
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    allUserMonths.reverse();
  }
  const currentMonthItems = userItems.filter((item) => item.b_mnth === currentMonth);
  const hasAnyBudget = userItems.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Monthly Budgets</h3>
        <Button
          variant="secondary"
          onClick={() => setFormOpen((v) => !v)}
          disabled={hasAnyBudget}
        >
          <PlusCircle size={18} /> New Budget
        </Button>
      </div>

      {hasAnyBudget ? (
        <p className="text-sm text-gray-500">
          New budget creation is disabled because a budget already exists. Edit amount or delete existing budget.
        </p>
      ) : null}

      {formOpen ? (
        <Card>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={addBudget}>
            <input
              className="rounded-lg border p-2"
              type="month"
              value={form.b_mnth}
              onChange={(e) => setForm({ ...form, b_mnth: e.target.value })}
            />
            <input
              className="rounded-lg border p-2"
              type="number"
              step="0.01"
              placeholder="Limit Amount"
              value={form.limit_amount}
              onChange={(e) => setForm({ ...form, limit_amount: e.target.value })}
            />
            <Button type="submit">Save Budget</Button>
          </form>
          <p className="mt-2 text-sm text-gray-500">{status}</p>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-600">Completed Month Report</label>
            <select
              className="w-full rounded-lg border p-2"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
            >
              <option value="">Select month</option>
              {allUserMonths.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <Button onClick={downloadLiveReport} disabled={!reportMonth}>Download Live PDF</Button>
          <Button onClick={downloadAutoReport} disabled={!reportMonth}>Download Auto PDF</Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {reportStatus || 'Live PDF uses current data. Auto PDF is generated after month completion.'}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentMonthItems.map((item) => {
          const spent = Number(item.spent_amount || 0);
          const limit = Number(item.limit_amount || 0);
          const isEditing = editingBudgetId === Number(item.b_id);
          return (
            <Card key={item.b_id} className={spent > limit ? 'ring-2 ring-rose-100' : ''}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">User #{item.user_id}</h4>
                  <p className="text-sm text-gray-400">Month {item.b_mnth}</p>
                </div>
                {spent > limit && (
                  <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-1 rounded-full uppercase tracking-tighter">Over Budget</span>
                )}
              </div>
              <ProgressBar spent={spent} limit={limit} />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      className="rounded-lg border p-2"
                      type="number"
                      step="0.01"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                    />
                    <Button onClick={() => saveEdit(item)}>Save Amount</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => startEdit(item)}>Edit Amount</Button>
                    <Button variant="danger" onClick={() => removeBudget(item)}>Delete</Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {currentMonthItems.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">
            No budget found for current month ({currentMonth}). Create one with the "New Budget" button.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
