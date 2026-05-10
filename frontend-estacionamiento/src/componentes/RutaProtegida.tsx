import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import type { RolUsuario } from '../App';

export function RutaProtegida({ children, rolRequerido }: { children: React.ReactNode, rolRequerido: RolUsuario }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div className="login-container">Cargando permisos...</div>;
  if (!isSignedIn) return <Navigate to="/" replace />;

  const rolDelUsuario = (user?.publicMetadata?.role as RolUsuario) || 'CONDUCTOR';

  if (rolDelUsuario !== rolRequerido) {
    // Si el rol no coincide, lo mandamos a su home correspondiente para que no vea blanco
    const rutaDestino = rolDelUsuario === 'ADMINISTRADOR' ? '/admin' : rolDelUsuario === 'INSPECTOR' ? '/inspector' : '/conductor';
    return <Navigate to={rutaDestino} replace />;
  }
  
  return <>{children}</>;
}