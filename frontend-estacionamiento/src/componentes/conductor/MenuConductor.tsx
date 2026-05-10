// src/componentes/conductor/MenuConductor.tsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const item = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };
const lista = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function MenuConductor() {
  const navigate = useNavigate();
  const { user } = useUser();
  const nombre = user?.firstName || 'conductor';

  const modulos = [
    { ruta: 'vehiculos',        icono: '🚗', color: 'azul',    titulo: 'Mis Vehículos',    desc: 'Administrá tus patentes registradas', accent: '#2563eb' },
    { ruta: 'estacionamiento',  icono: '⏱️', color: 'verde',   titulo: 'Estacionamiento',  desc: 'Ver y finalizar sesiones activas',    accent: '#16a34a' },
    { ruta: 'saldo',            icono: '💳', color: 'azul',    titulo: 'Billetera Virtual', desc: 'Recargar saldo para estacionar',      accent: '#2563eb' },
    { ruta: 'multas',           icono: '📋', color: 'naranja', titulo: 'Infracciones',      desc: 'Ver y pagar multas pendientes',       accent: '#ea580c' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="menu-hero"
      >
        <h2>Hola, {nombre} 👋</h2>
        <p>¿Qué querés hacer hoy?</p>
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
