import React, { useEffect, useMemo, useState } from 'react';
import { Card, Badge } from '../../components/ui/BaseComponents';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { getExpenseDetails } from '../../api/expenseService';
import { getBudgetsByUser } from '../../api/budgetService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import { getUserById, updateUserBankBalance } from '../../api/userService';

const DEFAULT_TX_TYPE = 'expense';
const isIncomeTx = (tx) => (tx.ex_type || DEFAULT_TX_TYPE) === 'income';
const sumAmount = (rows) => rows.reduce((sum, row) => sum + Number(row.ex_amount || 0), 0);

const getLocalMonth = () => {
  const now = new Date();
  const tzAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().slice(0, 7);
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [openingBalanceInput, setOpeningBalanceInput] = useState('');
  const [isEditingOpeningBalance, setIsEditingOpeningBalance] = useState(false);
  const [balanceStatus, setBalanceStatus] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();
  const currentUserId = Number(user?.user_id || 1);
  const currentMonth = getLocalMonth();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [expenseRes, budgetRes, userRes] = await Promise.allSettled([
        getExpenseDetails(),
        getBudgetsByUser(currentUserId),
        getUserById(currentUserId),
      ]);

      if (!mounted) return;

      if (expenseRes.status === 'fulfilled') {
        setExpenses(expenseRes.value?.data || []);
      } else {
        setExpenses([]);
        console.error('Dashboard fetch failed: expenses', expenseRes.reason);
      }

      if (budgetRes.status === 'fulfilled') {
        setBudgets(budgetRes.value?.data || []);
      } else {
        setBudgets([]);
        console.error('Dashboard fetch failed: budgets', budgetRes.reason);
      }

      if (userRes.status === 'fulfilled') {
        const opening = Number(userRes.value?.data?.bank_opening_balance || 0);
        setOpeningBalance(opening);
        if (!isEditingOpeningBalance) {
          setOpeningBalanceInput(String(opening));
        }
      } else {
        console.error('Dashboard fetch failed: user', userRes.reason);
      }
    };
    load().catch(() => {
      if (!mounted) return;
      console.error('Dashboard load failed');
    });

    const id = setInterval(() => {
      load().catch(() => {});
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [currentUserId, isEditingOpeningBalance]);

  const userMonthExpenses = useMemo(
    () =>
      expenses
        .filter(
          (tx) => Number(tx.user_id) === currentUserId && String(tx.ex_data || '').startsWith(currentMonth)
        )
        .sort((a, b) => {
          const dateDiff = new Date(b.ex_data) - new Date(a.ex_data);
          if (dateDiff !== 0) return dateDiff;
          return Number(b.ex_id) - Number(a.ex_id);
        }),
    [expenses, currentMonth, currentUserId]
  );

  const totalSpent = useMemo(() => sumAmount(userMonthExpenses.filter((tx) => !isIncomeTx(tx))), [userMonthExpenses]);

  const totalIncome = useMemo(() => sumAmount(userMonthExpenses.filter((tx) => isIncomeTx(tx))), [userMonthExpenses]);

  const monthlyBudget = useMemo(() => {
    return budgets
      .filter((budget) => budget.b_mnth === currentMonth)
      .reduce((sum, budget) => sum + Number(budget.limit_amount || 0), 0);
  }, [budgets, currentMonth]);

  const remaining = useMemo(() => monthlyBudget - totalSpent, [monthlyBudget, totalSpent]);

  const allUserTransactions = useMemo(
    () => expenses.filter((tx) => Number(tx.user_id) === currentUserId),
    [expenses, currentUserId]
  );
  const totalIncomeAll = useMemo(() => sumAmount(allUserTransactions.filter((tx) => isIncomeTx(tx))), [allUserTransactions]);
  const totalExpenseAll = useMemo(() => sumAmount(allUserTransactions.filter((tx) => !isIncomeTx(tx))), [allUserTransactions]);
  const currentBalance = useMemo(
    () => openingBalance + totalIncomeAll - totalExpenseAll,
    [openingBalance, totalIncomeAll, totalExpenseAll]
  );

  const saveOpeningBalance = async () => {
    try {
      const nextValue = Number(openingBalanceInput);
      if (Number.isNaN(nextValue)) {
        setBalanceStatus('Enter a valid number');
        return;
      }
      await updateUserBankBalance(currentUserId, nextValue);
      setOpeningBalance(nextValue);
      setBalanceStatus('Opening balance updated');
    } catch (err) {
      setBalanceStatus(err?.response?.data?.message || 'Failed to update balance');
    }
  };

  const trendData = useMemo(() => {
    const map = new Map();
    userMonthExpenses.forEach((item) => {
      if (isIncomeTx(item)) return;
      const key = item.category_name || 'Uncategorized';
      map.set(key, (map.get(key) || 0) + Number(item.ex_amount || 0));
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [userMonthExpenses]);

  const pieColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#14B8A6'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm font-medium text-gray-500">Monthly Income</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</h3>
            <span className="text-emerald-500 text-sm font-bold flex items-center">Live <TrendingUp size={14} /></span>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Total Spent</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-3xl font-bold">{formatCurrency(totalSpent)}</h3>
            <span className="text-rose-500 text-sm font-bold flex items-center">Live <TrendingUp size={14} /></span>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Monthly Budget</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-3xl font-bold">{formatCurrency(monthlyBudget)}</h3>
            <Badge status="success">Connected</Badge>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Current Balance</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className={`text-3xl font-bold ${currentBalance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatCurrency(currentBalance)}
            </h3>
            <ArrowUpRight className={currentBalance < 0 ? 'text-rose-400' : 'text-emerald-500'} />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded-lg border px-2 py-1 text-sm"
              type="number"
              step="0.01"
              value={openingBalanceInput}
              onChange={(e) => setOpeningBalanceInput(e.target.value)}
              onFocus={() => setIsEditingOpeningBalance(true)}
              onBlur={() => setIsEditingOpeningBalance(false)}
              placeholder="Opening Bank Balance"
            />
            <button className="rounded-lg bg-brand px-3 py-1 text-sm font-semibold text-white" onClick={saveOpeningBalance} type="button">
              Save
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">{balanceStatus || `Remaining this month: ${formatCurrency(remaining)}`}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <h4 className="font-bold text-gray-800 mb-6">Spend Analysis</h4>
          <div className="h-72 w-full min-w-0">
            {trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No spend data for this month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                <PieChart>
                  <Pie
                    data={trendData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 45 : 65}
                    outerRadius={isMobile ? 78 : 105}
                    paddingAngle={2}
                    labelLine={!isMobile}
                    label={
                      isMobile
                        ? false
                        : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {trendData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {trendData.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {trendData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <h4 className="font-bold text-gray-800 mb-6">Recent Transactions</h4>
          <div className="space-y-6">
            {userMonthExpenses.slice(0, 4).map((item) => (
              <div key={item.ex_id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{item.ex_desc || 'Expense'}</p>
                  <p className="text-xs text-gray-400">{item.category_name || 'General'}</p>
                </div>
                <span className={`font-bold ${isIncomeTx(item) ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {isIncomeTx(item) ? '+' : '-'}{formatCurrency(item.ex_amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
