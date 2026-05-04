import { useContext, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import type { RolUsuario } from '../App';

interface RutaProtegidaProps {
  children: JSX.Element;
  rolRequerido: RolUsuario;
}

export function RutaProtegida({ children, rolRequerido }: RutaProtegidaProps) {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('RutaProtegida debe ser usada dentro de un AuthProvider');
  }

  if (contexto.cargando) {
    return <div>Verificando credenciales...</div>;
  }

  if (!contexto.token || contexto.rolActivo !== rolRequerido) {
    // Si no hay token o el rol no coincide, se deniega el acceso y se redirige
    return <Navigate to="/" replace />;
  }

  return children;
}