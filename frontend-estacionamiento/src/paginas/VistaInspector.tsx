import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';

export default function VistaInspector() {
  return (
    <LayoutPrincipal titulo="Terminal de Inspección" rutaInicio="/inspector">
      <Outlet />
    </LayoutPrincipal>
  );
}