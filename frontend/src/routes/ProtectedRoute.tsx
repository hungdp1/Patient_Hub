import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}
