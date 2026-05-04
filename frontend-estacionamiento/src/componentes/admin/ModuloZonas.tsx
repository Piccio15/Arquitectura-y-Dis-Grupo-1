import { useState, useEffect } from 'react';
import { ZonaService } from '../../servicios/zona-servicio';
import { ZonaForm } from '../zonas/ZonaForm'; // Ajuste la ruta según su estructura
import type { Zona } from '../../types/zona-interface';

export default function ModuloZonas() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrandoFormulario, setMostrandoFormulario] = useState<boolean>(false);

  const cargarZonas = async () => {
    try {
      setCargando(true);
      const datos = await ZonaService.obtenerZonas();
      setZonas(datos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarZonas();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Gestión de Zonas</h2>
        {!mostrandoFormulario && (
          <button onClick={() => setMostrandoFormulario(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Nueva Zona
          </button>
        )}
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fadbd8', color: '#c0392b', marginBottom: '1rem', borderRadius: '4px' }}>{error}</div>}

      {mostrandoFormulario ? (
        <ZonaForm 
          onGuardar={async (datos) => {
            try {
              await ZonaService.crearZona(datos);
              setMostrandoFormulario(false);
              cargarZonas();
            } catch (err: any) {
              alert(`Error: ${err.message}`);
            }
          }}
          onCancelar={() => setMostrandoFormulario(false)}
        />
      ) : (
        <div>
          {cargando ? <p>Cargando zonas...</p> : (
            zonas.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {zonas.map(z => (
                  <li key={z.id} style={{ padding: '1rem', border: '1px solid #bdc3c7', marginBottom: '0.5rem', borderRadius: '4px' }}>
                    <strong>{z.nombre}</strong> - Tarifa: ${z.precio_hora}/h - Ocupación: {z.espaciosOcupados}/{z.capacidadTotal}
                  </li>
                ))}
              </ul>
            ) : <p style={{ color: '#7f8c8d' }}>No hay zonas configuradas.</p>
          )}
        </div>
      )}
    </div>
  );
}