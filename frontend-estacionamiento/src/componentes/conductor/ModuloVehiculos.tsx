import { useState, useEffect } from 'react';
import { ConductorService } from '../../servicios/conductor-servicio';
import type { Vehiculo } from '../../types/conductor-interface';

export default function ModuloVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [nuevaPatente, setNuevaPatente] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargarVehiculos = async () => {
    try {
      const datos = await ConductorService.obtenerVehiculos();
      setVehiculos(datos || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => { cargarVehiculos(); }, []);

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ConductorService.registrarVehiculo(nuevaPatente);
      setNuevaPatente('');
      cargarVehiculos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem' }}>Mis Vehículos</h2>
      {error && <div style={{ color: '#c0392b', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={registrar} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input type="text" value={nuevaPatente} onChange={(e) => setNuevaPatente(e.target.value.toUpperCase())} placeholder="Nueva Patente" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Registrar</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {vehiculos.map((v, i) => (
          <li key={i} style={{ padding: '1rem', backgroundColor: '#f9f9f9', border: '1px solid #ecf0f1', marginBottom: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
            Patente: {v.patente}
          </li>
        ))}
      </ul>
    </div>
  );
}