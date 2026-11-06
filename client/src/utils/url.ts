/**
 * Mask credentials in stream URLs for safe display in the UI and logs.
 * Example: rtsp://user:pass@host:port/path -> rtsp://user:***@host:port/path
 */
export const sanitizeStreamUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
};

