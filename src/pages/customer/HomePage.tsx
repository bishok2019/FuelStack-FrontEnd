import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import { useProductCategories, useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { currency, nameOf, productPrice, rowsOf } from '../../utils/data';

export default function HomePage() {
  const products = useProducts({ page: 1, page_size: 8, is_active: true });
  const categories = useProductCategories({ page: 1, page_size: 100, is_active: true }, { staleTime: 5 * 60 * 1000 });
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <Badge tone="Processing">FuelStack Customer Portal</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              Order products from trusted dealers and track every delivery.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Browse categories, build a cart, choose a payment method, and keep your order history visible from one simple workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/products">
                Shop products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="btn-secondary" to="/orders">View orders</Link>
            </div>
          </div>
          <div className="grid min-h-72 grid-cols-2 gap-3 rounded-lg bg-slate-100 p-3">
            {rowsOf(products.data).slice(0, 4).map((product) => (
              <div key={product.id} className="rounded-md bg-white p-4 shadow-sm">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{nameOf(product)}</p>
                    <p className="mt-2 line-clamp-3 text-xs text-slate-500">{product.description || 'Ready for delivery.'}</p>
                  </div>
                  <p className="mt-4 text-lg font-bold text-primary">{currency(productPrice(product))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {rowsOf(categories.data).map((category) => (
            <span key={category.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
              {nameOf(category)}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary">See all</Link>
        </div>
        {products.isLoading ? <LoadingState label="Loading products" /> : null}
        {products.isError ? <ErrorState error={products.error} /> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rowsOf(products.data).map((product) => (
            <article key={product.id} className="panel p-4">
              <div className="h-28 rounded-md bg-gradient-to-br from-blue-50 via-slate-100 to-emerald-50" />
              <h3 className="mt-4 font-semibold text-slate-950">{nameOf(product)}</h3>
              <p className="mt-1 h-10 text-sm text-slate-500 line-clamp-2">{product.description || 'Available for order.'}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold text-primary">{currency(productPrice(product))}</span>
                <button className="btn-secondary px-3" onClick={() => addItem(product)} aria-label="Add to cart">
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
