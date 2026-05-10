// src/componentes/conductor/ModuloVehiculos.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { crearConductorService } from '../../servicios/conductor-servicio';
import type { Vehiculo } from '../../types/conductor-interface';

export default function ModuloVehiculos() {
  const { getToken } = useAuth();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [nuevaPatente, setNuevaPatente] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargarVehiculos = async () => {
    try {
      const token = await getToken();
      const datos = await crearConductorService(token).obtenerVehiculos();
      setVehiculos(datos || []);
    } catch (err: any) { setError(err.message); }
  };

  useEffect(() => { cargarVehiculos(); }, []);

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const token = await getToken();
      await crearConductorService(token).registrarVehiculo(nuevaPatente);
      setNuevaPatente('');
      cargarVehiculos();
    } catch (err: any) {
      setError(err.message);
    } finally { setCargando(false); }
  };

  return (
    <div>
      <h2 className="seccion-titulo">Mis Vehículos</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={registrar} className="form-fila">
          <div className="campo" style={{ flex: 1 }}>
            <input
              type="text"
              value={nuevaPatente}
              onChange={e => setNuevaPatente(e.target.value.toUpperCase())}
              placeholder="Ej: ABC 123"
              required
              style={{ fontFamily: 'var(--fuente-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            />
          </div>
          <button type="submit" className="btn btn-primario" disabled={cargando}>
            {cargando ? '...' : '+ Agregar'}
          </button>
        </form>
      </div>

      {error && <div className="alerta alerta-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {vehiculos.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icono">🚗</div>
          <p>Todavía no tenés vehículos registrados.</p>
        </div>
      ) : (
        <div className="lista">
          {vehiculos.map((v, i) => (
            <div key={i} className="lista-item">
              <div className="lista-item-izq">
                <span className="lista-item-titulo">{v.patente}</span>
                <span className="lista-item-subtitulo">Vehículo registrado</span>
              </div>
              <span style={{ fontSize: '1.2rem' }}>🚗</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
