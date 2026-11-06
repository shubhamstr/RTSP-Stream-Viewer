import { Router, Request, Response } from 'express';

const router = Router();

// In-memory or initial stream route definitions
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Streams endpoint ready',
    streams: [],
  });
});

export default router;

