import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { API_URL } from './config-api';

export function useSincronizacion() {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sincronizar = async () => {
      const token = await getToken();

      if (!token) return;

      await fetch(`${API_URL}/usuarios/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    };

    void sincronizar();
  }, [getToken, isLoaded, user]);
}
