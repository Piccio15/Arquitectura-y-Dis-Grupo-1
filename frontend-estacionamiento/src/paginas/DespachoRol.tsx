import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthContext } from '../contextos/AuthContext';

export default function DespachoRol() {
  const { isLoaded, isSignedIn } = useAuth();
  const auth = useContext(AuthContext);

  if (!isLoaded || auth?.cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#2c3e50', color: '#fff' }}>
        Verificando sesión...
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  const rol = auth?.rolActivo;
  if (rol === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
  if (rol === 'CONDUCTOR') return <Navigate to="/conductor" replace />;
  if (rol === 'INSPECTOR') return <Navigate to="/inspector" replace />;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#2c3e50', color: '#fff', flexDirection: 'column', gap: '1rem' }}>
      <h2>Rol no configurado</h2>
      <p>Tu cuenta no tiene un rol asignado. Contactá al administrador del sistema.</p>
    </div>
  );
}
