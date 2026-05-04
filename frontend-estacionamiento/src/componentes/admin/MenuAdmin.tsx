import { useNavigate } from 'react-router-dom';

export default function MenuAdmin() {
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
        Seleccione un módulo administrativo
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={estiloTarjeta} onClick={() => navigate('zonas')}>
          <h3 style={{ margin: 0, color: '#27ae60' }}>Gestionar Zonas</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
            Configuración cartográfica y tarifas
          </p>
        </div>

        <div style={estiloTarjeta} onClick={() => navigate('inspectores')}>
          <h3 style={{ margin: 0, color: '#2980b9' }}>Gestionar Inspectores</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
            Alta y asignación de personal
          </p>
        </div>

      </div>
    </div>
  );
}