import { getAuth } from '@clerk/express';
import { NextFunction, Request, Response } from 'express';

export function exigirAutenticacion(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Autenticacion requerida' });
    return;
  }

  next();
}
