import 'dotenv/config';
import express, { Request, Response } from 'express';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import { orm } from './repositories/orm-config';
import { peticionLogin } from './routes/peticion-login';

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

// Temporary zone endpoints. They will move to their route and controller modules.
app.post('/api/zonas', async (req: Request, res: Response) => {
  try {
    const { nombre, calles, precio_hora } = req.body;
    const nuevaZona = await orm.zona.create({
      data: {
        nombre,
        calles,
        precio_hora
      }
    });
    res.status(201).json({ mensaje: 'Zona creada con exito', zona: nuevaZona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al crear la zona' });
  }
});

app.get('/api/zonas', async (_req: Request, res: Response) => {
  try {
    const zonas = await orm.zona.findMany();
    res.status(200).json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las zonas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
