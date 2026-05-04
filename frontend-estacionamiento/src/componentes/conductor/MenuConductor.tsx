import { useNavigate } from 'react-router-dom';

export default function MenuConductor() {
  const navigate = useNavigate();

  // Estilo base para las tarjetas (PWA First)
  const estiloTarjeta = {
    backgroundColor: '#ffffff',
    padding: '2rem 1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem'
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.3rem' }}>Seleccione un módulo</h2>
      
      {/* CSS Grid adaptativo: 1 columna en celulares, 2 en pantallas más anchas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={estiloTarjeta} onClick={() => navigate('vehiculos')}>
          <div style={{ fontSize: '2rem' }}>🚗</div>
          <h3 style={{ margin: 0, color: '#2980b9' }}>Mis Vehículos</h3>
        </div>

        <div style={estiloTarjeta} onClick={() => navigate('estacionamiento')}>
          <div style={{ fontSize: '2rem' }}>⏱️</div>
          <h3 style={{ margin: 0, color: '#2980b9' }}>Estacionamiento</h3>
        </div>

        <div style={estiloTarjeta} onClick={() => navigate('saldo')}>
          <div style={{ fontSize: '2rem' }}>💰</div>
          <h3 style={{ margin: 0, color: '#2980b9' }}>Billetera Virtual</h3>
        </div>

        <div style={estiloTarjeta} onClick={() => navigate('multas')}>
          <div style={{ fontSize: '2rem' }}>📄</div>
          <h3 style={{ margin: 0, color: '#2980b9' }}>Infracciones</h3>
        </div>

      </div>
    </div>
  );
}