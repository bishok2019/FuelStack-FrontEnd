import { useState } from 'react';
import { Loader2, Minus, Plus, Search, Trash2, X } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import SearchableSelect from '../../components/SearchableSelect';
import { useBrands } from '../../hooks/useDealers';
import { useCreateOrder } from '../../hooks/useOrders';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useProductCategories, useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { currency, nameOf, productPrice, rowsOf } from '../../utils/data';
import { messageOf } from '../../utils/errors';
import { cleanParams } from '../../utils/query';

const initialFilters = { search: '', category_id: '', brand_id: '' };

export default function ProductsPage() {
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [categoryOptionsEnabled, setCategoryOptionsEnabled] = useState(false);
  const [brandOptionsEnabled, setBrandOptionsEnabled] = useState(false);
  const [paymentOptionsEnabled, setPaymentOptionsEnabled] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const products = useProducts(cleanParams({ page: 1, page_size: 100, ...appliedFilters, is_active: true }));
  const categories = useProductCategories(
    { page: 1, page_size: 100, is_active: true },
    { enabled: categoryOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const brands = useBrands(
    { page: 1, page_size: 100, is_active: true },
    { enabled: brandOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const paymentMethods = usePaymentMethods(
    { page: 1, page_size: 100, is_active: true },
    { enabled: paymentOptionsEnabled, staleTime: 5 * 60 * 1000 },
  );
  const createOrder = useCreateOrder();
  const { items, addItem, removeItem, updateQty, clearCart, total } = useCartStore();

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

   const placeOrder = () => {
     createOrder.mutate(
       {
         payment_method_id: paymentMethodId || null,
         shipping_address: shippingAddress,
         total_price: total(),
         order_details: items.map((item) => ({ 
           product_id: item.id, 
           quantity: item.quantity,
           unit_price: productPrice(item)
         })),
       },
       { onSuccess: clearCart },
     );
   };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Products</h1>
            <p className="mt-1 text-sm text-slate-500">Browse products and prepare your delivery order.</p>
          </div>
        </div>
        <form className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_auto]" onSubmit={applyFilters}>
          <label className="label">
            Search
            <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input className="input pl-9" placeholder="Search products" value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} />
            </div>
          </label>
          <label className="label">Category<SearchableSelect className="mt-1" value={draftFilters.category_id} options={[{ value: '', label: 'All categories' }, ...rowsOf(categories.data).map((category) => ({ value: category.id, label: nameOf(category) }))]} onOpen={() => setCategoryOptionsEnabled(true)} onChange={(value) => setDraftFilters({ ...draftFilters, category_id: value })} placeholder="All categories" searchPlaceholder="Search categories" /></label>
          <label className="label">Brand<SearchableSelect className="mt-1" value={draftFilters.brand_id} options={[{ value: '', label: 'All brands' }, ...rowsOf(brands.data).map((brand) => ({ value: brand.id, label: nameOf(brand) }))]} onOpen={() => setBrandOptionsEnabled(true)} onChange={(value) => setDraftFilters({ ...draftFilters, brand_id: value })} placeholder="All brands" searchPlaceholder="Search brands" /></label>
          <div className="flex items-end gap-2"><button className="btn-primary" type="submit"><Search className="h-4 w-4" /> Apply</button><button className="btn-secondary px-3" type="button" onClick={clearFilters} aria-label="Clear filters"><X className="h-4 w-4" /></button></div>
        </form>
        <div className="mb-5 flex flex-wrap gap-2">
          <button className={`rounded-full px-3 py-1 text-sm font-semibold ${draftFilters.category_id === '' ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`} onClick={() => setDraftFilters({ ...draftFilters, category_id: '' })}>
            All
          </button>
          {rowsOf(categories.data).map((category) => (
            <button key={category.id} className={`rounded-full px-3 py-1 text-sm font-semibold ${String(category.id) === String(draftFilters.category_id) ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`} onClick={() => setDraftFilters({ ...draftFilters, category_id: category.id })}>
              {nameOf(category)}
            </button>
          ))}
          </div>
        {products.isLoading ? <LoadingState label="Loading products" /> : null}
        {products.isError ? <ErrorState error={products.error} /> : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rowsOf(products.data).map((product) => (
            <article key={product.id} className="panel p-4">
              <div className="flex h-full flex-col">
                <div className="h-32 rounded-md bg-gradient-to-br from-blue-50 via-slate-100 to-emerald-50" />
                <h2 className="mt-4 font-semibold text-slate-950">{nameOf(product)}</h2>
                <p className="mt-1 min-h-10 text-sm text-slate-500 line-clamp-2">{product.description || 'Available for delivery.'}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="font-bold text-primary">{currency(productPrice(product))}</span>
                  <button className="btn-primary" onClick={() => addItem(product)}>Add</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Cart</h2>
          <Badge>{items.length} items</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {items.length ? items.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{nameOf(item)}</p>
                  <p className="text-sm text-slate-500">{currency(productPrice(item))}</p>
                </div>
                <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600" onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="btn-secondary px-2" onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button className="btn-secondary px-2" onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          )) : <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Your cart is empty.</p>}
        </div>
        <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
          <div>
            <label className="label">Payment method</label>
            <select className="input mt-1" value={paymentMethodId} onFocus={() => setPaymentOptionsEnabled(true)} onChange={(event) => setPaymentMethodId(event.target.value)}>
              <option value="">Select method</option>
              {rowsOf(paymentMethods.data).map((method) => (
                <option key={method.id} value={method.id}>{nameOf(method)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Shipping address</label>
            <textarea className="input mt-1 min-h-24" value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Total</span>
            <span className="text-lg font-bold text-slate-950">{currency(total())}</span>
          </div>
          {createOrder.isError ? <p className="text-sm text-rose-600">{messageOf(createOrder.error, 'Order could not be placed.')}</p> : null}
          <button className="btn-primary w-full" disabled={!items.length || !shippingAddress || createOrder.isPending} onClick={placeOrder}>
            {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Place order
          </button>
        </div>
      </aside>
    </div>
  );
}
