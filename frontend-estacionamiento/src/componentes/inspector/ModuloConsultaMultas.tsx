import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ClipboardList, Eye, Filter, Search, X } from 'lucide-react';
import {
  crearInspectorService,
  type DetalleMultaInspector,
  type EstadoMulta,
  type MultaInspector,
  type ResultadoMultasInspector
} from '../../servicios/inspector-servicio';

const LIMITE = 8;

const estadoClase: Record<EstadoMulta, string> = {
  PENDIENTE: 'badge-naranja',
  PAGADA: 'badge-verde',
  ANULADA: 'badge-rojo'
};

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function DetalleMulta({
  detalle,
  cargando,
  onCerrar
}: {
  detalle: DetalleMultaInspector | null;
  cargando: boolean;
  onCerrar: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1rem'
      }}
      onClick={onCerrar}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '88dvh',
          overflowY: 'auto',
          borderRadius: 18
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>Detalle de multa</h3>
            <p style={{ margin: '0.15rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Informacion completa de la infraccion seleccionada
            </p>
          </div>
          <button className="btn btn-secundario" onClick={onCerrar} style={{ width: 38, padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        {cargando || !detalle ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="patente-display" style={{ margin: 0 }}>{detalle.patente}</div>

            <div className="resultado-fila"><span>Estado</span><span className={`badge ${estadoClase[detalle.estado]}`}>{detalle.estado}</span></div>
            <div className="resultado-fila"><span>Fecha</span><span>{formatearFecha(detalle.fecha)}</span></div>
            <div className="resultado-fila"><span>Ubicacion</span><span>{detalle.ubicacion}</span></div>
            <div className="resultado-fila"><span>Monto</span><span>${detalle.monto.toLocaleString('es-AR')}</span></div>
            <div className="resultado-fila"><span>Inspector</span><span>{detalle.inspector.legajo}</span></div>

            <div style={{ marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Conductores asociados</h4>
              {detalle.vehiculo.conductores.length === 0 ? (
                <div className="alerta alerta-info">No hay conductores asociados al vehiculo.</div>
              ) : (
                <div className="lista">
                  {detalle.vehiculo.conductores.map(({ conductor }) => (
                    <div className="lista-item" key={conductor.id}>
                      <div className="lista-item-izq">
                        <span className="lista-item-titulo" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: 0 }}>
                          {conductor.usuario.email}
                        </span>
                        <span className="lista-item-subtitulo">DNI {conductor.usuario.dni}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Pagos vinculados</h4>
              {detalle.operacionpago.length === 0 ? (
                <div className="alerta alerta-info">No hay operaciones de pago asociadas.</div>
              ) : (
                <div className="lista">
                  {detalle.operacionpago.map(operacion => (
                    <div className="lista-item" key={operacion.id}>
                      <div className="lista-item-izq">
                        <span className="lista-item-titulo">#{operacion.id}</span>
                        <span className="lista-item-subtitulo">
                          {operacion.estado} - ${operacion.monto.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <span className="badge badge-azul">{operacion.tipo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModuloConsultaMultas() {
  const { getToken } = useAuth();
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoMulta | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState<ResultadoMultasInspector | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetalleMultaInspector | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarMultas = async (paginaSolicitada = pagina) => {
    setCargando(true);
    setError(null);

    try {
      const token = await getToken();
      const data = await crearInspectorService(token).listarMultas({
        q,
        estado,
        fechaDesde,
        fechaHasta,
        pagina: paginaSolicitada,
        limite: LIMITE
      });

      setResultado(data);
      setPagina(data.paginacion.pagina);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar las multas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarMultas(1);
  }, []);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    void cargarMultas(1);
  };

  const limpiarFiltros = () => {
    setQ('');
    setEstado('');
    setFechaDesde('');
    setFechaHasta('');
    setTimeout(() => void cargarMultas(1), 0);
  };

  const abrirDetalle = async (multa: MultaInspector) => {
    setDetalle(null);
    setCargandoDetalle(true);

    try {
      const token = await getToken();
      setDetalle(await crearInspectorService(token).obtenerDetalleMulta(multa.id_multa));
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el detalle de la multa');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const totalPaginas = resultado?.paginacion.totalPaginas ?? 1;

  return (
    <div>
      {(detalle || cargandoDetalle) && (
        <DetalleMulta
          detalle={detalle}
          cargando={cargandoDetalle}
          onCerrar={() => {
            setDetalle(null);
            setCargandoDetalle(false);
          }}
        />
      )}

      <h2 className="seccion-titulo">Consultar Multas</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={buscar} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="campo">
            <label>DNI o patente</label>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Ej: 12345678 o ABC123"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="campo">
              <label>Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value as EstadoMulta | '')}>
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADA">Pagada</option>
                <option value="ANULADA">Anulada</option>
              </select>
            </div>

            <div className="campo">
              <label>Desde</label>
              <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
            </div>
          </div>

          <div className="campo">
            <label>Hasta</label>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primario" disabled={cargando}>
              {cargando ? 'Buscando...' : <><Search size={17} /> Buscar</>}
            </button>
            <button type="button" className="btn btn-secundario" onClick={limpiarFiltros} disabled={cargando}>
              <Filter size={17} /> Limpiar
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alerta alerta-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {cargando ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : !resultado || resultado.items.length === 0 ? (
        <div className="estado-vacio card">
          <div className="estado-vacio-icono"><ClipboardList size={42} strokeWidth={1.8} /></div>
          <p>No se encontraron multas con los filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            {resultado.paginacion.total} multas encontradas
          </div>

          <div className="lista">
            {resultado.items.map(multa => (
              <button
                key={multa.id_multa}
                className="lista-item"
                style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
                onClick={() => abrirDetalle(multa)}
              >
                <div className="lista-item-izq">
                  <span className="lista-item-titulo">{multa.patente}</span>
                  <span className="lista-item-subtitulo">{formatearFecha(multa.fecha)} - {multa.ubicacion}</span>
                  <span className="lista-item-subtitulo">${multa.monto.toLocaleString('es-AR')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${estadoClase[multa.estado]}`}>{multa.estado}</span>
                  <Eye size={18} color="#94a3b8" />
                </div>
              </button>
            ))}
          </div>

          <div className="card" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-secundario"
              disabled={pagina <= 1 || cargando}
              onClick={() => cargarMultas(pagina - 1)}
            >
              Anterior
            </button>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
              {pagina} / {totalPaginas}
            </span>
            <button
              className="btn btn-secundario"
              disabled={pagina >= totalPaginas || cargando}
              onClick={() => cargarMultas(pagina + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
