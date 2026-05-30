import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import type { RolUsuario } from '../App';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function rutaPorRol(rol: RolUsuario) {
  if (rol === 'ADMINISTRADOR') return '/admin';
  if (rol === 'INSPECTOR') return '/inspector';
  return '/conductor';
}

export default function Sincronizando() {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sincronizar = async () => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error('No se pudo obtener el token de Clerk');
        }

        const respuesta = await fetch(`${API_URL}/usuarios/sync`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
          throw new Error(datos.error || 'No se pudo sincronizar el usuario');
        }

        await user.reload();
        navigate(rutaPorRol(datos.rol as RolUsuario), { replace: true });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error inesperado');
      }
    };

    void sincronizar();
  }, [getToken, isLoaded, navigate, user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h2>Configurando tu cuenta...</h2>
      {error ? <p style={{ color: '#dc2626' }}>{error}</p> : <p>Por favor espera un momento.</p>}
    </div>
  );
}
