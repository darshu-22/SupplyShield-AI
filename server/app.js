/**
 * SupplyShield AI — Express Application Setup (Phase 5 & Vercel Deployment)
 * 
 * Configures Express application with security middleware, CORS constraints,
 * request sizing limits, dual router mount points (/api and /), and error handling.
 */

import express from 'express';
import cors from 'cors';
import { config as defaultConfig } from './config.js';
import { createAssistantRouter } from './routes/assistantRoutes.js';

export function createApp(options = {}) {
  const app = express();
  const cfg = options.config || defaultConfig;
  const assistantRouter = options.assistantRouter || createAssistantRouter(options);

  // Security: Dynamic CORS origin resolver supporting configured origin, localhost, and Vercel domains
  const originHandler = (origin, callback) => {
    // 1. Allow requests with no origin (e.g., mobile apps, curl, server-to-server, or same-domain browser requests)
    if (!origin) return callback(null, true);

    // 2. Allow wildcard or configured ALLOWED_ORIGIN (e.g., http://localhost:5173)
    if (cfg.ALLOWED_ORIGIN === '*' || origin === cfg.ALLOWED_ORIGIN) {
      return callback(null, true);
    }

    // 3. Allow standard local development origins
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // 4. Allow any Vercel preview or production deployment domain (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // 5. Allow VERCEL_URL environment variable if set by Vercel deployment
    if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
      return callback(null, true);
    }

    // Reject untrusted third-party origins
    return callback(null, false);
  };

  app.use(cors({
    origin: originHandler,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Enforce strict request body size limit (64 KB)
  app.use(express.json({ limit: '64kb' }));

  // Health check endpoints (dual-mounted for /api/health and /health)
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({
      status: 'healthy',
      app: 'SupplyShield AI Backend',
      phase: 'Phase 5: Secure Groq AI Integration',
      deployment: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
      timestamp: new Date().toISOString()
    });
  });

  // API Root information endpoints (supports GET /api or GET /)
  app.get(['/api', '/'], (req, res) => {
    res.json({
      status: 'healthy',
      app: 'SupplyShield AI Backend API',
      deployment: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
      endpoints: [
        '/api/health',
        '/api/assistant/status',
        '/api/assistant/chat'
      ],
      timestamp: new Date().toISOString()
    });
  });

  // Mount Assistant routes under both /api/assistant and /assistant
  app.use('/api/assistant', assistantRouter);
  app.use('/assistant', assistantRouter);

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

