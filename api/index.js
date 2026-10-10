/**
 * SupplyShield AI — Vercel Serverless Function Entry Point
 * 
 * Bridges incoming Vercel Serverless Function HTTP requests to the Express application.
 * Reuses the existing Express app setup, rate limiting, request validation,
 * and Groq AI routes without duplication.
 */

import { createApp } from '../server/app.js';
import { config } from '../server/config.js';

const app = createApp({ config });

export { app };

export default function handler(req, res) {
  return app(req, res);
}
