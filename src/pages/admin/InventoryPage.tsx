import { useState } from 'react';
import { Edit, Plus } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { useHubs } from '../../hooks/useDealers';
import { useCreateInventory, useInventory, useUpdateInventory } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import usePaginationParams from '../../hooks/usePaginationParams';
import { lowStock, nameOf, rowsOf, totalOf } from '../../utils/data';

const initialForm = { hub_id: '', product_id: '', filled_qty: 0, empty_qty: 0, reserved_qty: 0, damaged_qty: 0 };

export default function InventoryPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const inventory = useInventory({ page, page_size: pageSize });
  const hubs = useHubs();
  const products = useProducts({ page: 1, page_size: 100 });
  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory();

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
          <label className="label">Hub<select className="input mt-1" value={form.hub_id} onChange={(event) => setForm({ ...form, hub_id: event.target.value })} required><option value="">Select hub</option>{rowsOf(hubs.data).map((hub) => <option key={hub.id} value={hub.id}>{nameOf(hub)}</option>)}</select></label>
          <label className="label">Product<select className="input mt-1" value={form.product_id} onChange={(event) => setForm({ ...form, product_id: event.target.value })} required><option value="">Select product</option>{rowsOf(products.data).map((product) => <option key={product.id} value={product.id}>{nameOf(product)}</option>)}</select></label>
          {['filled_qty', 'empty_qty', 'reserved_qty', 'damaged_qty'].map((field) => (
            <label key={field} className="label">{field.replace('_', ' ')}<input className="input mt-1" type="number" min="0" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>
          ))}
          <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
