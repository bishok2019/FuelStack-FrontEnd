import { AlertTriangle, DollarSign, ShoppingBag, Users } from 'lucide-react';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import { useCustomers } from '../../hooks/useCustomers';
import { useInventory } from '../../hooks/useInventory';
import { useOrders } from '../../hooks/useOrders';
import { currency, lowStock, orderTotal, rowsOf, statusOf, totalOf } from '../../utils/data';

export default function DashboardPage() {
  const orders = useOrders({ page: 1, page_size: 8 });
  const inventory = useInventory({ page: 1, page_size: 100 });
  const customers = useCustomers({ page: 1, page_size: 1 });
  const orderRows = rowsOf(orders.data);
  const inventoryRows = rowsOf(inventory.data);
  const today = new Date().toDateString();
  const todayOrders = orderRows.filter((order) => order.created_at && new Date(order.created_at).toDateString() === today);
  const revenue = todayOrders.reduce((sum, order) => sum + Number(orderTotal(order)), 0);
  const lowStockRows = inventoryRows.filter(lowStock);

  const columns = [
    { key: 'id', header: 'Order', render: (row) => `#${row.id}` },
    { key: 'customer', header: 'Customer', render: (row) => row.customer?.name || row.customer_name || row.customer?.email || '-' },
    { key: 'status', header: 'Status', render: (row) => <Badge>{statusOf(row)}</Badge> },
    { key: 'total', header: 'Total', render: (row) => currency(orderTotal(row)) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Operational snapshot across orders, revenue, stock, and customers.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Orders today" value={todayOrders.length} subtitle="Created since midnight" icon={ShoppingBag} />
        <StatCard title="Revenue" value={currency(revenue)} subtitle="Today from loaded orders" icon={DollarSign} />
        <StatCard title="Low-stock hubs" value={lowStockRows.length} subtitle="Available stock at or below 10" icon={AlertTriangle} />
        <StatCard title="Active customers" value={totalOf(customers.data)} subtitle="Customer records" icon={Users} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Recent orders</h2>
          {orders.isLoading ? <LoadingState label="Loading orders" /> : null}
          {orders.isError ? <ErrorState error={orders.error} /> : null}
          {!orders.isLoading && !orders.isError ? <Table columns={columns} data={orderRows} /> : null}
        </section>
        <aside className="panel p-5">
          <h2 className="font-semibold text-slate-950">Low-stock alerts</h2>
          {inventory.isLoading ? <LoadingState label="Loading inventory" /> : null}
          {inventory.isError ? <ErrorState error={inventory.error} /> : null}
          <div className="mt-4 space-y-3">
            {lowStockRows.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-md border border-rose-100 bg-rose-50 p-3">
                <p className="font-semibold text-slate-900">{item.product?.name || item.product_name || `Inventory #${item.id}`}</p>
                <p className="text-sm text-rose-700">{item.hub?.name || item.hub_name || 'Hub'} needs replenishment</p>
              </div>
            ))}
            {!lowStockRows.length && !inventory.isLoading ? <p className="text-sm text-slate-500">No low-stock records.</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
