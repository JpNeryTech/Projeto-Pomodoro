import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { settingsRouter } from './routes/settings.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/settings', settingsRouter);
app.use('/tasks', tasksRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Tratamento global de erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});