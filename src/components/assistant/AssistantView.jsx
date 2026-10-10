import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  User,
  Cpu,
  Lock,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { processAssistantQuery } from '../../assistant/assistantService';
import { checkGroqStatus, processAssistantQueryUnified } from '../../assistant/groqAssistantService';

const STARTER_QUESTIONS = [
  "Which supplier is the riskiest and why?",
  "What are the top three procurement actions requiring attention?",
  "What evidence supports the highest-risk supplier's score?",
  "Why is Supplier A classified as high risk?",
  "Compare the deterministic risk findings for Supplier A and Supplier C",
  "What happens if we increase safety stock by 30 days for Supplier A?",
  "Which supplier has the largest calculated price variance?",
  "Explain the existing agents' findings in simple language"
];

let msgSeq = 0;
const generateMsgId = (prefix) => `${prefix}-${Date.now()}-${++msgSeq}`;
const getFormattedTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function AssistantView({ 
  suppliers = [], 
  onInspectSupplier, 
  onQueueDecision,
  onNavigateTab 
}) {
  const isUploadedContext = suppliers.length > 0 && Boolean(suppliers[0]?.isUploaded);
  const s0Name = suppliers[0]?.shortName || suppliers[0]?.name || 'Vendor 1';
  const s1Name = suppliers[1]?.shortName || suppliers[1]?.name || 'Vendor 2';

  const starterQuestions = isUploadedContext ? [
    "Which uploaded vendor has the highest calculated risk?",
    `Why was ${s0Name} classified as ${suppliers[0]?.riskLevel || 'high'} risk?`,
    `What data is missing for ${s0Name}?`,
    "Which suppliers need attention in the next 30 days?",
    "What should procurement do first?",
    "What evidence supports the recommendation?",
    `Compare the delivery and quality performance of ${s0Name} and ${s1Name}`,
    `What happens if we increase safety stock by 30 days for ${s0Name}?`
  ] : STARTER_QUESTIONS;

  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantMode, setAssistantMode] = useState('deterministic'); // 'deterministic' | 'groq'
  const [groqStatus, setGroqStatus] = useState({
    available: false,
    enabled: false,
    configured: false,
    model: 'llama-3.3-70b-versatile',
    modeDescription: 'Free-only deterministic mode'
  });
  const [activeError, setActiveError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Poll backend status on mount
  useEffect(() => {
    let isMounted = true;
    checkGroqStatus().then(status => {
      if (isMounted) {
        setGroqStatus(status);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = useCallback(async (textToSend, overrideMode = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    setActiveError(null);

    const userMessage = {
      id: generateMsgId('USER'),
      role: 'user',
      content: query,
      timestamp: getFormattedTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsProcessing(true);

    const modeToUse = overrideMode || assistantMode;

    try {
      if (modeToUse === 'groq') {
        const response = await processAssistantQueryUnified(query, suppliers, messages, {
          useGroq: true,
          groqConfigured: groqStatus.enabled && groqStatus.configured
        });

        if (response.groqError && !response.content) {
          setActiveError({
            query,
            error: response.groqError,
            status: response.status
          });
        }

        setMessages(prev => [...prev, response]);
      } else {
        // Direct local deterministic processing
        setTimeout(() => {
          const deterministicResponse = processAssistantQuery(query, suppliers, messages);
          setMessages(prev => [...prev, {
            ...deterministicResponse,
            source: 'deterministic',
            isAiGenerated: false
          }]);
          setIsProcessing(false);
        }, 60);
        return;
      }
    } catch (err) {
      // Safe fallback to deterministic on unexpected exception
      const fallback = processAssistantQuery(query, suppliers, messages);
      setMessages(prev => [...prev, {
        ...fallback,
        source: 'deterministic-fallback',
        isAiGenerated: false,
        fallbackReason: `Client communication error: ${err.message}. Answered via deterministic engine.`
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputQuery, setInputQuery, isProcessing, assistantMode, groqStatus, suppliers, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setActiveError(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleManualRetryGroq = (query) => {
    setActiveError(null);
    handleSendMessage(query, 'groq');
  };

  const handleManualFallbackDeterministic = (query) => {
    setActiveError(null);
    handleSendMessage(query, 'deterministic');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - var(--header-height) - 48px)',
      maxHeight: '1000px',
      gap: '16px'
    }}>
      {/* Top Assistant Header & Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)'
      }}>
        {/* Title & Engine Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: assistantMode === 'groq' && groqStatus.enabled
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
            transition: 'background 0.3s ease'
          }}>
            {assistantMode === 'groq' ? <Sparkles size={20} /> : <Bot size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                AI Procurement Assistant
              </h2>

              {/* Status Indicator Pill */}
              {groqStatus.enabled && groqStatus.configured ? (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Groq AI Active ({groqStatus.model})
                </span>
              ) : (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: 'var(--teal-primary)',
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={10} />
                  Groq AI: Disabled (Free Tier Safety)
                </span>
              )}

              {/* Active Dataset Context Badge */}
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: isUploadedContext ? '#10b981' : '#38bdf8',
                backgroundColor: isUploadedContext ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                border: `1px solid ${isUploadedContext ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {isUploadedContext ? `Uploaded Dataset (${suppliers.length} vendors)` : 'Demo Dataset (5 vendors)'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {assistantMode === 'groq'
                ? 'Groq-powered natural language explanations (Meta Llama 3.3 70B) • Grounded in authoritative risk records'
                : '100% local evidence-backed analysis • Zero API costs • Authoritative deterministic engine'}
            </p>
          </div>
        </div>

        {/* Engine Switcher Controls & Clear Conversation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Segmented Mode Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setAssistantMode('deterministic')}
              style={{
                fontSize: '0.72rem',
                fontWeight: assistantMode === 'deterministic' ? 600 : 400,
                color: assistantMode === 'deterministic' ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: assistantMode === 'deterministic' ? 'var(--bg-card-elevated)' : 'transparent',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Runs 100% offline using deterministic calculations without external network calls"
            >
              <Cpu size={12} />
              Deterministic (Free / Local)
            </button>
            <button
              onClick={() => setAssistantMode('groq')}
              style={{
                fontSize: '0.72rem',
                fontWeight: assistantMode === 'groq' ? 600 : 400,
                color: assistantMode === 'groq' ? 'var(--teal-light)' : 'var(--text-muted)',
                backgroundColor: assistantMode === 'groq' ? 'var(--bg-card-elevated)' : 'transparent',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Queries Groq API for natural-language explanations (disabled by default)"
            >
              <Sparkles size={12} />
              Groq AI (Free Tier)
            </button>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice Banner when Groq Mode is Selected but Disabled */}
      {assistantMode === 'groq' && (!groqStatus.enabled || !groqStatus.configured) && (
        <div style={{
          backgroundColor: 'rgba(14, 165, 233, 0.08)',
          border: '1px solid rgba(14, 165, 233, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Info size={15} style={{ color: 'var(--teal-primary)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Free-Only Safety Mode Active:</strong> Groq AI calls are disabled in server configuration (<code>ENABLE_GROQ=false</code>). 
            Questions will be answered instantly via the authoritative <strong>Deterministic Engine</strong> with zero API fees.
          </div>
        </div>
      )}

      {/* Main Chat Conversation Container */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Empty State / Suggested Questions */}
        {messages.length === 0 && (
          suppliers.length === 0 ? (
            <div style={{
              margin: 'auto',
              maxWidth: '540px',
              textAlign: 'center',
              padding: '40px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--teal-primary)'
              }}>
                <Bot size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                No Uploaded Vendors in Active Context
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                You are currently in Uploaded Dataset mode, but no file has been imported yet. Import vendor data to ask the assistant questions about your suppliers.
              </p>
              <button 
                onClick={() => onNavigateTab && onNavigateTab('import')}
                className="btn btn-primary"
                style={{ marginTop: '8px' }}
              >
                Go to Import & Analyze
              </button>
            </div>
          ) : (
            <div style={{
              margin: 'auto',
              maxWidth: '680px',
              textAlign: 'center',
              padding: '30px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--teal-primary)'
              }}>
                <Sparkles size={26} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  How can I assist your procurement decisions today?
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '540px' }}>
                  {isUploadedContext 
                    ? `Ask questions grounded in your ${suppliers.length} uploaded vendor records, missing data, or risk findings.`
                    : 'Ask questions about supplier risks, compare contract price variances, evaluate quality defects, or synthesize multi-vector findings.'}
                </p>
              </div>

              {/* Starter Questions Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '10px',
                width: '100%',
                marginTop: '10px'
              }}>
                {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    textAlign: 'left',
                    color: 'var(--text-main)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--teal-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }}
                >
                  <span>{q}</span>
                  <ArrowRight size={13} style={{ color: 'var(--teal-primary)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )
      )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isGroqMessage = msg.source === 'groq-ai' || msg.source === 'grok-ai' || msg.isAiGenerated;
          const isFallbackMessage = msg.source === 'deterministic-fallback';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '75%' : '88%'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: isGroqMessage
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(14, 165, 233, 0.15)',
                  border: isGroqMessage
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(14, 165, 233, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isGroqMessage ? '#10b981' : 'var(--teal-primary)',
                  flexShrink: 0
                }}>
                  {isGroqMessage ? <Sparkles size={18} /> : <Bot size={18} />}
                </div>
              )}

              <div style={{
                backgroundColor: isUser ? 'var(--teal-primary)' : 'var(--bg-card-elevated)',
                color: isUser ? '#ffffff' : 'var(--text-main)',
                border: `1px solid ${isUser ? 'transparent' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.5,
                fontSize: '0.85rem'
              }}>
                {/* Header (Assistant) */}
                {!isUser && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isGroqMessage ? (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#10b981',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Sparkles size={11} />
                          Groq AI Explanation ({msg.model || 'Groq Cloud'})
                        </span>
                      ) : isFallbackMessage ? (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#f59e0b',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          Deterministic Engine • Fallback
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--teal-primary)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          SupplyShield Intelligence • {msg.intent?.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* AI Explanation Banner vs Deterministic Marker */}
                {!isUser && isGroqMessage && (
                  <div style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    color: '#86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Sparkles size={12} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>AI Explanation:</strong> Synthesized by Groq AI. Numerical risk scores and financial figures remain strictly calculated by the authoritative risk engine.
                    </span>
                  </div>
                )}

                {/* Fallback explanation banner if applicable */}
                {!isUser && isFallbackMessage && msg.fallbackReason && (
                  <div style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    color: '#fde047',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                    <span>{msg.fallbackReason}</span>
                  </div>
                )}

                {/* Main Content Markdown-like Rendering */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>

                {/* Observed Facts Box */}
                {!isUser && msg.observedFacts && msg.observedFacts.length > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ color: 'var(--teal-light)', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={13} />
                      Verified Calculated Transaction Facts:
                    </div>
                    <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {msg.observedFacts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What-If Scenario Result Card */}
                {!isUser && msg.scenarioResult && (
                  <div style={{
                    backgroundColor: 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--teal-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sliders size={14} />
                        Hypothetical Score Trajectory
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: msg.scenarioResult.scoreDelta < 0 ? 'var(--risk-low-bg)' : 'var(--risk-high-bg)',
                        color: msg.scenarioResult.scoreDelta < 0 ? 'var(--risk-low-text)' : 'var(--risk-high-text)'
                      }}>
                        {msg.scenarioResult.scoreDelta < 0 ? 'Risk Reduced' : 'Risk Elevated'} ({msg.scenarioResult.scoreDelta > 0 ? '+' : ''}{msg.scenarioResult.scoreDelta} pts)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Original Score</span>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{msg.scenarioResult.originalScore}/100</strong>
                      </div>
                      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Hypothetical Score</span>
                        <strong style={{ color: 'var(--teal-light)', fontSize: '0.85rem' }}>{msg.scenarioResult.hypotheticalScore}/100</strong>
                      </div>
                      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Category Shift</span>
                        <strong style={{ color: '#86efac', fontSize: '0.85rem' }}>{msg.scenarioResult.originalCategory} &rarr; {msg.scenarioResult.hypotheticalCategory}</strong>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontStyle: 'italic' }}>
                      {msg.scenarioResult.safetyNotice}
                    </p>
                  </div>
                )}

                {/* Evidence Citations Pill Box */}
                {!isUser && msg.evidence && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '6px',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>Referenced Records:</span>
                    {msg.evidence.poNumbers?.map((po) => (
                      <span key={po} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '1px 6px', borderRadius: '3px', color: 'var(--teal-light)' }}>
                        {po}
                      </span>
                    ))}
                    {msg.evidence.lotNumbers?.slice(0, 3).map((lot) => (
                      <span key={lot} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '1px 6px', borderRadius: '3px', color: '#fde047' }}>
                        {lot}
                      </span>
                    ))}
                    {msg.evidence.certNumber && (
                      <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '1px 6px', borderRadius: '3px', color: '#a78bfa' }}>
                        Cert: {msg.evidence.certNumber}
                      </span>
                    )}
                  </div>
                )}

                {/* Governance Sign-Off Notice */}
                {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    color: '#fde047'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={13} />
                      Consequential procurement interventions require human executive sign-off.
                    </span>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {msg.supplierId && onInspectSupplier && (
                        <button
                          onClick={() => {
                            const found = suppliers.find(s => s.id === msg.supplierId || s.code === msg.supplierCode);
                            if (found) onInspectSupplier(found);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        >
                          Inspect {msg.supplierCode || 'Supplier'} &rarr;
                        </button>
                      )}

                      {onQueueDecision && msg.recommendations && msg.recommendations.length > 0 && (
                        <button
                          onClick={() => {
                            const recTitle = msg.recommendations[0].split('—')[0].replace(/•/g, '').trim();
                            onQueueDecision({
                              id: `ACT-ASST-${Date.now()}`,
                              supplierId: msg.supplierId || 'SUP-001',
                              supplierCode: msg.supplierCode || 'SUP-A',
                              supplierName: msg.supplierCode ? `Supplier ${msg.supplierCode}` : 'Portfolio Vendor',
                              actionTitle: recTitle,
                              category: 'Assistant Action Draft',
                              urgency: 'HIGH',
                              status: 'Drafted',
                              auditScore: 85,
                              financialValue: msg.evidence?.overpayment || 'Operational Continuity Protection',
                              whyRecommended: msg.recommendations[0],
                              suggestedNextStep: 'Executive review requested via AI Assistant'
                            });
                            if (onNavigateTab) onNavigateTab('decisions');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        >
                          Stage Action Draft
                        </button>
                      )}

                      <button
                        onClick={() => onNavigateTab && onNavigateTab('decisions')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                      >
                        Open Decisions Pipeline &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Ups Pills */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '6px'
                  }}>
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(fu)}
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '3px 10px',
                          fontSize: '0.72rem',
                          color: 'var(--teal-light)',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              )}
            </div>
          );
        })}

        {/* Inline Manual Retry Card if an error occurred */}
        {activeError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.8rem',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 600 }}>
              <AlertTriangle size={15} />
              Groq AI Request Exception
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {activeError.error || 'The external AI service is currently unavailable or rate limited.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => handleManualRetryGroq(activeError.query)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <RefreshCw size={12} />
                Retry with Groq AI
              </button>
              <button
                onClick={() => handleManualFallbackDeterministic(activeError.query)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Cpu size={12} />
                Answer via Deterministic Engine
              </button>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: assistantMode === 'groq' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
              border: assistantMode === 'groq' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: assistantMode === 'groq' ? '#10b981' : 'var(--teal-primary)'
            }}>
              {assistantMode === 'groq' ? <Sparkles size={18} /> : <Bot size={18} />}
            </div>
            <div style={{
              backgroundColor: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="badge-dot" style={{ backgroundColor: assistantMode === 'groq' ? '#10b981' : 'var(--teal-primary)' }} />
              {assistantMode === 'groq'
                ? `Synthesizing supplier evidence with Groq AI (${groqStatus.model})...`
                : 'Querying transaction records and decision orchestrator...'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Container */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px'
      }}>
        <textarea
          ref={inputRef}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={assistantMode === 'groq' 
            ? "Ask Groq to explain supplier risks, compare evidence, or analyze mitigation trade-offs..."
            : "Ask a question about supplier risks, purchase orders, or what-if scenarios (Press Enter to send)..."
          }
          rows={2}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.45
          }}
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || isProcessing}
          className="btn btn-primary"
          style={{
            height: '38px',
            padding: '0 16px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Send size={14} />
          Send
        </button>
      </div>
    </div>
  );
}
