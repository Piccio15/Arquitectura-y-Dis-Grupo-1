import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car } from 'lucide-react';
import { crearConductorService } from '../../servicios/conductor-servicio';
import type { Vehiculo } from '../../types/conductor-interface';

const itemVariants = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };
const listaVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function ModuloVehiculos() {
  const { getToken } = useAuth();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [nuevaPatente, setNuevaPatente] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [eliminandoPatente, setEliminandoPatente] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);

  const cargarVehiculos = async () => {
    try {
      setCargando(true);
      setError(null);
      const token = await getToken();
      const datos = await crearConductorService(token).obtenerVehiculos();
      setVehiculos(datos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarVehiculos(); }, []);

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAgregando(true);
    try {
      const token = await getToken();
      await crearConductorService(token).registrarVehiculo(nuevaPatente);
      setNuevaPatente('');
      await cargarVehiculos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAgregando(false);
    }
  };

  const eliminar = async (patente: string) => {
    if (!confirm(`¿Eliminar el vehículo ${patente}?`)) return;
    setEliminandoPatente(patente);
    setError(null);
    try {
      const token = await getToken();
      await crearConductorService(token).eliminarVehiculo(patente);
      await cargarVehiculos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEliminandoPatente(null);
    }
  };

  return (
    <div>
      <h2 className="seccion-titulo">Mis Vehículos</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={registrar} className="form-fila">
          <div className="campo" style={{ flex: 1 }}>
            <input
              type="text"
              value={nuevaPatente}
              onChange={e => setNuevaPatente(e.target.value.toUpperCase().replace(/\s+/g, ''))}
              placeholder="Ej: ABC123"
              required
              style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="btn btn-primario"
            disabled={agregando}
          >
            {agregando ? '...' : '+ Agregar'}
          </motion.button>
        </form>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="alerta alerta-error"
            style={{ marginBottom: '1rem' }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {cargando ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : vehiculos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="estado-vacio">
          <div className="estado-vacio-icono"><Car size={44} strokeWidth={1.8} /></div>
          <p>Todavía no tenés vehículos registrados.</p>
        </motion.div>
      ) : (
        <motion.div className="lista" variants={listaVariants} initial="hidden" animate="show">
          <AnimatePresence>
            {vehiculos.map((v) => (
              <motion.div
                key={v.patente}
                variants={itemVariants}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                layout
                className="lista-item"
              >
                <div className="lista-item-izq">
                  <span className="lista-item-titulo">{v.patente}</span>
                  <span className="lista-item-subtitulo">Vehículo registrado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Car size={22} strokeWidth={2.1} color="#64748b" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-peligro"
                    style={{ height: '34px', padding: '0 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => eliminar(v.patente)}
                    disabled={eliminandoPatente === v.patente}
                  >
                    {eliminandoPatente === v.patente ? '...' : 'Eliminar'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
