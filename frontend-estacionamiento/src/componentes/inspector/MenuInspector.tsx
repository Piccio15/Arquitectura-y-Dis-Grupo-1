// src/componentes/inspector/MenuInspector.tsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { ChevronRight, ClipboardList, SearchCheck } from 'lucide-react';

export default function MenuInspector() {
  const navigate = useNavigate();
  const { user } = useUser();
  const nombre = user?.firstName || 'Inspector';

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="menu-hero"
      >
        <h2>Terminal de Inspección</h2>
        <p>Hola, {nombre} — Operaciones de vía pública</p>
      </motion.div>

      <motion.div
        className="modulos-lista"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.22 }}
      >
        <div
          className="modulo-item"
          style={{ '--accent': '#ea580c' } as React.CSSProperties}
          onClick={() => navigate('verificar')}
        >
          <div className="modulo-item-icono naranja"><SearchCheck size={24} strokeWidth={2.3} /></div>
          <div className="modulo-item-texto">
            <div className="modulo-item-titulo">Verificar Patente</div>
            <div className="modulo-item-desc">Consultá el estado de un vehículo y emití infracciones</div>
          </div>
          <span className="modulo-item-flecha"><ChevronRight size={20} /></span>
        </div>

        <div
          className="modulo-item"
          style={{ '--accent': '#2563eb' } as React.CSSProperties}
          onClick={() => navigate('multas')}
        >
          <div className="modulo-item-icono azul"><ClipboardList size={24} strokeWidth={2.3} /></div>
          <div className="modulo-item-texto">
            <div className="modulo-item-titulo">Consultar Multas</div>
            <div className="modulo-item-desc">Buscá infracciones por DNI, patente, fecha o estado</div>
          </div>
          <span className="modulo-item-flecha"><ChevronRight size={20} /></span>
        </div>
      </motion.div>
    </div>
  );
}
