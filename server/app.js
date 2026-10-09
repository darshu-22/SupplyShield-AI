/**
 * SupplyShield AI — Express Application Setup (Phase 5)
 * 
 * Configures Express application with security middleware, CORS constraints,
 * request sizing limits, and router mount points.
 */

import express from 'express';
import cors from 'cors';
import { config as defaultConfig } from './config.js';
import { createAssistantRouter } from './routes/assistantRoutes.js';

export function createApp(options = {}) {
  const app = express();
  const cfg = options.config || defaultConfig;
  const assistantRouter = options.assistantRouter || createAssistantRouter(options);

  // Security: Restrict CORS to allowed local development origin
  app.use(cors({
    origin: cfg.ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Enforce strict request body size limit (64 KB)
  app.use(express.json({ limit: '64kb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'SupplyShield AI Backend',
      phase: 'Phase 5: Secure Grok AI Integration',
      timestamp: new Date().toISOString()
    });
  });

  // Mount Assistant routes
  app.use('/api/assistant', assistantRouter);

  // 404 Handler for undefined API routes
  app.use((req, res) => {
    res.status(404).json({
      error: `Endpoint ${req.method} ${req.originalUrl} not found`
    });
  });

  // Global Error Handler (Sanitizes errors, never leaks stack traces with keys)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
      error: message,
      status: 'server_error',
      fallbackRecommended: true
    });
  });

  return app;
}
