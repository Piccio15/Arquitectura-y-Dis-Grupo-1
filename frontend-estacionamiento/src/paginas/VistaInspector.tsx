import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';
import { useSincronizacion } from '../servicios/useSincronizacion';

export default function VistaInspector() {
  useSincronizacion();
  return (
    <LayoutPrincipal titulo="Terminal de Inspección" rutaInicio="/inspector">
      <Outlet />
    </LayoutPrincipal>
  );
}