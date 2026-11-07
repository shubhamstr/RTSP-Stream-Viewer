import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ANSI terminal colors for readable console output
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: COLORS.magenta,
  info: COLORS.green,
  warn: COLORS.yellow,
  error: COLORS.red,
};

/**
 * Sanitizes sensitive credentials (such as RTSP passwords or bearer tokens) from log messages.
 */
export const sanitize = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  return text
    // Mask credentials in URLs: rtsp://user:pass@host -> rtsp://user:***@host
    .replace(/\/\/([^:]+):([^@]+)@/g, '//$1:***@')
    // Mask authorization tokens if logged
    .replace(/(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi, '$1***');
};

/**
 * Formats optional metadata items (errors, objects, primitives) into a sanitized string.
 */
export const formatMeta = (meta: unknown[]): string => {
  if (!meta || meta.length === 0) return '';
  return meta
    .map((item) => {
      if (item instanceof Error) {
        return `${item.name}: ${item.message}\n${item.stack || ''}`;
      }
      if (typeof item === 'object' && item !== null) {
        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      }
      return String(item);
    })
    .map((str) => sanitize(str))
    .join(' ');
};

export class LoggerService {
  private logsDir: string;
  private minLevel: LogLevel = 'debug';
  private winstonLogger: winston.Logger;
  private combinedTransport: DailyRotateFile;
  private errorTransport: DailyRotateFile;
  private consoleTransport: winston.transports.ConsoleTransportInstance;

  constructor() {
    this.logsDir = this.resolveLogsDirectory();
    this.ensureLogsDirectory();
    this.minLevel = this.resolveMinLevel();

    const maxFiles = process.env.LOG_MAX_FILES || '14d';
    const maxSize = process.env.LOG_MAX_SIZE || '20m';
    const isZipped = process.env.LOG_ZIPPED_ARCHIVE === 'true';

    // File formatter: [2026-11-07T11:40:00.000Z] [INFO] [Tag] Message ...meta
    const fileFormatter = winston.format.combine(
      winston.format.timestamp({ format: () => new Date().toISOString() }),
      winston.format.printf((info) => {
        const levelUpper = info.level.toUpperCase();
        const tag = info.tag ? `[${info.tag}] ` : '';
        const metaStr = Array.isArray(info.meta) && info.meta.length > 0 ? ` ${formatMeta(info.meta)}` : '';
        const sanitizedMsg = sanitize(String(info.message));
        return `[${info.timestamp}] [${levelUpper}] ${tag}${sanitizedMsg}${metaStr}`;
      })
    );

    // Console formatter with ANSI colors
    const consoleFormatter = winston.format.combine(
      winston.format.timestamp({ format: () => new Date().toISOString() }),
      winston.format.printf((info) => {
        const timestamp = `${COLORS.dim}${info.timestamp}${COLORS.reset}`;
        const levelUpper = info.level.toUpperCase();
        const color = LEVEL_COLORS[info.level as LogLevel] || COLORS.reset;
        const formattedLevel = `${color}[${levelUpper}]${COLORS.reset}`;
        const tag = info.tag ? `${COLORS.cyan}[${info.tag}]${COLORS.reset}` : '';
        const metaStr = Array.isArray(info.meta) && info.meta.length > 0 ? ` ${formatMeta(info.meta)}` : '';
        const sanitizedMsg = sanitize(String(info.message));
        return `${timestamp} ${formattedLevel} ${tag} ${sanitizedMsg}${metaStr}`.trim();
      })
    );

    // Date-based rotational transport for combined logs
    this.combinedTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: isZipped,
      maxSize,
      maxFiles,
      level: this.minLevel,
      format: fileFormatter,
      auditFile: path.join(this.logsDir, '.combined-audit.json'),
    });

    // Date-based rotational transport for error logs
    this.errorTransport = new DailyRotateFile({
      filename: path.join(this.logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: isZipped,
      maxSize,
      maxFiles,
      level: 'error',
      format: fileFormatter,
      auditFile: path.join(this.logsDir, '.error-audit.json'),
    });

    // Console transport
    this.consoleTransport = new winston.transports.Console({
      level: this.minLevel,
      format: consoleFormatter,
    });

    // Listen to log rotation and deletion events
    this.combinedTransport.on('rotate', (oldFilename: string, newFilename: string) => {
      this.winstonLogger.info(`Rotated log file from ${path.basename(oldFilename)} to ${path.basename(newFilename)}`, { tag: 'Logger' });
    });

    this.combinedTransport.on('logRemoved', (removedFilename: string) => {
      this.winstonLogger.info(`Auto-deleted expired log file: ${path.basename(removedFilename)}`, { tag: 'Logger' });
    });

    this.errorTransport.on('logRemoved', (removedFilename: string) => {
      this.winstonLogger.info(`Auto-deleted expired error log file: ${path.basename(removedFilename)}`, { tag: 'Logger' });
    });

    // Initialize Winston logger instance
    this.winstonLogger = winston.createLogger({
      level: this.minLevel,
      transports: [
        this.combinedTransport,
        this.errorTransport,
        this.consoleTransport,
      ],
      exitOnError: false,
    });
  }

  private resolveLogsDirectory(): string {
    if (process.env.LOGS_DIR) {
      return path.resolve(process.env.LOGS_DIR);
    }
    // Resolves to <server-root>/logs whether running from src/ or dist/
    return path.resolve(__dirname, '../../logs');
  }

  private ensureLogsDirectory(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        // Restrict directory permissions to owner only (0o700)
        fs.mkdirSync(this.logsDir, { recursive: true, mode: 0o700 });
      }

      // Ensure an internal .gitignore exists in the logs folder as a safety measure
      const internalGitignore = path.join(this.logsDir, '.gitignore');
      if (!fs.existsSync(internalGitignore)) {
        fs.writeFileSync(internalGitignore, '*\n!.gitignore\n', { encoding: 'utf8' });
      }
    } catch (err) {
      console.error('[Logger] Failed to create or secure logs directory:', err);
    }
  }

  private resolveMinLevel(): LogLevel {
    const envLevel = (process.env.LOG_LEVEL || 'debug').toLowerCase() as LogLevel;
    if (envLevel in LOG_LEVEL_PRIORITY) {
      return envLevel;
    }
    return 'debug';
  }

  public getLogsDirectory(): string {
    return this.logsDir;
  }

  /**
   * Sanitizes sensitive credentials (such as RTSP passwords or bearer tokens) from log messages.
   */
  public sanitize(text: string): string {
    return sanitize(text);
  }

  private log(level: LogLevel, tag: string, message: string, ...meta: unknown[]): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    this.winstonLogger.log({
      level,
      message,
      tag,
      meta,
    });
  }

  public debug(tag: string, message: string, ...meta: unknown[]): void {
    this.log('debug', tag, message, ...meta);
  }

  public info(tag: string, message: string, ...meta: unknown[]): void {
    this.log('info', tag, message, ...meta);
  }

  public warn(tag: string, message: string, ...meta: unknown[]): void {
    this.log('warn', tag, message, ...meta);
  }

  public error(tag: string, message: string, ...meta: unknown[]): void {
    this.log('error', tag, message, ...meta);
  }

  /**
   * Flushes and cleanly closes log file streams on process termination.
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      let closed = false;
      const done = () => {
        if (!closed) {
          closed = true;
          resolve();
        }
      };

      this.winstonLogger.end(() => {
        done();
      });

      // Timeout fallback in case streams already finished
      setTimeout(done, 500);
    });
  }
}

export const logger = new LoggerService();

/**
 * Express middleware to prevent any public or external HTTP access to the logs directory or log files.
 * Blocks /logs, /logs/*, any *.log file requests, and audit json files.
 */
export const protectLogsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const normalizedPath = decodeURIComponent(req.path || '').toLowerCase();

  const isLogPath =
    normalizedPath === '/logs' ||
    normalizedPath.startsWith('/logs/') ||
    normalizedPath.includes('/logs') ||
    normalizedPath.endsWith('.log') ||
    normalizedPath.includes('combined-') ||
    normalizedPath.includes('error-') ||
    normalizedPath.includes('combined.log') ||
    normalizedPath.includes('error.log') ||
    normalizedPath.includes('-audit.json');

  if (isLogPath) {
    logger.warn('Security', `Denied public HTTP access attempt to protected logs: ${req.method} ${req.originalUrl} from IP: ${req.ip}`);
    res.status(403).json({
      success: false,
      message: 'Access forbidden: Log files are protected internal server resources and hidden from public access',
    });
    return;
  }

  next();
};

/**
 * Express middleware to record all incoming HTTP requests and response durations.
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const sanitizedUrl = logger.sanitize(originalUrl);
    const msg = `${method} ${sanitizedUrl} ${statusCode} (${duration}ms) - IP: ${ip || req.socket.remoteAddress}`;

    if (statusCode >= 500) {
      logger.error('HTTP', msg);
    } else if (statusCode >= 400) {
      logger.warn('HTTP', msg);
    } else {
      logger.info('HTTP', msg);
    }
  });

  next();
};
