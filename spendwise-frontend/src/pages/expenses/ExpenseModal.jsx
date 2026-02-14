import React, { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { getCategoriesByUser } from '../../api/categoryService';

const getLocalDate = () => {
  const now = new Date();
  const tzAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().slice(0, 10);
};

export default function ExpenseModal({ open, onClose, onSubmit }) {
  const { user } = useAuth();
  const defaultUserId = user?.user_id || 1;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    cy_id: '',
    ex_type: 'expense',
    ex_amount: '',
    ex_desc: '',
    ex_data: getLocalDate(),
  });

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      const res = await getCategoriesByUser(defaultUserId);
      const rows = res?.data || [];
      if (!mounted) return;
      setCategories(rows);
      if (rows.length > 0) {
        setForm((prev) => ({ ...prev, cy_id: String(rows[0].cy_id) }));
      }
    };
    loadCategories().catch(() => setCategories([]));
    return () => {
      mounted = false;
    };
  }, [defaultUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expenseDate = form.ex_data || getLocalDate();
    await onSubmit({
      ...form,
      user_id: Number(defaultUserId),
      cy_id: Number(form.cy_id),
      ex_amount: Number(form.ex_amount),
      ex_type: form.ex_type,
      ex_data: expenseDate,
    });
    onClose();
    setForm({
      cy_id: categories[0] ? String(categories[0].cy_id) : '',
      ex_type: 'expense',
      ex_amount: '',
      ex_desc: '',
      ex_data: getLocalDate(),
    });
  };

  return (
    <Modal open={open} title="Add Expense" onClose={onClose}>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="text-sm text-gray-600">Category</label>
        <select
          className="rounded-lg border p-2"
          value={form.cy_id}
          onChange={(e) => setForm({ ...form, cy_id: e.target.value })}
          required
        >
          {categories.length === 0 ? (
            <option value="">No categories available</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.cy_id} value={cat.cy_id}>
                {cat.cy_name}
              </option>
            ))
          )}
        </select>
        <select className="rounded-lg border p-2" value={form.ex_type} onChange={(e) => setForm({ ...form, ex_type: e.target.value })}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input className="rounded-lg border p-2" type="number" step="0.01" placeholder="Amount" value={form.ex_amount} onChange={(e) => setForm({ ...form, ex_amount: e.target.value })} />
        <input className="rounded-lg border p-2" placeholder="Description" value={form.ex_desc} onChange={(e) => setForm({ ...form, ex_desc: e.target.value })} />
        <input className="rounded-lg border p-2" type="date" value={form.ex_data} onChange={(e) => setForm({ ...form, ex_data: e.target.value })} />
        <p className="text-xs text-gray-500">Date defaults to your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
        <button className="rounded-lg bg-brand px-4 py-2 text-white" type="submit">Save</button>
      </form>
    </Modal>
  );
}
