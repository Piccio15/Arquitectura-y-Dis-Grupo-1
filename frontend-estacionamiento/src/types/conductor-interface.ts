export interface Vehiculo {
  patente: string;
  conductorId: number;
}

export interface SesionActiva {
  id: number;
  patente: string;
  zonaId: number;
  fecha_inicio: string;
  costo_cobrado?: number | null;
  zona: { id: number; nombre: string; precio_hora: number; };
}

export interface Multa {
  id_multa: number;
  patente: string;
  ubicacion: string;
  monto: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  fecha: string;
}

export interface PerfilConductor {
  saldo: number;
}

export interface PreferenciaPago {
  operacionId: number;
  preferenceId: string;
  checkoutUrl: string;
  sandboxCheckoutUrl?: string;
}
