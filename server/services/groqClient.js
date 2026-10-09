/**
 * SupplyShield AI — Groq API Client (Phase 5)
 * 
 * Secure backend client communicating with Groq's official OpenAI-compatible API:
 * https://api.groq.com/openai/v1/chat/completions
 * 
 * Safety & Security Guarantees:
 * - Kept strictly on the backend; never exposed to browser or client bundles.
 * - Free-only safety gate: Rejects requests immediately if ENABLE_GROQ=false.
 * - Zero secret logging: Never logs authorization headers or API keys.
 * - Configurable timeout via AbortController.
 * - Dependency injection of fetch function for 100% mocked automated tests (no live network calls).
 */

import { config as defaultConfig } from '../config.js';

export class GroqClient {
  constructor(options = {}) {
    this.config = options.config || defaultConfig;
    // Dependency injection: custom fetch function for tests
    this.fetchFn = options.fetchFn || globalThis.fetch;
  }

  /**
   * Sends a chat completion request to Groq's OpenAI-compatible API
   * 
   * @param {Object} params
   * @param {Array} params.messages Array of { role, content } objects
   * @param {number} [params.temperature=0.2] Low temperature for factually grounded answers
   * @param {number} [params.maxTokens=1000] Upper token bound
   * @returns {Promise<Object>} Structured result object
   */
  async queryGroq({ messages, temperature = 0.2, maxTokens = 1000 }) {
    // 1. Free-only safety gate: Verify Groq is enabled
    if (!this.config.isGroqEnabled()) {
      return {
        success: false,
        status: 'disabled',
        error: 'Groq AI integration is disabled by default to prevent unwanted API usage.',
        fallbackRecommended: true
      };
    }

    // 2. Verify API key is present
    if (!this.config.GROQ_API_KEY) {
      return {
        success: false,
        status: 'unconfigured',
        error: 'Groq API key is missing on the server. Please set GROQ_API_KEY in your server environment.',
        fallbackRecommended: true
      };
    }

    const endpoint = `${this.config.GROQ_BASE_URL}/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.REQUEST_TIMEOUT_MS);

    try {
      const response = await this.fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: this.config.GROQ_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP Error Codes from Groq API
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            status: 'auth_error',
            httpStatus: response.status,
            error: 'Authentication failed. Please verify your Groq API key.',
            fallbackRecommended: true
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            status: 'provider_rate_limited',
            httpStatus: 429,
            error: 'Groq rate limit reached (Free tier quota). Please wait a moment before sending another query.',
            fallbackRecommended: true
          };
        }

        let providerErrorDetail = `Provider returned HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.error?.message) {
            providerErrorDetail = errJson.error.message;
          }
        } catch {
          // Non-JSON error payload, keep generic detail
        }

        return {
          success: false,
          status: 'provider_error',
          httpStatus: response.status,
          error: `Groq provider error: ${providerErrorDetail}`,
          fallbackRecommended: true
        };
      }

      // Parse JSON response safely
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        return {
          success: false,
          status: 'malformed_response',
          error: `Malformed response received from Groq API: ${parseErr.message}`,
          fallbackRecommended: true
        };
      }

      const answer = data?.choices?.[0]?.message?.content;
      if (!answer || typeof answer !== 'string') {
        return {
          success: false,
          status: 'malformed_response',
          error: 'Response from Groq API did not contain expected message content.',
          fallbackRecommended: true
        };
      }

      return {
        success: true,
        status: 'success',
        answer: answer.trim(),
        model: data.model || this.config.GROQ_MODEL,
        usage: data.usage || null,
        source: 'groq-ai'
      };

    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError' || err.code === 'ABORT_ERR') {
        return {
          success: false,
          status: 'timeout',
          httpStatus: 504,
          error: `Groq API request timed out after ${this.config.REQUEST_TIMEOUT_MS / 1000}s.`,
          fallbackRecommended: true
        };
      }

      return {
        success: false,
        status: 'network_error',
        error: `Network error connecting to Groq API: ${err.message}`,
        fallbackRecommended: true
      };
    }
  }
}

export const groqClient = new GroqClient();
