import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const tasksRouter = Router();

function serializeTask(task: any) {
  return {
    ...task,
    startDate: Number(task.startDate),
    completeDate: task.completeDate ? Number(task.completeDate) : null,
    interruptDate: task.interruptDate ? Number(task.interruptDate) : null,
  };
}

tasksRouter.get('/', async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { startDate: 'desc' } });
  res.json(tasks.map(serializeTask));
});

tasksRouter.post('/', async (req, res) => {
  const { id, name, duration, type, startDate } = req.body as {
    id: string; name: string; duration: number; type: string; startDate: number;
  };

  const task = await prisma.task.create({
    data: { id, name, duration, type, startDate: BigInt(startDate) },
  });

  res.status(201).json(serializeTask(task));
});

tasksRouter.patch('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { completeDate } = req.body as { completeDate: number };

  const task = await prisma.task.update({
    where: { id },
    data: { completeDate: BigInt(completeDate) },
  });

  res.json(serializeTask(task));
});

tasksRouter.patch('/:id/interrupt', async (req, res) => {
  const { id } = req.params;
  const { interruptDate } = req.body as { interruptDate: number };

  const task = await prisma.task.update({
    where: { id },
    data: { interruptDate: BigInt(interruptDate) },
  });

  res.json(serializeTask(task));
});

tasksRouter.delete('/', async (_req, res) => {
  await prisma.task.deleteMany();
  res.status(204).send();
});