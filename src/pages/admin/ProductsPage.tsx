import { useState } from 'react';
import { Plus } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { useBrands } from '../../hooks/useDealers';
import { useCreateProduct, useProductCategories, useProducts, useUpdateProduct } from '../../hooks/useProducts';
import usePaginationParams from '../../hooks/usePaginationParams';
import { currency, nameOf, rowsOf, totalOf } from '../../utils/data';

const initialForm = { name: '', description: '', price: '', brand_id: '', category_id: '', is_active: true };

export default function ProductsPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [categoryId, setCategoryId] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const products = useProducts({ page, page_size: pageSize, category_id: categoryId || undefined });
  const categories = useProductCategories();
  const brands = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const openForm = (row = null) => {
    setEditing(row);
    setForm(row ? {
      name: row.name || '',
      description: row.description || '',
      price: row.price || '',
      brand_id: row.brand_id || row.brand?.id || '',
      category_id: row.category_id || row.category?.id || '',
      is_active: row.is_active ?? true,
    } : initialForm);
    setModal(true);
  };

  const save = (event) => {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price), is_active: Boolean(form.is_active) };
    const action = editing ? updateProduct.mutateAsync({ id: editing.id, payload }) : createProduct.mutateAsync(payload);
    action.then(() => setModal(false));
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-semibold text-slate-900">{nameOf(row)}</span> },
    { key: 'category', header: 'Category', render: (row) => nameOf(row.category, row.category_name || '-') },
    { key: 'brand', header: 'Brand', render: (row) => nameOf(row.brand, row.brand_name || '-') },
    { key: 'price', header: 'Price', render: (row) => currency(row.price) },
    { key: 'active', header: 'Status', render: (row) => <Badge tone={row.is_active === false ? 'inactive' : 'active'}>{row.is_active === false ? 'Inactive' : 'Active'}</Badge> },
    { key: 'action', header: '', render: (row) => <button className="btn-secondary" onClick={() => openForm(row)}>Edit</button> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Create and maintain the product catalog.</p>
        </div>
        <button className="btn-primary" onClick={() => openForm()}><Plus className="h-4 w-4" /> Add product</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={`rounded-full px-3 py-1 text-sm font-semibold ${categoryId === '' ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`} onClick={() => setCategoryId('')}>All</button>
        {rowsOf(categories.data).map((category) => (
          <button key={category.id} className={`rounded-full px-3 py-1 text-sm font-semibold ${String(categoryId) === String(category.id) ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`} onClick={() => setCategoryId(category.id)}>{nameOf(category)}</button>
        ))}
      </div>
      {products.isLoading ? <LoadingState label="Loading products" /> : null}
      {products.isError ? <ErrorState error={products.error} /> : null}
      {!products.isLoading && !products.isError ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table columns={columns} data={rowsOf(products.data)} />
          <Pagination page={page} pageSize={pageSize} total={totalOf(products.data)} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : null}
      <Modal open={modal} title={editing ? 'Edit product' : 'Add product'} onClose={() => setModal(false)}>
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label">Name<input className="input mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label className="label">Price<input className="input mt-1" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
            <label className="label">Brand<select className="input mt-1" value={form.brand_id} onChange={(event) => setForm({ ...form, brand_id: event.target.value })}><option value="">Select brand</option>{rowsOf(brands.data).map((brand) => <option key={brand.id} value={brand.id}>{nameOf(brand)}</option>)}</select></label>
            <label className="label">Category<select className="input mt-1" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}><option value="">Select category</option>{rowsOf(categories.data).map((category) => <option key={category.id} value={category.id}>{nameOf(category)}</option>)}</select></label>
          </div>
          <label className="label block">Description<textarea className="input mt-1 min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
