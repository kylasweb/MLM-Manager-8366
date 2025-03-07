import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { user } = useAuthContext();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

export default AdminRoute;