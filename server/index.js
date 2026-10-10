/**
 * SupplyShield AI — Backend Server Entry Point (Phase 5)
 * 
 * Boots the Express server for Groq AI assistant integration.
 * Run via: npm run server (or node server/index.js)
 */

import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp({ config });
const port = config.PORT;

const server = app.listen(port, () => {
  const groqStatusText = config.isGroqConfigured()
    ? `ENABLED (Active model: ${config.GROQ_MODEL})`
    : config.isGroqEnabled()
      ? 'ENABLED but GROQ_API_KEY is missing (Fallback active)'
      : 'DISABLED by default (Free-only safety mode active)';

  console.log('=======================================================');
  console.log(' SupplyShield AI — Backend Server (Phase 5: Groq AI)');
  console.log('=======================================================');
  console.log(` • Server listening at: http://localhost:${port}`);
  console.log(` • CORS Allowed Origin: ${config.ALLOWED_ORIGIN}`);
  console.log(` • Groq AI Integration: ${groqStatusText}`);
  console.log(` • Deterministic Engine: Authoritative local fallback`);
  console.log('=======================================================\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully.');
  server.close(() => {
    process.exit(0);
  });
});
