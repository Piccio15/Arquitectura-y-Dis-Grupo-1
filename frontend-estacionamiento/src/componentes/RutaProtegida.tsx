import { useContext, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthContext } from '../contextos/AuthContext';
import type { RolUsuario } from '../App';

interface RutaProtegidaProps {
  children: JSX.Element;
  rolRequerido: RolUsuario;
}

export function RutaProtegida({ children, rolRequerido }: RutaProtegidaProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const contexto = useContext(AuthContext);

  if (!isLoaded || contexto?.cargando) {
    return <div>Verificando credenciales...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (contexto?.rolActivo !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return children;
}
