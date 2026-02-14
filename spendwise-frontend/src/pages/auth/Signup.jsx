import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../../api/userService';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createUser(form);
      setStatus('User created. Redirecting to login...');
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 700);
    } catch {
      setStatus('Unable to create user right now');
    }
  };

  return (
    <form className="mx-auto mt-20 max-w-md space-y-3 rounded-2xl bg-white p-6" onSubmit={submit}>
      <h2 className="text-xl font-bold">Signup</h2>
      <input className="w-full rounded-lg border p-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full rounded-lg border p-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full rounded-lg border p-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full rounded-lg bg-brand py-2 text-white" type="submit">Create account</button>
      <p className="text-sm text-gray-500">{status}</p>
      <p className="text-sm text-gray-500">
        Have an account? <Link to="/login" className="text-brand">Login</Link>
      </p>
    </form>
  );
}
