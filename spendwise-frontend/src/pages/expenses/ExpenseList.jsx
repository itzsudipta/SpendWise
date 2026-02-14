import React, { useEffect, useState } from 'react';
import { createExpense, deleteExpense, getExpenseDetails } from '../../api/expenseService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Card, Button } from '../../components/ui/BaseComponents';
import ExpenseModal from './ExpenseModal';
import { useAuth } from '../../hooks/useAuth';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const currentUserId = Number(user?.user_id || 1);

  const load = async () => {
    const res = await getExpenseDetails();
    const filtered = (res?.data || [])
      .filter((row) => Number(row.user_id) === currentUserId)
      .sort((a, b) => {
        const dateDiff = new Date(b.ex_data) - new Date(a.ex_data);
        if (dateDiff !== 0) return dateDiff;
        return Number(b.ex_id) - Number(a.ex_id);
      })
      .map((row, index) => ({
        ...row,
        serial_no: index + 1,
      }));
    setExpenses(filtered);
  };

  useEffect(() => {
    load().catch(() => setExpenses([]));
  }, [currentUserId]);

  const onCreate = async (payload) => {
    await createExpense(payload);
    await load();
  };

  const onDelete = async (id) => {
    await deleteExpense(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Expenses</h3>
        <Button onClick={() => setOpen(true)}>Add Expense</Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-3">#</th>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => (
              <tr key={item.ex_id} className="border-b">
                <td className="p-3 font-medium text-gray-600">{item.serial_no}</td>
                <td className="p-3">{formatDate(item.ex_data)}</td>
                <td className="p-3">{item.ex_desc || '-'}</td>
                <td className="p-3">{item.category_name || '-'}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.ex_type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.ex_type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="p-3">{item.ex_type === 'income' ? '+' : '-'}{formatCurrency(item.ex_amount)}</td>
                <td className="p-3"><Button variant="danger" onClick={() => onDelete(item.ex_id)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ExpenseModal open={open} onClose={() => setOpen(false)} onSubmit={onCreate} />
    </div>
  );
}
