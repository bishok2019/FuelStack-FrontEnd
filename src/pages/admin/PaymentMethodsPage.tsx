import { useState } from 'react';
import { Plus } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { useCreatePaymentMethod, usePaymentMethods } from '../../hooks/usePaymentMethods';
import { nameOf, rowsOf } from '../../utils/data';

export default function PaymentMethodsPage() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', is_active: true });
  const paymentMethods = usePaymentMethods();
  const createPaymentMethod = useCreatePaymentMethod();

  const save = (event) => {
    event.preventDefault();
    createPaymentMethod.mutate(form, { onSuccess: () => { setForm({ name: '', code: '', is_active: true }); setModal(false); } });
  };

  const columns = [
    { key: 'name', header: 'Method', render: (row) => <span className="font-semibold text-slate-900">{nameOf(row)}</span> },
    { key: 'code', header: 'Code', render: (row) => row.code || '-' },
    { key: 'active', header: 'Status', render: (row) => <Badge tone={row.is_active === false ? 'inactive' : 'active'}>{row.is_active === false ? 'Inactive' : 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-950">Payment methods</h1><p className="mt-1 text-sm text-slate-500">Configure options customers can select during checkout.</p></div>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Add method</button>
      </div>
      {paymentMethods.isLoading ? <LoadingState label="Loading payment methods" /> : null}
      {paymentMethods.isError ? <ErrorState error={paymentMethods.error} /> : null}
      {!paymentMethods.isLoading && !paymentMethods.isError ? <Table columns={columns} data={rowsOf(paymentMethods.data)} /> : null}
      <Modal open={modal} title="Add payment method" onClose={() => setModal(false)}>
        <form className="space-y-4" onSubmit={save}>
          <label className="label block">Name<input className="input mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label className="label block">Code<input className="input mt-1" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
