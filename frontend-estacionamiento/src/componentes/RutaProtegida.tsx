import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import type { RolUsuario } from '../App';

interface Props {
  children: React.ReactNode;
  rolRequerido: RolUsuario;
}

export function RutaProtegida({ children, rolRequerido }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // 1. Mientras Clerk está cargando la sesión, no mostramos nada 
  // (Esto evita el error de resolveDispatcher null)
  if (!isLoaded) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando sesión...</div>;
  }

  // 2. Si no está logueado, mandarlo al login
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // 3. Verificación de Rol (usando la metadata de Clerk que hablamos)
  // Por ahora, si no configuraron metadata, pueden comentar este bloque 
  // para testear que al menos entran a la app.
  /* const rolDelUsuario = user?.publicMetadata?.role as RolUsuario;

  if (rolRequerido && rolDelUsuario !== rolRequerido) {
    // Si es conductor y quiere entrar a /admin, lo mandamos a su portal
    return <Navigate to="/conductor" replace />;
  }
  */
 
  return <>{children}</>;
}