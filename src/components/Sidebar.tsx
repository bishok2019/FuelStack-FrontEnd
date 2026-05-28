import { Link, NavLink } from 'react-router-dom';
import { BarChart3, Boxes, CreditCard, Package, ShoppingBag, Store, Users, UserRound } from 'lucide-react';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/dealers', label: 'Dealers', icon: Store },
  { to: '/admin/customers', label: 'Customers', icon: UserRound },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/payment-methods', label: 'Payments', icon: CreditCard },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <Link to="/admin/dashboard" className="flex h-16 items-center border-b border-slate-200 px-6 text-xl font-bold text-primary">
        FuelStack
      </Link>
      <nav className="space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
