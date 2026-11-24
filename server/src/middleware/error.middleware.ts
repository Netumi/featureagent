import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Wystąpił nieoczekiwany błąd serwera.';
  res.status(status).json({
    success: false,
    error: message
  });
};
