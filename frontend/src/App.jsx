import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import ChangePassword from './pages/ChangePassword';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminStores    from './pages/admin/Stores';
import UserDetail     from './pages/admin/UserDetail';

// Normal user
import UserStoreList  from './pages/user/StoreList';

// Store owner
import OwnerDashboard from './pages/owner/Dashboard';

// Root redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const map = { admin: '/admin', user: '/stores', owner: '/owner' };
  return <Navigate to={map[user?.role] || '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2545',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute roles={['admin']}><UserDetail /></ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute roles={['admin']}><AdminStores /></ProtectedRoute>
          } />

          {/* Normal user */}
          <Route path="/stores" element={
            <ProtectedRoute roles={['user']}><UserStoreList /></ProtectedRoute>
          } />

          {/* Owner */}
          <Route path="/owner" element={
            <ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>
          } />

          {/* Shared: change password */}
          <Route path="/change-password" element={
            <ProtectedRoute roles={['user', 'owner']}><ChangePassword /></ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
