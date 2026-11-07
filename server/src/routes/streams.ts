import { Router, Request, Response } from 'express';
import { streamManager } from '../services/streamManager';
import { CreateStreamDto, UpdateStreamDto } from '../types/stream';
import { logger } from '../services/logger';

const router = Router();

const getIdParam = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

// Validate stream URL format
const isValidStreamUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('rtsp://') ||
    trimmed.startsWith('rtsps://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  );
};

// GET /api/streams - Fetch all streams
router.get('/', (_req: Request, res: Response) => {
  const streams = streamManager.getAll();
  logger.debug('StreamsRoute', `Fetched all streams (count: ${streams.length})`);
  res.json({
    success: true,
    streams,
    count: streams.length,
  });
});

// GET /api/streams/:id - Fetch single stream
router.get('/:id', (req: Request, res: Response): void => {
  const id = getIdParam(req);
  const stream = streamManager.getById(id);
  if (!stream) {
    logger.warn('StreamsRoute', `Stream ${id} not found`);
    res.status(404).json({ success: false, message: `Stream ${id} not found` });
    return;
  }
  res.json({ success: true, stream });
});

// POST /api/streams - Add a new RTSP stream
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, url, active = true, displayed = true } = req.body as CreateStreamDto;

    if (!url || typeof url !== 'string' || !url.trim()) {
      logger.warn('StreamsRoute', 'Rejected create stream: Missing URL');
      res.status(400).json({
        success: false,
        message: 'Stream URL is required',
      });
      return;
    }

    if (!isValidStreamUrl(url)) {
      logger.warn('StreamsRoute', `Rejected create stream: Invalid URL protocol (${logger.sanitize(url)})`);
      res.status(400).json({
        success: false,
        message: 'Invalid stream URL format. Supported protocols: rtsp://, rtsps://, http://, https://',
      });
      return;
    }

    const streamName = name && typeof name === 'string' && name.trim() ? name.trim() : 'New RTSP Stream';
    logger.info('StreamsRoute', `Creating new stream "${streamName}" (${logger.sanitize(url)})`);

    const newStream = streamManager.addStream({
      name: streamName,
      url: url.trim(),
      active,
      displayed,
    });

    res.status(201).json({
      success: true,
      message: 'Stream added successfully',
      stream: newStream,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create stream';
    logger.error('StreamsRoute', 'Error creating stream:', error);
    res.status(500).json({ success: false, message });
  }
});

// POST /api/streams/:id/start - Start streaming RTSP feed via FFmpeg
router.post('/:id/start', async (req: Request, res: Response): Promise<void> => {
  const id = getIdParam(req);
  logger.info('StreamsRoute', `Start request for stream ${id}`);
  try {
    const stream = await streamManager.startStream(id);
    res.json({
      success: true,
      message: `Stream ${id} started`,
      stream,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to start stream';
    logger.error('StreamsRoute', `Failed to start stream ${id}:`, message);
    res.status(400).json({ success: false, message });
  }
});

// POST /api/streams/:id/stop - Stop streaming RTSP feed
router.post('/:id/stop', (req: Request, res: Response): void => {
  const id = getIdParam(req);
  logger.info('StreamsRoute', `Stop request for stream ${id}`);
  try {
    const stream = streamManager.stopStream(id);
    if (!stream) {
      logger.warn('StreamsRoute', `Stop failed: Stream ${id} not found`);
      res.status(404).json({ success: false, message: `Stream ${id} not found` });
      return;
    }
    res.json({
      success: true,
      message: `Stream ${id} stopped`,
      stream,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to stop stream';
    logger.error('StreamsRoute', `Failed to stop stream ${id}:`, message);
    res.status(500).json({ success: false, message });
  }
});

// PATCH /api/streams/:id - Update stream details or state
router.patch('/:id', (req: Request, res: Response): void => {
  const id = getIdParam(req);
  try {
    const { name, url, active, displayed } = req.body as UpdateStreamDto;

    if (url !== undefined && !isValidStreamUrl(url)) {
      logger.warn('StreamsRoute', `Update stream ${id} rejected: Invalid URL protocol (${logger.sanitize(url)})`);
      res.status(400).json({
        success: false,
        message: 'Invalid stream URL format. Supported protocols: rtsp://, rtsps://, http://, https://',
      });
      return;
    }

    logger.info('StreamsRoute', `Updating stream ${id}`);
    const updated = streamManager.updateStream(id, {
      name,
      url,
      active,
      displayed,
    });

    if (!updated) {
      logger.warn('StreamsRoute', `Update failed: Stream ${id} not found`);
      res.status(404).json({ success: false, message: `Stream ${id} not found` });
      return;
    }

    res.json({
      success: true,
      message: 'Stream updated successfully',
      stream: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update stream';
    logger.error('StreamsRoute', `Failed to update stream ${id}:`, message);
    res.status(500).json({ success: false, message });
  }
});

// DELETE /api/streams/:id - Remove stream
router.delete('/:id', (req: Request, res: Response): void => {
  const id = getIdParam(req);
  logger.info('StreamsRoute', `Delete request for stream ${id}`);
  const deleted = streamManager.deleteStream(id);
  if (!deleted) {
    logger.warn('StreamsRoute', `Delete failed: Stream ${id} not found`);
    res.status(404).json({ success: false, message: `Stream ${id} not found` });
    return;
  }
  res.json({
    success: true,
    message: `Stream ${id} removed`,
    id,
  });
});

export default router;
