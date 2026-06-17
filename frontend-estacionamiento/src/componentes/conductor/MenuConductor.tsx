import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Car, ChevronRight, ClipboardList, Timer, Wallet } from 'lucide-react';
import { crearConductorService } from '../../servicios/conductor-servicio';

const item = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };
const lista = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function MenuConductor() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const nombre = user?.firstName || 'conductor';
  const [saldo, setSaldo] = useState<number | null>(null);

  useEffect(() => {
    const cargarSaldo = async () => {
      try {
        const token = await getToken();
        const billetera = await crearConductorService(token).obtenerSaldo();
        setSaldo(billetera.saldo);
      } catch (error) {
        console.error('No se pudo obtener el saldo:', error);
      }
    };

    void cargarSaldo();
  }, [getToken]);

  const modulos = [
    { ruta: 'vehiculos', Icono: Car, color: 'azul', titulo: 'Mis Vehiculos', desc: 'Administra tus patentes registradas', accent: '#2563eb' },
    { ruta: 'estacionamiento', Icono: Timer, color: 'verde', titulo: 'Estacionamiento', desc: 'Ver y finalizar sesiones activas', accent: '#16a34a' },
    { ruta: 'saldo', Icono: Wallet, color: 'azul', titulo: 'Billetera Virtual', desc: 'Recargar saldo para estacionar', accent: '#2563eb' },
    { ruta: 'multas', Icono: ClipboardList, color: 'naranja', titulo: 'Infracciones', desc: 'Ver y pagar multas pendientes', accent: '#ea580c' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="menu-hero"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
      >
        <div>
          <h2>Hola, {nombre}</h2>
          <p>Que queres hacer hoy?</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Saldo disponible
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.15rem' }}>
            {saldo === null ? 'Cargando...' : `$${saldo.toLocaleString('es-AR')}`}
          </div>
        </div>
      </motion.div>

      <motion.div className="modulos-lista" variants={lista} initial="hidden" animate="show">
        {modulos.map(modulo => (
          <motion.div
            key={modulo.ruta}
            variants={item}
            className="modulo-item"
            style={{ '--accent': modulo.accent } as React.CSSProperties}
            onClick={() => navigate(modulo.ruta)}
          >
            <div className={`modulo-item-icono ${modulo.color}`}><modulo.Icono size={24} strokeWidth={2.3} /></div>
            <div className="modulo-item-texto">
              <div className="modulo-item-titulo">{modulo.titulo}</div>
              <div className="modulo-item-desc">{modulo.desc}</div>
            </div>
            <span className="modulo-item-flecha"><ChevronRight size={20} /></span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
