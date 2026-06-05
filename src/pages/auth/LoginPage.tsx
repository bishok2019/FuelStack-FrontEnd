import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { login } from '../../api/auth';
import { isSystemUser, useAuthStore } from '../../store/authStore';
import { messageOf } from '../../utils/errors';
export default function LoginPage() {
  const navigate = useNavigate();
  const { token, userType, setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const jwt = data?.access_token || data?.token || data?.jwt;
      const refreshToken = data?.refresh_token || data?.refreshToken || data?.refresh;
      if (!jwt) return;
      setAuth(jwt, refreshToken, data?.user);
      const nextUserType = useAuthStore.getState().userType;
      navigate(isSystemUser(nextUserType) ? '/admin/dashboard' : '/', { replace: true });
    },
  });

  if (token) return <Navigate to={isSystemUser(userType) ? '/admin/dashboard' : '/'} replace />;

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-2xl font-bold">FuelStack</div>
        <div>
          <h1 className="max-w-xl text-5xl font-bold leading-tight">Distribution, delivery, and operations in one clean workspace.</h1>
          <p className="mt-5 max-w-lg text-blue-100">Manage customers, orders, inventory, hubs, and payment workflows from a fast React frontend.</p>
        </div>
        <p className="text-sm text-blue-100">Built for teams that need product movement to stay visible.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue to FuelStack.</p>
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
            <div>
              <label className="label">Username</label>
              <input className="input mt-1" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input mt-1" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </div>
            {mutation.isError ? <p className="text-sm text-rose-600">{messageOf(mutation.error, 'Login failed.')}</p> : null}
            <button className="btn-primary w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Login
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            New customer? <Link to="/register" className="font-semibold text-primary">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
