import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { X } from 'lucide-react';
import { useOrders, useOrder } from '../../hooks/useOrders';
import usePaginationParams from '../../hooks/usePaginationParams';
import { currency, nameOf, orderItemCount, orderLines, orderTotal, rowsOf, statusOf, totalOf } from '../../utils/data';
import { useState } from 'react';

const statuses = ['', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

export default function MyOrdersPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const orders = useOrders({ page, page_size: pageSize, status: status || undefined });
  const orderDetail = useOrder(selected?.id);
  const rows = rowsOf(orders.data);
  const detail = orderDetail.data || selected || {};
  const detailLines = orderLines(detail);

  const columns = [
    { key: 'id', header: 'Order', render: (row) => `#${row.id}` },
    { key: 'status', header: 'Status', render: (row) => <Badge>{statusOf(row)}</Badge> },
    { key: 'total_price', header: 'Total price', render: (row) => currency(orderTotal(row)) },
    { key: 'total_item', header: 'Total items', render: (row) => orderItemCount(row) },
    { key: 'created_at', header: 'Placed', render: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : '-' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">My orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track order status, delivery, and payment information.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button key={item || 'all'} className={`rounded-full px-3 py-1 text-sm font-semibold ${status === item ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`} onClick={() => setStatus(item)}>
              {item || 'All'}
            </button>
          ))}
        </div>
      </div>
      {orders.isLoading ? <LoadingState label="Loading orders" /> : null}
      {orders.isError ? <ErrorState error={orders.error} /> : null}
      {!orders.isLoading && !orders.isError ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table columns={columns} data={rows} onRowDoubleClick={setSelected} />
          <Pagination page={page} pageSize={pageSize} total={totalOf(orders.data)} meta={orders.data?.meta} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      ) : null}
      {selected ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30" onClick={() => setSelected(null)}>
          <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">Order #{selected.id}</h2>
              <button className="rounded-md p-2 hover:bg-slate-100" onClick={() => setSelected(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {orderDetail.isLoading ? (
              <LoadingState label="Loading details" />
            ) : orderDetail.isError ? (
              <ErrorState error={orderDetail.error} />
            ) : (
              <div className="mt-6 space-y-6">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-slate-500">Status</dt><dd className="mt-1"><Badge>{statusOf(detail)}</Badge></dd></div>
                  <div><dt className="text-slate-500">Paid</dt><dd className="mt-1"><Badge tone={detail.is_paid ? 'active' : 'inactive'}>{detail.is_paid ? 'Paid' : 'Unpaid'}</Badge></dd></div>
                  <div><dt className="text-slate-500">Payment method</dt><dd className="font-medium text-slate-900">{nameOf(detail.payment_method, detail.payment_method_name || detail.payment_method_id || '-')}</dd></div>
                  <div><dt className="text-slate-500">Total price</dt><dd className="font-semibold text-slate-900">{currency(orderTotal(detail))}</dd></div>
                  <div><dt className="text-slate-500">Total items</dt><dd className="text-slate-700">{orderItemCount(detail) || detailLines.length}</dd></div>
                  <div><dt className="text-slate-500">Shipping address</dt><dd className="text-slate-700">{detail.shipping_address || detail.delivery_address || '-'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-slate-500">Notes</dt><dd className="text-slate-700">{detail.notes || '-'}</dd></div>
                </dl>
                <div>
                  <h3 className="mb-3 font-semibold text-slate-950">Order details</h3>
                  <Table
                    columns={[
                      { key: 'product_id', header: 'Product ID', render: (row) => row.product_id || row.product?.id || '-' },
                      { key: 'quantity', header: 'Qty', render: (row) => row.quantity || row.qty || 1 },
                      { key: 'unit_price', header: 'Unit price', render: (row) => currency(row.unit_price || row.price || row.product?.price) },
                      { key: 'total_price', header: 'Total', render: (row) => currency(row.total_price || row.line_total || (Number(row.quantity || 1) * Number(row.unit_price || row.price || row.product?.price || 0))) },
                    ]}
                    data={detailLines}
                    empty="No order details found."
                  />
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
