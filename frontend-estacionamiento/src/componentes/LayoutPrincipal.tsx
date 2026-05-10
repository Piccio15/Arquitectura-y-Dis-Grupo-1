// src/componentes/LayoutPrincipal.tsx
import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  titulo: string;
  rutaInicio: string;
  children: ReactNode;
}

export function LayoutPrincipal({ titulo, rutaInicio, children }: LayoutProps) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const mostrarVolver = location.pathname !== rutaInicio;

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-izq">
          <AnimatePresence>
            {mostrarVolver && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="app-header-volver"
                onClick={() => navigate(rutaInicio)}
                aria-label="Volver al menú"
              >
                ←
              </motion.button>
            )}
          </AnimatePresence>
          <span className="app-header-titulo">{titulo}</span>
        </div>
        <button className="btn-salir" onClick={() => signOut(() => navigate('/', { replace: true }))}>
          Salir
        </button>
      </header>

      <main className="app-main">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
