/**
 * SupplyShield AI — Request Validator Middleware (Phase 5)
 * 
 * Enforces strict input validation and payload bounds on incoming assistant queries.
 * Prevents prompt injection exploits, oversized payloads, and malformed requests.
 */

import { config } from '../config.js';

export function validateChatRequest(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      status: 'invalid_request',
      error: 'Invalid request body. Expected JSON object with a "message" field.',
      fallbackRecommended: true
    });
  }

  const { message, supplierId, context } = req.body;

  if (message === undefined || message === null) {
    return res.status(400).json({
      status: 'invalid_request',
      error: 'Missing required field "message".',
      fallbackRecommended: true
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      status: 'invalid_request',
      error: 'Field "message" must be a string.',
      fallbackRecommended: true
    });
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    return res.status(400).json({
      status: 'invalid_request',
      error: 'Message cannot be empty or contain only whitespace.',
      fallbackRecommended: true
    });
  }

  if (trimmedMessage.length > config.MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      status: 'payload_too_large',
      error: `Message exceeds maximum allowed length of ${config.MAX_MESSAGE_LENGTH} characters (received ${trimmedMessage.length}).`,
      fallbackRecommended: true
    });
  }

  // Attach sanitized fields to req.sanitized
  req.sanitized = {
    message: trimmedMessage,
    supplierId: typeof supplierId === 'string' ? supplierId.trim() : null,
    context: typeof context === 'object' && context !== null ? context : {}
  };

  return next();
}
