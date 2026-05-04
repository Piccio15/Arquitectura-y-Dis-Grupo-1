// src/types/conductor-interface.ts

export interface Vehiculo {
  patente: string;
}

export interface SesionActiva {
  id: string;
  patente: string;
  idZona: string;
  horaInicio: string; // ISO String
}

export interface Multa {
  id: string;
  patente: string;
  motivo: string;
  monto: number;
  estado: 'PENDIENTE' | 'PAGADA';
}

export interface PerfilConductor {
  id: string;
  saldo: number;
}