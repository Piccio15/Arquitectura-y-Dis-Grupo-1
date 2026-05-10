// src/componentes/admin/MenuAdmin.tsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const item  = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };
const lista = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function MenuAdmin() {
  const navigate = useNavigate();
  const { user } = useUser();
  const nombre = user?.firstName || 'Admin';

  const modulos = [
    { ruta: 'zonas',       icono: '🗺️', color: 'azul',  titulo: 'Zonas de Estacionamiento', desc: 'Crear, editar y administrar áreas', accent: '#2563eb' },
    { ruta: 'inspectores', icono: '👮', color: 'verde', titulo: 'Inspectores',               desc: 'Gestionar agentes de tránsito',    accent: '#16a34a' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="menu-hero"
      >
        <h2>Panel de Administración</h2>
        <p>Bienvenido, {nombre}</p>
      </motion.div>

      <motion.div className="modulos-lista" variants={lista} initial="hidden" animate="show">
        {modulos.map(m => (
          <motion.div
            key={m.ruta}
            variants={item}
            className="modulo-item"
            style={{ '--accent': m.accent } as React.CSSProperties}
            onClick={() => navigate(m.ruta)}
          >
            <div className={`modulo-item-icono ${m.color}`}>{m.icono}</div>
            <div className="modulo-item-texto">
              <div className="modulo-item-titulo">{m.titulo}</div>
              <div className="modulo-item-desc">{m.desc}</div>
            </div>
            <span className="modulo-item-flecha">›</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
