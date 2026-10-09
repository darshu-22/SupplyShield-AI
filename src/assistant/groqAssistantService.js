/**
 * SupplyShield AI — Groq Assistant Integration Service (Phase 5)
 * 
 * Bridges the frontend Assistant UI with the secure backend Groq endpoint.
 * Provides:
 * - Engine status telemetry (checks if backend is up and if Groq is enabled).
 * - Safe query execution with AbortController timeout.
 * - Authoritative deterministic fallback if Groq is disabled, offline, or rate-limited.
 * - Strict non-mutation guarantees (supplier scores and action states remain untouched).
 */

import { processAssistantQuery } from './assistantService.js';

const STATUS_ENDPOINT = '/api/assistant/status';
const CHAT_ENDPOINT = '/api/assistant/chat';
const CLIENT_TIMEOUT_MS = 25000;
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * Checks the status of the backend Groq integration
 * Safe to call frequently; fails fast if backend is offline.
 */
export async function checkGroqStatus() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(STATUS_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        available: false,
        enabled: false,
        configured: false,
        provider: 'deterministic-local',
        model: DEFAULT_MODEL,
        modeDescription: `Backend error (${res.status}). Deterministic engine active.`
      };
    }

    const data = await res.json();
    return {
      available: true,
      enabled: Boolean(data.enabled),
      configured: Boolean(data.configured),
      provider: data.provider || 'deterministic-local',
      model: data.model || DEFAULT_MODEL,
      modeDescription: data.modeDescription || 'Deterministic local engine'
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      available: false,
      enabled: false,
      configured: false,
      provider: 'deterministic-local',
      model: DEFAULT_MODEL,
      modeDescription: 'Backend offline. Deterministic local engine active (100% Free).'
    };
  }
}

/**
 * Queries the backend Groq assistant endpoint
 */
export async function queryGroqBackend({ message, supplierId = null }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message,
        supplierId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status: data.status || `http_${res.status}`,
        error: data.error || `Server returned error HTTP ${res.status}`,
        fallbackRecommended: true,
        httpStatus: res.status
      };
    }

    return {
      success: true,
      status: 'success',
      answer: data.answer,
      model: data.model || DEFAULT_MODEL,
      source: 'groq-ai',
      targetSupplier: data.targetSupplier,
      detectedIntent: data.detectedIntent
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 'timeout',
        error: 'Request to Groq assistant timed out.',
        fallbackRecommended: true
      };
    }

    return {
      success: false,
      status: 'network_error',
      error: `Network error: ${err.message}`,
      fallbackRecommended: true
    };
  }
}

/**
 * High-level assistant query orchestrator with authoritative fallback.
 * 
 * If groqMode is active and configured:
 *   Attempts Groq AI explanation first.
 *   If successful: returns AI response enriched with verified deterministic facts.
 *   If failed/disabled: gracefully falls back to deterministic engine with notification.
 * 
 * If deterministic mode is active:
 *   Calls deterministic engine directly with 0 external network requests.
 */
export async function processAssistantQueryUnified(
  query,
  suppliers = [],
  conversationHistory = [],
  options = {}
) {
  const { 
    useGroq = options.useGrok || false, 
    groqConfigured = options.grokConfigured || false,
    supplierId = null 
  } = options;

  // 1. Direct deterministic path if Groq is not requested or not configured
  if (!useGroq || !groqConfigured) {
    const deterministicResult = processAssistantQuery(query, suppliers, conversationHistory);
    return {
      ...deterministicResult,
      source: 'deterministic',
      isAiGenerated: false
    };
  }

  // 2. Groq AI path
  const groqRes = await queryGroqBackend({ message: query, supplierId });

  // Baseline deterministic computation for verified facts and follow-ups
  const deterministicRef = processAssistantQuery(query, suppliers, conversationHistory);

  if (groqRes.success) {
    return {
      id: `MSG-GROQ-${Date.now()}`,
      role: 'assistant',
      source: 'groq-ai',
      isAiGenerated: true,
      model: groqRes.model,
      intent: groqRes.detectedIntent || deterministicRef.intent,
      content: groqRes.answer,
      observedFacts: deterministicRef.observedFacts || [],
      inferredRisks: deterministicRef.inferredRisks || [],
      recommendations: deterministicRef.recommendations || [],
      scenarioResult: deterministicRef.scenarioResult || null,
      suggestedFollowUps: deterministicRef.suggestedFollowUps || [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executionTimeMs: deterministicRef.executionTimeMs || 0
    };
  }

  // 3. Fallback path if Groq encountered an error
  let fallbackNote = 'Groq AI was unavailable; answered using authoritative deterministic engine.';
  if (groqRes.status === 'disabled') {
    fallbackNote = 'Groq AI is disabled in server configuration (Free-only safety mode). Answered via deterministic engine.';
  } else if (groqRes.status === 'provider_rate_limited') {
    fallbackNote = 'Groq rate limit reached (Free tier quota). Answered via deterministic engine.';
  } else if (groqRes.status === 'timeout') {
    fallbackNote = 'Groq AI request timed out. Answered via deterministic engine.';
  }

  return {
    ...deterministicRef,
    source: 'deterministic-fallback',
    isAiGenerated: false,
    fallbackReason: fallbackNote,
    groqError: groqRes.error
  };
}

// Backwards compatibility aliases
export const checkGrokStatus = checkGroqStatus;
export const queryGrokBackend = queryGroqBackend;
