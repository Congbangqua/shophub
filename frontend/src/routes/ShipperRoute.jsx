import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const ShipperRoute = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'Shipper') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ShipperRoute;
