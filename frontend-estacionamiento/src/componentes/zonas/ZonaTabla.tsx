import type { Zona } from '../../types/zona-interface';

interface ZonaTablaProps {
  zonas: Zona[];
  onEditar: (zona: Zona) => void;
  onEliminar: (id: string) => void;
}

export function ZonaTabla({ zonas, onEditar, onEliminar }: ZonaTablaProps) {
  
  // Lógica encapsulada para determinar el estado visual
  const determinarEstado = (ocupados: number, total: number) => {
    const porcentaje = (ocupados / total) * 100;
    if (porcentaje >= 95) return { color: '#e74c3c', etiqueta: 'Lleno' };
    if (porcentaje >= 80) return { color: '#f1c40f', etiqueta: 'Casi Lleno', colorTexto: '#333' };
    return { color: '#2ecc71', etiqueta: 'Disponible' };
  };

  if (zonas.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '8px' }}>No hay zonas registradas en el sistema.</div>;
  }

  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#34495e', color: '#fff' }}>
          <tr>
            <th style={{ padding: '1rem' }}>Nombre</th>
            <th style={{ padding: '1rem' }}>Capacidad</th>
            <th style={{ padding: '1rem' }}>Ocupados</th>
            <th style={{ padding: '1rem' }}>Libres</th>
            <th style={{ padding: '1rem' }}>Estado</th>
            <th style={{ padding: '1rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {zonas.map(zona => {
            const libres = Math.max(0, zona.capacidadTotal - zona.espaciosOcupados);
            const estado = determinarEstado(zona.espaciosOcupados, zona.capacidadTotal);

            return (
              <tr key={zona.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#2c3e50' }}>{zona.nombre}</td>
                <td style={{ padding: '1rem' }}>{zona.capacidadTotal}</td>
                <td style={{ padding: '1rem' }}>{zona.espaciosOcupados}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{libres}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: estado.color, 
                    color: estado.colorTexto || '#fff', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold' 
                  }}>
                    {estado.etiqueta}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => onEditar(zona)} style={{ cursor: 'pointer', marginRight: '0.5rem', padding: '0.4rem 0.8rem', border: '1px solid #3498db', color: '#3498db', background: 'transparent', borderRadius: '4px' }}>Editar</button>
                  <button onClick={() => onEliminar(zona.id)} style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', border: '1px solid #e74c3c', color: '#e74c3c', background: 'transparent', borderRadius: '4px' }}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}