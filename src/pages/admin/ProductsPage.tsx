import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import Table from '../../components/Table';
import { useBrands } from '../../hooks/useDealers';
import { useCreateProduct, useProductCategories, useProducts, useUpdateProduct } from '../../hooks/useProducts';
import usePaginationParams from '../../hooks/usePaginationParams';
import { currency, nameOf, rowsOf, totalOf } from '../../utils/data';
import { booleanParam, cleanParams } from '../../utils/query';

const initialForm = { name: '', description: '', price: '', brand_id: '', category_id: '', is_active: true };
const initialFilters = { search: '', category_id: '', brand_id: '', is_active: '' };
const statusOptions = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function ProductsPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [categoryOptionsEnabled, setCategoryOptionsEnabled] = useState(false);
  const [brandOptionsEnabled, setBrandOptionsEnabled] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const products = useProducts(cleanParams({
    page,
    page_size: pageSize,
    search: appliedFilters.search,
    category_id: appliedFilters.category_id,
    brand_id: appliedFilters.brand_id,
    is_active: booleanParam(appliedFilters.is_active),
  }));
  const categories = useProductCategories(
    { page: 1, page_size: 100 },
    { enabled: categoryOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const brands = useBrands(
    { page: 1, page_size: 100 },
    { enabled: brandOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

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
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-5 overflow-hidden sm:h-[calc(100vh-7rem)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Create and maintain the product catalog.</p>
        </div>
        <button className="btn-primary" onClick={() => openForm()}><Plus className="h-4 w-4" /> Add product</button>
      </div>
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_180px_auto]" onSubmit={applyFilters}>
        <label className="label">
          Search
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Product name" value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} />
          </div>
        </label>
        <label className="label">Category<SearchableSelect className="mt-1" value={draftFilters.category_id} options={[{ value: '', label: 'All categories' }, ...rowsOf(categories.data).map((category) => ({ value: category.id, label: nameOf(category) }))]} onOpen={() => setCategoryOptionsEnabled(true)} onChange={(value) => setDraftFilters({ ...draftFilters, category_id: value })} placeholder="All categories" searchPlaceholder="Search categories" /></label>
        <label className="label">Brand<SearchableSelect className="mt-1" value={draftFilters.brand_id} options={[{ value: '', label: 'All brands' }, ...rowsOf(brands.data).map((brand) => ({ value: brand.id, label: nameOf(brand) }))]} onOpen={() => setBrandOptionsEnabled(true)} onChange={(value) => setDraftFilters({ ...draftFilters, brand_id: value })} placeholder="All brands" searchPlaceholder="Search brands" /></label>
        <label className="label">Status<SearchableSelect className="mt-1" value={draftFilters.is_active} options={statusOptions} onChange={(value) => setDraftFilters({ ...draftFilters, is_active: value })} placeholder="Any" searchPlaceholder="Search status" /></label>
        <div className="flex items-end gap-2"><button className="btn-primary" type="submit"><Search className="h-4 w-4" /> Apply</button><button className="btn-secondary px-3" type="button" onClick={clearFilters} aria-label="Clear filters"><X className="h-4 w-4" /></button></div>
      </form>
      {products.isLoading ? <LoadingState label="Loading products" /> : null}
      {products.isError ? <ErrorState error={products.error} /> : null}
      {!products.isLoading && !products.isError ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table
            columns={columns}
            data={rowsOf(products.data)}
            containerClassName="min-h-0 flex-1 rounded-none border-0"
            scrollClassName="h-full overflow-auto"
            stickyHeader
          />
          <Pagination page={page} pageSize={pageSize} total={totalOf(products.data)} meta={products.data?.meta} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : null}
      <Modal open={modal} title={editing ? 'Edit product' : 'Add product'} onClose={() => setModal(false)}>
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label">Name<input className="input mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label className="label">Price<input className="input mt-1" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
            <label className="label">Brand<select className="input mt-1" value={form.brand_id} onFocus={() => setBrandOptionsEnabled(true)} onChange={(event) => setForm({ ...form, brand_id: event.target.value })}><option value="">Select brand</option>{rowsOf(brands.data).map((brand) => <option key={brand.id} value={brand.id}>{nameOf(brand)}</option>)}</select></label>
            <label className="label">Category<select className="input mt-1" value={form.category_id} onFocus={() => setCategoryOptionsEnabled(true)} onChange={(event) => setForm({ ...form, category_id: event.target.value })}><option value="">Select category</option>{rowsOf(categories.data).map((category) => <option key={category.id} value={category.id}>{nameOf(category)}</option>)}</select></label>
          </div>
          <label className="label block">Description<textarea className="input mt-1 min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
