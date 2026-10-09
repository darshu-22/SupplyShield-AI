import React from 'react';
import { RefreshCw, SearchX, AlertOctagon, RotateCcw } from 'lucide-react';

export function LoadingState({ message = "Analyzing supplier telemetry and calculating risk scores..." }) {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)'
    }}>
      <RefreshCw size={32} className="spin" style={{ color: 'var(--teal-primary)' }} />
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
          Loading Intelligence Stream
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
          {message}
        </p>
      </div>
    </div>
  );
}

export function EmptyState({ 
  title = "No matching suppliers found", 
  message = "No supplier records matched your current search filters. Try adjusting your query or resetting the filter criteria.",
  onReset 
}) {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border-medium)',
      margin: '12px 0'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-card-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        <SearchX size={24} />
      </div>
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto' }}>
          {message}
        </p>
      </div>
      {onReset && (
        <button 
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '8px' }}
        >
          <RotateCcw size={14} />
          Reset All Filters
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({ 
  title = "Telemetry Feed Disruption", 
  error = "A simulated telemetry connection error occurred while querying risk indices.",
  onRetry 
}) {
  return (
    <div style={{
      padding: '20px 24px',
      backgroundColor: 'var(--risk-high-bg)',
      border: '1px solid var(--risk-high-border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <AlertOctagon size={24} style={{ color: 'var(--risk-high-solid)', flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--risk-high-text)' }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {error}
          </p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-danger btn-sm">
          <RotateCcw size={13} />
          Retry Connection
        </button>
      )}
    </div>
  );
}
