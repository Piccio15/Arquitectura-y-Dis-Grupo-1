import 'dotenv/config';
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import { peticionEstacionamiento } from './routes/peticion-estacionamiento';
import { peticionFinanzas } from './routes/peticion-finanzas';
import { peticionLogin } from './routes/peticion-login';
import { peticionVehiculo } from './routes/peticion-vehiculo';
import { peticionAdminZonas } from './routes/peticion-adminzonas';
import { BilleteraService } from './services/service-billetera';
import { orm } from './repositories/orm-config';
import { peticionInspector } from './routes/peticion-inspector';
import { peticionConfiguracion } from './routes/peticion-configuracion';
import { EstacionamientoService } from './services/service-estacionamiento';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api', peticionLogin);
app.use('/api/vehiculos', peticionVehiculo);
app.use('/api/estacionamientos', peticionEstacionamiento);
app.use('/api/finanzas', peticionFinanzas);
app.use('/api/zonas', peticionAdminZonas);
app.use('/api/inspectores', peticionInspector);
app.use('/api/configuracion', peticionConfiguracion);

const MP_WEBHOOK_URL = process.env.MP_WEBHOOK_URL;
const POLLING_HABILITADO = MP_WEBHOOK_URL && !MP_WEBHOOK_URL.includes('ngrok');

if (POLLING_HABILITADO) {
  setInterval(async () => {
    console.log('Ejecutando polling de reconciliación de pagos...');
    try {
      const pendientes = await orm.operacionpago.findMany({
        where: {
          estado: 'PENDIENTE',
          fecha_creacion: { lt: new Date(Date.now() - 10 * 60 * 1000) }
        }
      });
      for (const op of pendientes) {
        if (op.mercadoPagoPaymentId) {
          await BilleteraService.procesarPagoNotificado(op.mercadoPagoPaymentId);
        }
      }
    } catch (error) {
      console.error('Error en polling de reconciliación:', error);
    }
  }, 10 * 60 * 1000); // Cada 10 minutos
  console.log('Polling de reconciliación de pagos habilitado');
} else {
  console.log('Polling deshabilitado — entorno de desarrollo sin webhook productivo');
}
setInterval(async () => {
  try {
    const resultado = await EstacionamientoService.cerrarSesionesPorFinDeHorario();

    if (resultado.ejecutado && resultado.sesiones_cerradas > 0) {
      console.log(`Cierre automatico: ${resultado.sesiones_cerradas} sesiones finalizadas`);
    }
  } catch (error) {
    console.error('Error en cierre automatico de estacionamientos:', error);
  }
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
