import { useParams } from 'react-router-dom';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Table from '../../components/Table';
import { useOrder } from '../../hooks/useOrders';
import { currency, nameOf, orderItemCount, orderLines, orderTotal, statusOf } from '../../utils/data';

const timeline = ['Pending', 'Processing', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = useOrder(id);
  const detail = order.data || {};
  const items = orderLines(detail);
  const status = statusOf(detail);

  const columns = [
    { key: 'product', header: 'Product', render: (row) => nameOf(row.product, row.product_name || row.product_id || '-') },
    { key: 'product_id', header: 'Product ID', render: (row) => row.product_id || row.product?.id || '-' },
    { key: 'quantity', header: 'Qty', render: (row) => row.quantity || row.qty || 1 },
    { key: 'price', header: 'Unit price', render: (row) => currency(row.unit_price || row.price || row.product?.price) },
    { key: 'line_total', header: 'Total', render: (row) => currency(row.total_price || row.line_total || (Number(row.quantity || 1) * Number(row.unit_price || row.price || row.product?.price || 0))) },
  ];

  if (order.isLoading) return <LoadingState label="Loading order detail" />;
  if (order.isError) return <div className="mx-auto max-w-7xl px-4 py-8"><ErrorState error={order.error} /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Order #{detail.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{detail.created_at ? new Date(detail.created_at).toLocaleString() : 'Order detail'}</p>
        </div>
        <Badge>{status}</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <Table columns={columns} data={items} />
          <div className="panel p-5">
            <h2 className="font-semibold text-slate-950">Order information</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Customer ID</dt><dd className="text-slate-700">{detail.customer_id || detail.customer?.id || '-'}</dd></div>
              <div><dt className="text-slate-500">Paid</dt><dd className="mt-1"><Badge tone={detail.is_paid ? 'active' : 'inactive'}>{detail.is_paid ? 'Paid' : 'Unpaid'}</Badge></dd></div>
              <div><dt className="text-slate-500">Payment method ID</dt><dd className="text-slate-700">{detail.payment_method_id || detail.payment_method?.id || '-'}</dd></div>
              <div><dt className="text-slate-500">Line items</dt><dd className="text-slate-700">{items.length}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-500">Notes</dt><dd className="text-slate-700">{detail.notes || '-'}</dd></div>
            </dl>
          </div>
          <div className="panel p-5">
            <h2 className="font-semibold text-slate-950">Status timeline</h2>
            <div className="mt-5 space-y-4">
              {timeline.map((step, index) => {
                const active = timeline.indexOf(status) >= index || status === 'Delivered';
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${active ? 'bg-primary' : 'bg-slate-200'}`} />
                    <span className={active ? 'font-semibold text-slate-900' : 'text-slate-500'}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-semibold text-slate-950">Delivery</h2>
            <p className="mt-3 text-sm text-slate-600">{detail.shipping_address || detail.delivery_address || 'No address provided.'}</p>
          </div>
          <div className="panel p-5">
            <h2 className="font-semibold text-slate-950">Payment</h2>
<dl className="mt-3 space-y-2 text-sm">
               <div className="flex justify-between gap-3">
                 <dt className="text-slate-500">Method</dt>
                 <dd className="font-medium text-slate-900">{nameOf(detail.payment_method, detail.payment_method_name || detail.payment_method_id || '-')}</dd>
               </div>
               <div className="flex justify-between gap-3">
                 <dt className="text-slate-500">Items</dt>
                 <dd className="text-slate-700">{orderItemCount(detail)}</dd>
               </div>
               <div className="flex justify-between gap-3">
                 <dt className="text-slate-500">Total</dt>
                 <dd className="font-bold text-slate-950">{currency(orderTotal(detail))}</dd>
               </div>
             </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
