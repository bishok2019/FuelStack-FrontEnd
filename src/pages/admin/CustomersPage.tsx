import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { useCustomers } from '../../hooks/useCustomers';
import { useOrders } from '../../hooks/useOrders';
import usePaginationParams from '../../hooks/usePaginationParams';
import { currency, nameOf, orderTotal, rowsOf, statusOf, totalOf } from '../../utils/data';
import Badge from '../../components/Badge';

export default function CustomersPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const customers = useCustomers({ page, page_size: pageSize, search: search || undefined });
  const orders = useOrders({ customer_id: selected?.id, page: 1, page_size: 10 });
  const filtered = useMemo(() => rowsOf(customers.data).filter((customer) => nameOf(customer).toLowerCase().includes(search.toLowerCase())), [customers.data, search]);

  const columns = [
    { key: 'name', header: 'Customer', render: (row) => <span className="font-semibold text-slate-900">{nameOf(row)}</span> },
    { key: 'email', header: 'Email', render: (row) => row.email || '-' },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || row.phone_number || '-' },
    { key: 'actions', header: '', render: (row) => <button className="btn-secondary" onClick={() => setSelected(row)}>View</button> },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-5 overflow-hidden sm:h-[calc(100vh-7rem)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-950">Customers</h1><p className="mt-1 text-sm text-slate-500">Search customers and review their order history.</p></div>
        <div className="relative w-full sm:w-80"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="input pl-9" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      </div>
      {customers.isLoading ? <LoadingState label="Loading customers" /> : null}
      {customers.isError ? <ErrorState error={customers.error} /> : null}
      {!customers.isLoading && !customers.isError ? <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"><Table columns={columns} data={filtered} containerClassName="min-h-0 flex-1 rounded-none border-0" scrollClassName="h-full overflow-auto" stickyHeader /><Pagination page={page} pageSize={pageSize} total={totalOf(customers.data)} meta={customers.data?.meta} onPageChange={setPage} onPageSizeChange={setPageSize} /></div> : null}
      {selected ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30" onClick={() => setSelected(null)}>
          <aside className="ml-auto h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-950">{nameOf(selected)}</h2><button className="rounded-md p-2 hover:bg-slate-100" onClick={() => setSelected(null)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            <p className="mt-1 text-sm text-slate-500">{selected.email || selected.phone || 'Customer detail'}</p>
            <h3 className="mt-6 font-semibold text-slate-950">Order history</h3>
            <div className="mt-3 space-y-3">
              {rowsOf(orders.data).map((order) => <div key={order.id} className="rounded-md border border-slate-200 p-3"><div className="flex justify-between gap-3"><span className="font-semibold">#{order.id}</span><Badge>{statusOf(order)}</Badge></div><p className="mt-2 text-sm text-slate-500">{currency(orderTotal(order))}</p></div>)}
              {!orders.isLoading && !rowsOf(orders.data).length ? <p className="text-sm text-slate-500">No orders found.</p> : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
