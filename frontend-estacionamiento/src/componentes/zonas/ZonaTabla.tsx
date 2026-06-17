import type { Zona } from '../../types/zona-interface';

interface ZonaTablaProps {
  zonas: Zona[];
  onEditar: (zona: Zona) => void;
  onEliminar: (id: number) => void;
}

export function ZonaTabla({ zonas, onEditar, onEliminar }: ZonaTablaProps) {
  if (zonas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '8px' }}>
        No hay zonas registradas en el sistema.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#34495e', color: '#fff' }}>
          <tr>
            <th style={{ padding: '1rem' }}>Nombre</th>
            <th style={{ padding: '1rem' }}>Calles</th>
            <th style={{ padding: '1rem' }}>Precio por hora</th>
            <th style={{ padding: '1rem' }}>Coordenadas</th>
            <th style={{ padding: '1rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {zonas.map(zona => (
            <tr key={zona.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
              <td style={{ padding: '1rem', fontWeight: 'bold', color: '#2c3e50' }}>{zona.nombre}</td>
              <td style={{ padding: '1rem' }}>{zona.calles}</td>
              <td style={{ padding: '1rem' }}>${zona.precio_hora.toLocaleString('es-AR')}</td>
              <td style={{ padding: '1rem' }}>{zona.coordenadas?.length ?? 0} puntos</td>
              <td style={{ padding: '1rem' }}>
                <button
                  onClick={() => onEditar(zona)}
                  style={{ cursor: 'pointer', marginRight: '0.5rem', padding: '0.4rem 0.8rem', border: '1px solid #3498db', color: '#3498db', background: 'transparent', borderRadius: '4px' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => onEliminar(zona.id)}
                  style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', border: '1px solid #e74c3c', color: '#e74c3c', background: 'transparent', borderRadius: '4px' }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
