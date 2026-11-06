export const ENV = {
  EXPRESS_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:4000',
} as const;

