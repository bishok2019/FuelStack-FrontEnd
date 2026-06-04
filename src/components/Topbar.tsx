import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart } from 'lucide-react';
import { logoutSession } from '../api/auth';
import { getRefreshToken, useAuthStore, isSystemUser } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Topbar({ admin = false }) {
  const navigate = useNavigate();
  const { token, userType, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  const handleLogout = async () => {
    try {
      await logoutSession(getRefreshToken());
    } catch {
      // Local logout should still complete if the server token is already invalid.
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className={`${admin ? 'px-4 sm:px-6' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'} flex h-16 items-center justify-between gap-4`}>
        <Link to={isSystemUser(userType) ? '/admin/dashboard' : '/'} className="text-xl font-bold text-primary">
          FuelStack
        </Link>
        {!admin ? (
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-primary' : 'hover:text-primary')}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => (isActive ? 'text-primary' : 'hover:text-primary')}>Products</NavLink>
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'text-primary' : 'hover:text-primary')}>My Orders</NavLink>
          </nav>
        ) : null}
        <div className="flex items-center gap-2">
          {!admin ? (
            <Link to="/products" className="btn-secondary px-3" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
              <span>{cartCount}</span>
            </Link>
          ) : null}
          {token ? (
            <button className="btn-secondary px-3" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link className="btn-primary" to="/login">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
