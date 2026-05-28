import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { isSystemUser, useAuthStore } from '../store/authStore';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/customer/HomePage';
import CustomerProductsPage from '../pages/customer/ProductsPage';
import MyOrdersPage from '../pages/customer/MyOrdersPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AdminOrdersPage from '../pages/admin/OrdersPage';
import InventoryPage from '../pages/admin/InventoryPage';
import AdminProductsPage from '../pages/admin/ProductsPage';
import DealersPage from '../pages/admin/DealersPage';
import CustomersPage from '../pages/admin/CustomersPage';
import UsersPage from '../pages/admin/UsersPage';
import PaymentMethodsPage from '../pages/admin/PaymentMethodsPage';

export function ProtectedRoute({ role }) {
  const { token, userType } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  const system = isSystemUser(userType);
  if (role === 'SYSTEM' && !system) return <Navigate to="/" replace />;
  if (role === 'CUSTOMER' && system) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

function CustomerLayout() {
  return (
    <>
      <Topbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar admin />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute role="CUSTOMER" />,
        children: [
          {
            element: <CustomerLayout />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/products', element: <CustomerProductsPage /> },
              { path: '/orders', element: <MyOrdersPage /> },
              { path: '/orders/:id', element: <OrderDetailPage /> },
            ],
          },
        ],
      },
      {
        path: '/admin',
        element: <ProtectedRoute role="SYSTEM" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
              { path: 'inventory', element: <InventoryPage /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'dealers', element: <DealersPage /> },
              { path: 'customers', element: <CustomersPage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'payment-methods', element: <PaymentMethodsPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
