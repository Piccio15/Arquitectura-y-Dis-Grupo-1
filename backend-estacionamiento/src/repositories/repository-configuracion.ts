import { orm } from './orm-config';

const CONFIGURACION_ID = 1;

export const ConfiguracionRepository = {
  obtenerHorarioCobro: async () => {
    return await orm.configuracionsistema.upsert({
      where: { id: CONFIGURACION_ID },
      update: {},
      create: {
        id: CONFIGURACION_ID,
        hora_inicio_cobro: '08:00',
        hora_fin_cobro: '20:00'
      }
    });
  },

  actualizarHorarioCobro: async (datos: {
    hora_inicio_cobro: string;
    hora_fin_cobro: string;
  }) => {
    return await orm.configuracionsistema.upsert({
      where: { id: CONFIGURACION_ID },
      update: datos,
      create: {
        id: CONFIGURACION_ID,
        ...datos
      }
    });
  }
};
