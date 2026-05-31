import 'dotenv/config';
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import { peticionEstacionamiento } from './routes/peticion-estacionamiento';
import { peticionFinanzas } from './routes/peticion-finanzas';
import { peticionLogin } from './routes/peticion-login';
import { peticionVehiculo } from './routes/peticion-vehiculo';
import { peticionAdminZonas } from './routes/peticion-adminzonas';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
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

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});