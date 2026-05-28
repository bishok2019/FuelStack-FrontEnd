import { useState } from 'react';
import { Plus } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { useCreateUser, useUpdateUser, useUsers } from '../../hooks/useUsers';
import usePaginationParams from '../../hooks/usePaginationParams';
import { nameOf, rowsOf, totalOf } from '../../utils/data';

const initialForm = { username: '', email: '', password: '', user_type: 'SYSTEM', is_active: true, is_superuser: false };

export default function UsersPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const users = useUsers({ page, page_size: pageSize });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const save = (event) => {
    event.preventDefault();
    createUser.mutate(form, { onSuccess: () => { setForm(initialForm); setModal(false); } });
  };

  const toggle = (row, field) => {
    updateUser.mutate({ id: row.id, payload: { [field]: !row[field] } });
  };

  const columns = [
    { key: 'username', header: 'User', render: (row) => <span className="font-semibold text-slate-900">{nameOf(row)}</span> },
    { key: 'email', header: 'Email', render: (row) => row.email || '-' },
    { key: 'user_type', header: 'Type', render: (row) => row.user_type || '-' },
    { key: 'is_active', header: 'Active', render: (row) => <button onClick={() => toggle(row, 'is_active')}><Badge tone={row.is_active === false ? 'inactive' : 'active'}>{row.is_active === false ? 'Inactive' : 'Active'}</Badge></button> },
    { key: 'is_superuser', header: 'Superuser', render: (row) => <button onClick={() => toggle(row, 'is_superuser')}><Badge tone={row.is_superuser ? 'active' : 'inactive'}>{row.is_superuser ? 'Yes' : 'No'}</Badge></button> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-950">Users</h1><p className="mt-1 text-sm text-slate-500">Manage system users and access flags.</p></div>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Add user</button>
      </div>
      {users.isLoading ? <LoadingState label="Loading users" /> : null}
      {users.isError ? <ErrorState error={users.error} /> : null}
      {!users.isLoading && !users.isError ? <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><Table columns={columns} data={rowsOf(users.data)} /><Pagination page={page} pageSize={pageSize} total={totalOf(users.data)} onPageChange={setPage} onPageSizeChange={setPageSize} /></div> : null}
      <Modal open={modal} title="Add system user" onClose={() => setModal(false)}>
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label">Username<input className="input mt-1" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label>
            <label className="label">Email<input className="input mt-1" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
            <label className="label">Password<input className="input mt-1" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
            <label className="label">User type<select className="input mt-1" value={form.user_type} onChange={(event) => setForm({ ...form, user_type: event.target.value })}><option value="SYSTEM">SYSTEM</option><option value="CUSTOMER">CUSTOMER</option></select></label>
          </div>
          <div className="flex gap-5"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_superuser} onChange={(event) => setForm({ ...form, is_superuser: event.target.checked })} /> Superuser</label></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
