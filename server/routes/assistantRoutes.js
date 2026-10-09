/**
 * SupplyShield AI — Assistant API Routes (Phase 5: Groq Integration)
 * 
 * Exposes protected endpoints for Groq status inspection and chat querying.
 * Enforces rate limiting, validation, prompt grounding, and safe failure reporting.
 */

import { Router } from 'express';
import { config as defaultConfig } from '../config.js';
import { validateChatRequest } from '../middleware/requestValidator.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { buildGroqPrompt } from '../services/promptBuilder.js';
import { groqClient as defaultGroqClient } from '../services/groqClient.js';

export function createAssistantRouter(options = {}) {
  const router = Router();
  const cfg = options.config || defaultConfig;
  const client = options.groqClient || defaultGroqClient;

  /**
   * GET /api/assistant/status
   * Safe status check: Never reveals API keys or sensitive credentials.
   */
  router.get('/status', (req, res) => {
    const status = cfg.getClientSafeStatus();
    return res.json(status);
  });

  /**
   * POST /api/assistant/chat
   * Protected endpoint for AI-assisted supplier risk explanations.
   */
  router.post('/chat', validateChatRequest, rateLimiter, async (req, res) => {
    // 1. Free-only safety check: Reject if Groq is disabled
    if (!cfg.isGroqEnabled()) {
      return res.status(403).json({
        status: 'disabled',
        error: 'Groq integration is disabled by default (Free-only safety mode). Use local deterministic engine.',
        fallbackRecommended: true
      });
    }

    // 2. Reject if API key is not configured
    if (!cfg.isGroqConfigured()) {
      return res.status(503).json({
        status: 'unconfigured',
        error: 'Groq is enabled but GROQ_API_KEY is not configured on the server.',
        fallbackRecommended: true
      });
    }

    const { message, supplierId } = req.sanitized;

    // 3. Assemble fact-grounded prompt using relational transaction data
    const promptData = buildGroqPrompt({
      message,
      supplierId
    });

    // 4. Query Groq API
    const result = await client.queryGroq({
      messages: promptData.messages,
      temperature: 0.2,
      maxTokens: 1200
    });

    // 5. Handle provider responses
    if (!result.success) {
      const httpCode = result.httpStatus || 
        (result.status === 'timeout' ? 504 : 
         result.status === 'provider_rate_limited' ? 429 : 
         result.status === 'auth_error' ? 401 : 502);

      return res.status(httpCode).json({
        status: result.status,
        error: result.error,
        fallbackRecommended: true
      });
    }

    // 6. Return successful structured response
    return res.json({
      status: 'success',
      answer: result.answer,
      model: result.model,
      source: 'groq-ai',
      targetSupplier: promptData.targetSupplier,
      detectedIntent: promptData.detectedIntent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  return router;
}

export const assistantRouter = createAssistantRouter();
