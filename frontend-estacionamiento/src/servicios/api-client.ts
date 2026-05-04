/*Este módulo actuará como el único punto de entrada para las peticiones de red. 
Se encargará de adjuntar automáticamente el token de autorización a cada solicitud y de interceptar 
errores globales (por ejemplo, redirigir al componente Login si el servidor devuelve un error HTTP 401 Unauthorized).
Los servicios específicos consumirán este cliente en lugar de usar fetch directamente. */

// URL estática temporal de la API REST (hasta implementar variables de entorno)
import type { RolUsuario } from '../App';

const API_URL = 'http://localhost:3000/api';

export const apiClient = async <T>(
  endpoint: string,
  opciones: RequestInit = {}
): Promise<T> => {
  
  // 1. STUB DE AUTENTICACIÓN (Único elemento hardcodeado)
  if (endpoint === '/auth/login' && opciones.method === 'POST') {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia
    const body = JSON.parse(opciones.body as string);
    
    let rol: RolUsuario;
    if (body.usuario === 'admin' && body.password === '1234') rol = 'ADMINISTRADOR';
    else if (body.usuario === 'conductor' && body.password === '1234') rol = 'CONDUCTOR';
    else if (body.usuario === 'inspector' && body.password === '1234') rol = 'INSPECTOR';
    else throw new Error('Credenciales inválidas. Verifique usuario y contraseña.');

    return { token: `mock-jwt-${rol.toLowerCase()}`, rol } as unknown as T;
  }

  // 2. COMUNICACIÓN REAL CON LA API REST
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const respuesta = await fetch(url, {
      ...opciones,
      headers: { ...headers, ...opciones.headers }
    });

    if (respuesta.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('rolUsuario');
      window.location.href = '/';
      throw new Error('Sesión expirada.');
    }

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.message || `Error del servidor: ${respuesta.status}`);
    }

    if (respuesta.status === 204) return {} as T;
    return await respuesta.json() as T;

  } catch (error: any) {
    // Se lanza la excepción para que la capa de presentación aplique degradación elegante
    console.error(`Fallo de infraestructura en ${endpoint}:`, error);
    throw new Error(`No se pudo establecer conexión con el servidor en la ruta ${endpoint}`);
  }
};