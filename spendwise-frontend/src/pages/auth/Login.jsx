import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/userService';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const users = await getUsers();
      const found = (users?.data || []).find(
        (u) => u.user_email === email && u.user_password === password
      );
      if (!found) {
        setStatus('Invalid email or password');
        return;
      }
      login({
        user_id: found.user_id,
        name: found.user_name,
        email: found.user_email,
      });
      setStatus('Login successful');
      navigate('/');
    } catch {
      setStatus('Unable to login right now');
    }
  };

  return (
    <form className="mx-auto mt-20 max-w-md space-y-3 rounded-2xl bg-white p-6" onSubmit={submit}>
      <h2 className="text-xl font-bold">Login</h2>
      <input className="w-full rounded-lg border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full rounded-lg border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button className="w-full rounded-lg bg-brand py-2 text-white" type="submit">Continue</button>
      <p className="text-sm text-gray-500">{status}</p>
      <p className="text-sm text-gray-500">
        No account? <Link to="/signup" className="text-brand">Create one</Link>
      </p>
    </form>
  );
}
