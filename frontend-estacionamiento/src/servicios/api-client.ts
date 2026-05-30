const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = async <T>(
  endpoint: string,
  opciones: RequestInit = {},
  token?: string | null
): Promise<T> => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (token) headers.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers: { ...headers, ...opciones.headers }
  });

  if (respuesta.status === 401) {
    window.location.href = '/';
    throw new Error('Sesion expirada');
  }

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || `Error del servidor: ${respuesta.status}`);
  }

  if (respuesta.status === 204) return {} as T;
  return await respuesta.json() as T;
};
