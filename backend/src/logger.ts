import type { Request, Response, NextFunction } from 'express';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',   // gray
  info: '\x1b[36m',    // cyan
  warn: '\x1b[33m',    // yellow
  error: '\x1b[31m',   // red
};
const RESET = '\x1b[0m';

const minLevel = (): LogLevel => {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && (env === 'debug' || env === 'info' || env === 'warn' || env === 'error')) return env;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

const shouldLog = (level: LogLevel): boolean =>
  LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel()];

const isProduction = (): boolean => process.env.NODE_ENV === 'production';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatPretty(entry: LogEntry): string {
  const color = LEVEL_COLORS[entry.level];
  const level = entry.level.toUpperCase().padEnd(5);
  const rest = Object.keys(entry)
    .filter((k) => k !== 'timestamp' && k !== 'level' && k !== 'message')
    .map((k) => `${k}=${JSON.stringify(entry[k])}`)
    .join(' ');
  const meta = rest ? ` ${rest}` : '';
  return `${entry.timestamp} ${color}${level}${RESET} ${entry.message}${meta}`;
}

function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const entry: LogEntry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...meta,
  };
  const out = isProduction() ? formatJson(entry) : formatPretty(entry);
  const stream = level === 'error' ? process.stderr : process.stdout;
  stream.write(out + '\n');
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    write('debug', message, meta);
  },
  info(message: string, meta?: Record<string, unknown>): void {
    write('info', message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    write('warn', message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    write('error', message, meta);
  },
  child(context: Record<string, unknown>) {
    return {
      debug: (msg: string, meta?: Record<string, unknown>) =>
        logger.debug(msg, { ...context, ...meta }),
      info: (msg: string, meta?: Record<string, unknown>) =>
        logger.info(msg, { ...context, ...meta }),
      warn: (msg: string, meta?: Record<string, unknown>) =>
        logger.warn(msg, { ...context, ...meta }),
      error: (msg: string, meta?: Record<string, unknown>) =>
        logger.error(msg, { ...context, ...meta }),
    };
  },
};

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const method = req.method ?? '?';
  const path = req.url ?? req.path ?? '?';
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP request', {
      method,
      path,
      statusCode: res.statusCode,
      durationMs,
    });
  });
  next();
}
