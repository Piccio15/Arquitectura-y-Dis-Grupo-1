import { useState, useEffect } from 'react';
import { ConductorService } from '../../servicios/conductor-servicio';
import type { SesionActiva } from '../../types/conductor-interface';

export default function ModuloEstacionamiento() {
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);

  const cargarSesiones = async () => {
    const datos = await ConductorService.obtenerSesiones();
    setSesiones(datos || []);
  };

  useEffect(() => { cargarSesiones(); }, []);

  const finalizar = async (id: string) => {
    await ConductorService.finalizarSesion(id);
    cargarSesiones();
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem' }}>Estacionamiento Activo</h2>
      {sesiones.length === 0 ? (
        <p style={{ color: '#7f8c8d' }}>No posee sesiones de estacionamiento en curso.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sesiones.map(s => (
            <li key={s.id} style={{ padding: '1.5rem', border: '1px solid #3498db', borderLeft: '5px solid #3498db', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>Patente: {s.patente}</strong><br/>
              Zona ID: {s.idZona}<br/>
              Inicio: {new Date(s.horaInicio).toLocaleTimeString()}<br/>
              <button onClick={() => finalizar(s.id)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Finalizar Estacionamiento
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}