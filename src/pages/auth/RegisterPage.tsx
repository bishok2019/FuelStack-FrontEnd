import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { register } from '../../api/auth';
import { messageOf } from '../../utils/errors';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => navigate('/login'),
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Link to="/" className="text-xl font-bold text-primary">FuelStack</Link>
        <h1 className="mt-8 text-2xl font-bold text-slate-950">Create customer account</h1>
        <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
          <div>
            <label className="label">Username</label>
            <input className="input mt-1" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input mt-1" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input mt-1" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </div>
          {mutation.isError ? <p className="text-sm text-rose-600">{messageOf(mutation.error, 'Registration failed.')}</p> : null}
          <button className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Register
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-primary">Login</Link>
        </p>
      </div>
    </main>
  );
}
