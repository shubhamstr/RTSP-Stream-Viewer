import { Router, Request, Response } from 'express';
import { logger } from '../services/logger';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  logger.debug('HealthCheck', 'Health check requested');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
