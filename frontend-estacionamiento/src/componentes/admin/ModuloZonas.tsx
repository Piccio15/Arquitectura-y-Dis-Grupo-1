import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck, CircleX, MapPin } from 'lucide-react';
import { crearZonaService } from '../../servicios/zona-servicio';
import { ZonaForm } from '../zonas/ZonaForm';
import type { Zona } from '../../types/zona-interface';

function Modal({ mensaje, tipo, onCerrar }: { mensaje: string; tipo: 'exito' | 'error'; onCerrar: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
        onClick={onCerrar}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ background: '#fff', borderRadius: '20px', padding: '2rem', maxWidth: '360px', width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
          onClick={e => e.stopPropagation()}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>
            {tipo === 'exito' ? <CircleCheck size={48} color="#16a34a" /> : <CircleX size={48} color="#dc2626" />}
          </motion.div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>{mensaje}</p>
          <button className="btn btn-primario" onClick={onCerrar} style={{ width: '100%' }}>Aceptar</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const itemVariants = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };
const listaVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function ModuloZonas() {
  const { getToken } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [zonaEditar, setZonaEditar] = useState<Zona | null>(null);
  const [modal, setModal] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const cargarZonas = async () => {
    try {
      setCargando(true);
      const token = await getToken();
      setZonas(await crearZonaService(token).obtenerZonas() || []);
    } catch {
      setModal({ mensaje: 'No se pudieron cargar las zonas.', tipo: 'error' });
    } finally { setCargando(false); }
  };

  useEffect(() => { cargarZonas(); }, []);

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta zona?')) return;
    setEliminandoId(id);
    try {
      const token = await getToken();
      await crearZonaService(token).eliminarZona(id);
      setModal({ mensaje: 'Zona eliminada correctamente.', tipo: 'exito' });
      cargarZonas();
    } catch {
      setModal({ mensaje: 'No se pudo eliminar la zona.', tipo: 'error' });
    } finally { setEliminandoId(null); }
  };

  const abrirEditar = (zona: Zona) => {
    setZonaEditar(zona);
    setMostrandoFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrandoFormulario(false);
    setZonaEditar(null);
  };

  return (
    <div>
      <AnimatePresence>
        {modal && <Modal mensaje={modal.mensaje} tipo={modal.tipo} onCerrar={() => setModal(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="seccion-titulo" style={{ margin: 0 }}>Gestión de Zonas</h2>
        <AnimatePresence>
          {!mostrandoFormulario && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="btn btn-primario" onClick={() => { setZonaEditar(null); setMostrandoFormulario(true); }}>
              + Nueva Zona
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {mostrandoFormulario && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <ZonaForm
              zonaEditar={zonaEditar}
              onGuardar={async (datos) => {
                try {
                  const token = await getToken();
                  if (zonaEditar) {
                    await crearZonaService(token).editarZona(zonaEditar.id, datos);
                    setModal({ mensaje: '¡Zona actualizada con éxito!', tipo: 'exito' });
                  } else {
                    await crearZonaService(token).crearZona(datos);
                    setModal({ mensaje: '¡Zona creada con éxito!', tipo: 'exito' });
                  }
                  cerrarFormulario();
                  cargarZonas();
                } catch {
                  setModal({ mensaje: 'No se pudo guardar la zona.', tipo: 'error' });
                }
              }}
              onCancelar={cerrarFormulario}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {cargando ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : zonas.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="estado-vacio">
          <div className="estado-vacio-icono"><MapPin size={44} strokeWidth={1.8} /></div>
          <p>No hay zonas configuradas todavía.</p>
        </motion.div>
      ) : (
        <motion.div className="lista" variants={listaVariants} initial="hidden" animate="show">
          {zonas.map(z => (
            <motion.div key={z.id} variants={itemVariants} layout
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }} className="lista-item">
              <div className="lista-item-izq">
                <span className="lista-item-titulo">{z.nombre}</span>
                <span className="lista-item-subtitulo">${z.precio_hora}/hr</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="btn btn-secundario"
                  style={{ height: '34px', padding: '0 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => abrirEditar(z)}>
                  Editar
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="btn btn-peligro"
                  style={{ height: '34px', padding: '0 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => eliminar(z.id)}
                  disabled={eliminandoId === z.id}>
                  {eliminandoId === z.id ? '...' : 'Eliminar'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
