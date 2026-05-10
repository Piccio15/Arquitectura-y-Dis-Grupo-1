import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';
import { useSincronizacion } from '../servicios/useSincronizacion';

export default function VistaConductor() {
  useSincronizacion();

  return (
    <LayoutPrincipal titulo="Portal del Conductor" rutaInicio="/conductor">
      <Outlet />
    </LayoutPrincipal>
  );
}