import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function AdminRoute({ children }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

export default AdminRoute;