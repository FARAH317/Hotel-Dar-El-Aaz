import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/features/auth/store/authSlice';
import { USER_ROLES } from '@/utils/constants';

// Layout
import Layout from '@/components/Layout';

// Auth
import LoginForm from '@/features/auth/components/LoginForm';
import RegisterForm from '@/features/auth/components/RegisterForm';

// Pages
import HomePage from '@/pages/HomePage';
import RoomListPage from '@/pages/RoomListPage';
import RoomDetailPage from '@/pages/RoomDetailPage';
import MyReservationsPage from '@/pages/MyReservationsPage';
import ReservationDetailPage from '@/pages/ReservationDetailPage';
import MyPaymentsPage from '@/pages/MyPaymentsPage';
import ProfilePage from '@/pages/ProfilePage';
import PaymentForm from '@/features/payments/components/PaymentForm';
// Dashboard (Admin)
import Dashboard from '@/features/dashboard/components/Dashboard';
import NotificationList from '@/features/notifications/components/NotificationList';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes (Sans Layout) */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginForm />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <RegisterForm />
        </PublicRoute>
      } />

      {/* Routes with Layout */}
      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomListPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />

        {/* Protected Routes */}
        <Route path="/my-reservations" element={
          <ProtectedRoute>
            <MyReservationsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/reservations/:id" element={
          <ProtectedRoute>
            <ReservationDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/my-payments" element={
          <ProtectedRoute>
            <MyPaymentsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationList />
          </ProtectedRoute>
        } 
/>
        {/* Admin Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Route>
        <Route path="/payments/:reservationId" element={
          <ProtectedRoute>
          <PaymentForm />
         </ProtectedRoute>
        } />


      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;