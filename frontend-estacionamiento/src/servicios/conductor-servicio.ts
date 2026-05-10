import type { Vehiculo, SesionActiva, Multa, PerfilConductor } from '../types/conductor-interface';

// URL base para los servicios del conductor
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// En un escenario real, el ID del conductor se obtendría del token de autenticación (JWT).
// Para efectos de estructura, asumimos que se gestiona mediante sesiones en el servidor o headers.
const obtenerHeaders = () => {
    // Aquí se recuperaría el token de almacenamiento local si aplica
    // const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
    };
};

export const ConductorService = {
  // --- Perfil y Vehículos ---

  obtenerPerfil: async (): Promise<PerfilConductor> => {
    const response = await fetch(`${API_URL}/conductor/perfil`, {
      method: 'GET',
      headers: obtenerHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener el perfil del conductor');
    return await response.json();
  },

  obtenerVehiculos: async (): Promise<Vehiculo[]> => {
    const response = await fetch(`${API_URL}/conductor/vehiculos`, {
      method: 'GET',
      headers: obtenerHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener la lista de vehículos');
    return await response.json();
  },

  registrarVehiculo: async (patente: string): Promise<void> => {
    const response = await fetch(`${API_URL}/conductor/vehiculos`, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify({ patente }),
    });
    if (!response.ok) throw new Error('Error al registrar el vehículo. Es posible que ya exista.');
  },

  // --- Estacionamiento ---

  obtenerSesiones: async (): Promise<SesionActiva[]> => {
    const response = await fetch(`${API_URL}/estacionamiento/sesiones-activas`, {
      method: 'GET',
      headers: obtenerHeaders(),
    });
    if (!response.ok) throw new Error('Error al recuperar las sesiones activas');
    return await response.json();
  },

  iniciarSesion: async (patente: string, idZona: string): Promise<void> => {
    const response = await fetch(`${API_URL}/estacionamiento/iniciar`, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify({ patente, idZona }),
    });
    if (!response.ok) {
        // Podría refinar esto leyendo el mensaje de error del cuerpo de la respuesta
        throw new Error('No se pudo iniciar la sesión. Verifique su saldo y que el vehículo no esté ya estacionado.');
    }
  },

  finalizarSesion: async (idSesion: string): Promise<void> => {
    const response = await fetch(`${API_URL}/estacionamiento/finalizar/${idSesion}`, {
      method: 'PUT',
      headers: obtenerHeaders(),
    });
    if (!response.ok) throw new Error('Error al procesar la finalización del estacionamiento');
  },

  // --- Finanzas (Saldo y Multas) ---

  cargarSaldo: async (monto: number): Promise<void> => {
    // Este endpoint debería generar la "Preferencia" de MercadoPago y devolver el ID
    // El flujo real implicaría redirigir al usuario o abrir el checkout
    const response = await fetch(`${API_URL}/finanzas/cargar-saldo`, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify({ monto }),
    });
    if (!response.ok) throw new Error('Error al inicializar la transacción de carga de saldo');
    
    // const { preferenceId } = await response.json();
    // Iniciar flujo de MercadoPago con preferenceId
  },

  obtenerMultas: async (): Promise<Multa[]> => {
    const response = await fetch(`${API_URL}/finanzas/multas`, {
      method: 'GET',
      headers: obtenerHeaders(),
    });
    if (!response.ok) throw new Error('Error al consultar las infracciones');
    return await response.json();
  },

  pagarMulta: async (idMulta: string): Promise<void> => {
    const response = await fetch(`${API_URL}/finanzas/pagar-multa/${idMulta}`, {
      method: 'POST', // Usamos POST para acciones que alteran el estado financiero
      headers: obtenerHeaders(),
    });
    if (!response.ok) throw new Error('Error al procesar el pago de la infracción. Saldo insuficiente o infracción no válida.');
  }
};
// Alias para compatibilidad con los módulos rediseñados
export const crearConductorService = (_token: string | null) => ConductorService;