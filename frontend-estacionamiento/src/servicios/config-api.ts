const apiUrlConfigurada = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !apiUrlConfigurada) {
  throw new Error('Falta configurar VITE_API_URL para el entorno de produccion');
}

export const API_URL = apiUrlConfigurada || 'http://localhost:3000/api';
