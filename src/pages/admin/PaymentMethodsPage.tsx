import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import Table from '../../components/Table';
import { useCreatePaymentMethod, usePaymentMethods } from '../../hooks/usePaymentMethods';
import usePaginationParams from '../../hooks/usePaginationParams';
import { nameOf, rowsOf, totalOf } from '../../utils/data';
import { booleanParam, cleanParams } from '../../utils/query';

const initialFilters = { search: '', is_active: '' };
const statusOptions = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function PaymentMethodsPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', is_active: true });
  const paymentMethods = usePaymentMethods(cleanParams({
    page,
    page_size: pageSize,
    search: appliedFilters.search,
    is_active: booleanParam(appliedFilters.is_active),
  }));
  const createPaymentMethod = useCreatePaymentMethod();

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  };

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
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_180px_auto]" onSubmit={applyFilters}>
        <label className="label"><span>Search</span><div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="input pl-9" placeholder="Payment method" value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} /></div></label>
        <label className="label">Status<SearchableSelect className="mt-1" value={draftFilters.is_active} options={statusOptions} onChange={(value) => setDraftFilters({ ...draftFilters, is_active: value })} placeholder="Any" searchPlaceholder="Search status" /></label>
        <div className="flex items-end gap-2"><button className="btn-primary" type="submit"><Search className="h-4 w-4" /> Apply</button><button className="btn-secondary px-3" type="button" onClick={clearFilters} aria-label="Clear filters"><X className="h-4 w-4" /></button></div>
      </form>
      {paymentMethods.isLoading ? <LoadingState label="Loading payment methods" /> : null}
      {paymentMethods.isError ? <ErrorState error={paymentMethods.error} /> : null}
      {!paymentMethods.isLoading && !paymentMethods.isError ? <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><Table columns={columns} data={rowsOf(paymentMethods.data)} /><Pagination page={page} pageSize={pageSize} total={totalOf(paymentMethods.data)} meta={paymentMethods.data?.meta} onPageChange={setPage} onPageSizeChange={setPageSize} /></div> : null}
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
