import { useNavigate } from 'react-router-dom';

export default function MenuInspector() {
  const navigate = useNavigate();

  const estiloTarjeta = {
    backgroundColor: '#ffffff',
    padding: '2.5rem 1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.3rem' }}>
        Operaciones de Vía Pública
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={estiloTarjeta} onClick={() => navigate('verificar')}>
          <h3 style={{ margin: 0, color: '#e67e22' }}>Verificar Patente</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
            Consulta de estado de estacionamiento y emisión de actas
          </p>
        </div>

      </div>
    </div>
  );
}