import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user?.role)) {
    const redirectMap = { admin: '/admin', user: '/stores', owner: '/owner' };
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
