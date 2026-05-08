const API_URL = 'http://localhost:3000/api';

let getClerkToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

export const apiClient = async <T>(
  endpoint: string,
  opciones: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  const token = getClerkToken ? await getClerkToken() : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const respuesta = await fetch(url, {
      ...opciones,
      headers: { ...headers, ...opciones.headers }
    });

    if (respuesta.status === 401) {
      window.location.href = '/sign-in';
      throw new Error('Sesión expirada.');
    }

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || `Error del servidor: ${respuesta.status}`);
    }

    if (respuesta.status === 204) return {} as T;
    return await respuesta.json() as T;

  } catch (error: unknown) {
    console.error(`Fallo de infraestructura en ${endpoint}:`, error);
    throw new Error(`No se pudo establecer conexión con el servidor en la ruta ${endpoint}`);
  }
};
