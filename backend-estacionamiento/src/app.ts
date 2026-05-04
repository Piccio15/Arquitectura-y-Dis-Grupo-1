import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Inicializamos Express y Prisma
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS DE PRUEBA: ZONAS
// ==========================================

// 1. POST: Crear una nueva zona
app.post('/api/zonas', async (req: Request, res: Response) => {
  try {
    const { nombre, calles, precio_hora } = req.body;
    
    const nuevaZona = await prisma.zona.create({
      data: {
        nombre: nombre,
        calles: calles,
        precio_hora: precio_hora
      }
    });
    
    res.status(201).json({ mensaje: "Zona creada con éxito", zona: nuevaZona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al crear la zona" });
  }
});

// 2. GET: Obtener todas las zonas
app.get('/api/zonas', async (req: Request, res: Response) => {
  try {
    const zonas = await prisma.zona.findMany();
    res.status(200).json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las zonas" });
  }
});

// ==========================================
// LEVANTAR EL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});