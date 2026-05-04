import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';

export default function VistaConductor() {
  return (
    <LayoutPrincipal titulo="Portal del Conductor" rutaInicio="/conductor">
      <Outlet />
    </LayoutPrincipal>
  );
}