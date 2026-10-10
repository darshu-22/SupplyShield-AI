/**
 * SupplyShield AI — Server Configuration (Phase 5: Groq Integration)
 * 
 * Central configuration module reading environment variables with secure defaults.
 * Guarantees that Groq AI is disabled by default (ENABLE_GROQ=false) and that API keys
 * are never exposed or logged.
 */

import dotenv from 'dotenv';

// Load .env if present
dotenv.config();

export function getConfig(overrides = {}) {
  const env = { ...process.env, ...overrides };

  const isEnabled = env.ENABLE_GROQ === 'true';
  const apiKey = (env.GROQ_API_KEY || '').trim();
  // Official Groq Free Tier production model: Meta Llama 3.3 70B Versatile
  const model = (env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();
  const baseUrl = (env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
  const port = parseInt(env.PORT, 10) || 3001;
  const timeoutMs = parseInt(env.REQUEST_TIMEOUT_MS, 10) || 20000;
  const rateLimitMax = parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10) || 20;
  const rateLimitWindowMs = parseInt(env.RATE_LIMIT_WINDOW_MS, 10) || 60000;
  const allowedOrigin = env.ALLOWED_ORIGIN || 'http://localhost:5173';
  const maxMessageLength = parseInt(env.MAX_MESSAGE_LENGTH, 10) || 2000;

  return {
    PORT: port,
    ENABLE_GROQ: isEnabled,
    GROQ_API_KEY: apiKey,
    GROQ_MODEL: model,
    GROQ_BASE_URL: baseUrl,
    REQUEST_TIMEOUT_MS: timeoutMs,
    RATE_LIMIT_MAX_REQUESTS: rateLimitMax,
    RATE_LIMIT_WINDOW_MS: rateLimitWindowMs,
    ALLOWED_ORIGIN: allowedOrigin,
    MAX_MESSAGE_LENGTH: maxMessageLength,

    /**
     * Checks if Groq is explicitly enabled via environment configuration
     */
    isGroqEnabled() {
      return this.ENABLE_GROQ === true;
    },
    isGrokEnabled() {
      return this.isGroqEnabled();
    },

    /**
     * Checks if Groq is both enabled AND properly configured with an API key
     */
    isGroqConfigured() {
      return this.isGroqEnabled() && Boolean(this.GROQ_API_KEY);
    },
    isGrokConfigured() {
      return this.isGroqConfigured();
    },

    /**
     * Sanitized status object safe to return to client or UI.
     * STRICT SECURITY: NEVER includes GROQ_API_KEY or auth credentials.
     */
    getClientSafeStatus() {
      const enabled = this.isGroqEnabled();
      const configured = this.isGroqConfigured();

      let modeDescription = 'Deterministic local engine (Free-only safety mode)';
      if (enabled && configured) {
        modeDescription = `Groq AI active (${this.GROQ_MODEL})`;
      } else if (enabled && !configured) {
        modeDescription = 'Groq enabled but GROQ_API_KEY missing (fallback active)';
      }

      return {
        enabled,
        configured,
        model: this.GROQ_MODEL,
        provider: (enabled && configured) ? 'groq-ai' : 'deterministic-local',
        modeDescription
      };
    }
  };
}

// Default export uses process.env
export const config = getConfig();
