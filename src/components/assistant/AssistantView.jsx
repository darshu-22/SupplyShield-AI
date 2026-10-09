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
  User
} from 'lucide-react';
import { processAssistantQuery } from '../../assistant/assistantService';

const STARTER_QUESTIONS = [
  "Which supplier is the riskiest and why?",
  "What are the top three procurement actions requiring attention?",
  "What evidence supports the highest-risk supplier's score?",
  "What happens if we increase safety stock by 30 days for Supplier A?",
  "Which supplier has the largest calculated price variance?",
  "What should procurement investigate first?"
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
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = useCallback((textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    const userMessage = {
      id: generateMsgId('USER'),
      role: 'user',
      content: query,
      timestamp: getFormattedTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsProcessing(true);

    // Deterministic processing with immediate UI feedback
    setTimeout(() => {
      const assistantResponse = processAssistantQuery(query, suppliers, messages);
      setMessages(prev => [...prev, assistantResponse]);
      setIsProcessing(false);
    }, 60);
  }, [inputQuery, isProcessing, suppliers, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (inputRef.current) inputRef.current.focus();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                AI Procurement Assistant
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--teal-primary)',
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                Deterministic Intent Engine
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              100% local evidence-backed analysis • Cites purchase orders, inspection lots, and what-if scenarios
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
            Clear Conversation
          </button>
        )}
      </div>

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
                Ask questions about supplier risks, compare contract price variances, evaluate quality defects, or run hypothetical what-if simulations.
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
              {STARTER_QUESTIONS.map((q, idx) => (
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
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

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
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--teal-primary)',
                  flexShrink: 0
                }}>
                  <Bot size={18} />
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      SupplyShield Intelligence • {msg.intent?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {msg.timestamp}
                    </span>
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
                      Observed Transaction Facts:
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

        {/* Processing Indicator */}
        {isProcessing && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--teal-primary)'
            }}>
              <Bot size={18} />
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
              <span className="badge-dot" style={{ backgroundColor: 'var(--teal-primary)' }} />
              Querying transaction records and decision orchestrator...
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
          placeholder="Ask a question about supplier risks, purchase orders, or what-if scenarios (Press Enter to send)..."
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
