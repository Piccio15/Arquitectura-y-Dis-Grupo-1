import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

interface LayoutProps {
  titulo: string;
  rutaInicio: string; // Ej: '/conductor', '/admin'
  children: ReactNode;
}

export function LayoutPrincipal({ titulo, rutaInicio, children }: LayoutProps) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const manejarCierreSesion = () => {
    signOut(() => navigate('/', { replace: true }));
  };

  // Determina si el usuario está en un submódulo para mostrar el botón "Volver"
  const mostrarBotonVolver = location.pathname !== rutaInicio;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f6fa', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Cabecera PWA (Adaptable a Mobile) */}
      <header style={{ backgroundColor: '#2c3e50', color: '#ffffff', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>{titulo}</h1>
          <button 
            onClick={manejarCierreSesion} 
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
          >
            Salir
          </button>
        </div>
        
        {mostrarBotonVolver && (
          <button 
            onClick={() => navigate(rutaInicio)}
            style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Volver al Menú
          </button>
        )}
      </header>

      <main style={{ padding: '1.5rem', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
}