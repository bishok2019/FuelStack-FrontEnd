import { useState } from 'react';
import { Edit, Plus, Search, X } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import Table from '../../components/Table';
import { useHubs } from '../../hooks/useDealers';
import { useCreateInventory, useInventory, useUpdateInventory } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import usePaginationParams from '../../hooks/usePaginationParams';
import { lowStock, nameOf, rowsOf, totalOf } from '../../utils/data';
import { booleanParam, cleanParams } from '../../utils/query';

const initialForm = { hub_id: '', product_id: '', filled_qty: 0, empty_qty: 0, reserved_qty: 0, damaged_qty: 0 };
const initialFilters = { search: '', product_id: '', hub_id: '', is_active: '' };
const statusOptions = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function InventoryPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [productOptionsEnabled, setProductOptionsEnabled] = useState(false);
  const [hubOptionsEnabled, setHubOptionsEnabled] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const inventory = useInventory(cleanParams({
    page,
    page_size: pageSize,
    search: appliedFilters.search,
    product_id: appliedFilters.product_id,
    hub_id: appliedFilters.hub_id,
    is_active: booleanParam(appliedFilters.is_active),
  }));
  const hubs = useHubs(
    { page: 1, page_size: 100 },
    { enabled: hubOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const products = useProducts(
    { page: 1, page_size: 100 },
    { enabled: productOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory();

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

  const openForm = (row = null) => {
    setEditing(row);
    setForm(row ? {
      hub_id: row.hub_id || row.hub?.id || '',
      product_id: row.product_id || row.product?.id || '',
      filled_qty: row.filled_qty || 0,
      empty_qty: row.empty_qty || 0,
      reserved_qty: row.reserved_qty || 0,
      damaged_qty: row.damaged_qty || 0,
    } : initialForm);
    setModal(true);
  };

  const save = (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, Number(value) || value]));
    const action = editing ? updateInventory.mutateAsync({ id: editing.id, payload }) : createInventory.mutateAsync(payload);
    action.then(() => setModal(false));
  };

  const columns = [
    { key: 'hub', header: 'Hub', render: (row) => nameOf(row.hub, row.hub_name || '-') },
    { key: 'product', header: 'Product', render: (row) => nameOf(row.product, row.product_name || '-') },
    { key: 'filled_qty', header: 'Filled', render: (row) => row.filled_qty || row.filled_quantity || 0 },
    { key: 'empty_qty', header: 'Empty', render: (row) => row.empty_qty || row.empty_quantity || 0 },
    { key: 'reserved_qty', header: 'Reserved', render: (row) => row.reserved_qty || row.reserved_quantity || 0 },
    { key: 'damaged_qty', header: 'Damaged', render: (row) => row.damaged_qty || row.damaged_quantity || 0 },
    {
      key: 'level',
      header: 'Stock level',
      render: (row) => {
        const filled = Number(row.filled_qty || row.filled_quantity || 0);
        const reserved = Number(row.reserved_qty || row.reserved_quantity || 0);
        const pct = Math.max(0, Math.min(100, ((filled - reserved) / Math.max(filled, 1)) * 100));
        return <div className="h-2 w-32 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>;
      },
    },
    { key: 'badge', header: 'State', render: (row) => <Badge tone={lowStock(row) ? 'low' : 'good'}>{lowStock(row) ? 'Low' : 'Good'}</Badge> },
    { key: 'actions', header: '', render: (row) => <button className="btn-secondary px-3" onClick={(event) => { event.stopPropagation(); openForm(row); }}><Edit className="h-4 w-4" /> Edit</button> },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-5 overflow-hidden sm:h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Track filled, empty, reserved, and damaged quantities by hub.</p>
        </div>
        <button className="btn-primary" onClick={() => openForm()}><Plus className="h-4 w-4" /> Add record</button>
      </div>
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_180px_auto]" onSubmit={applyFilters}>
        <label className="label">
          Search
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Inventory" value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} />
          </div>
        </label>
        <label className="label">Product<SearchableSelect className="mt-1" value={draftFilters.product_id} options={[{ value: '', label: 'All products' }, ...rowsOf(products.data).map((product) => ({ value: product.id, label: nameOf(product) }))]} onOpen={() => setProductOptionsEnabled(true)} onChange={(value) => setDraftFilters({ ...draftFilters, product_id: value })} placeholder="All products" searchPlaceholder="Search products" /></label>
        <label className="label">Hub<SearchableSelect className="mt-1" value={draftFilters.hub_id} options={[{ value: '', label: 'All hubs' }, ...rowsOf(hubs.data).map((hub) => ({ value: hub.id, label: nameOf(hub) }))]} onOpen={() => setHubOptionsEnabled(true)} onChange={(value) => setDraftFilters({ ...draftFilters, hub_id: value })} placeholder="All hubs" searchPlaceholder="Search hubs" /></label>
        <label className="label">Status<SearchableSelect className="mt-1" value={draftFilters.is_active} options={statusOptions} onChange={(value) => setDraftFilters({ ...draftFilters, is_active: value })} placeholder="Any" searchPlaceholder="Search status" /></label>
        <div className="flex items-end gap-2"><button className="btn-primary" type="submit"><Search className="h-4 w-4" /> Apply</button><button className="btn-secondary px-3" type="button" onClick={clearFilters} aria-label="Clear filters"><X className="h-4 w-4" /></button></div>
      </form>
      {inventory.isLoading ? <LoadingState label="Loading inventory" /> : null}
      {inventory.isError ? <ErrorState error={inventory.error} /> : null}
      {!inventory.isLoading && !inventory.isError ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table
            columns={columns}
            data={rowsOf(inventory.data)}
            containerClassName="min-h-0 flex-1 rounded-none border-0"
            scrollClassName="h-full overflow-auto"
            stickyHeader
          />
          <Pagination page={page} pageSize={pageSize} total={totalOf(inventory.data)} meta={inventory.data?.meta} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : null}
      <Modal open={modal} title={editing ? 'Edit inventory record' : 'Add inventory record'} onClose={() => setModal(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <label className="label">Hub<select className="input mt-1" value={form.hub_id} onFocus={() => setHubOptionsEnabled(true)} onChange={(event) => setForm({ ...form, hub_id: event.target.value })} required><option value="">Select hub</option>{rowsOf(hubs.data).map((hub) => <option key={hub.id} value={hub.id}>{nameOf(hub)}</option>)}</select></label>
          <label className="label">Product<select className="input mt-1" value={form.product_id} onFocus={() => setProductOptionsEnabled(true)} onChange={(event) => setForm({ ...form, product_id: event.target.value })} required><option value="">Select product</option>{rowsOf(products.data).map((product) => <option key={product.id} value={product.id}>{nameOf(product)}</option>)}</select></label>
          {['filled_qty', 'empty_qty', 'reserved_qty', 'damaged_qty'].map((field) => (
            <label key={field} className="label">{field.replace('_', ' ')}<input className="input mt-1" type="number" min="0" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>
          ))}
          <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
