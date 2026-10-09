import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Building2, 
  AlertTriangle, 
  CheckSquare, 
  Activity, 
  X, 
  Database,
  Bot
} from 'lucide-react';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen,
  supplierCount = 6,
  highRiskCount = 3,
  pendingDecisionsCount = 4
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: Bot,
      badge: 'Agentic'
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Building2,
      badge: supplierCount
    },
    {
      id: 'risk',
      label: 'Risk Analysis',
      icon: AlertTriangle,
      badge: highRiskCount > 0 ? `${highRiskCount} High` : null,
      badgeType: 'high'
    },
    {
      id: 'decisions',
      label: 'Decisions',
      icon: CheckSquare,
      badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : null,
      badgeType: 'pending'
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      badge: 'Live'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 24, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 998
          }}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        transform: isMobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s ease',
      }}
      className={isMobileOpen ? 'sidebar-open' : 'sidebar-normal'}
      >
        {/* Brand Header */}
        <div style={{
          padding: '20px 20px 16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(14, 165, 233, 0.35)',
              color: '#ffffff'
            }}>
              <ShieldAlert size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.08rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                SupplyShield <span style={{ color: 'var(--teal-primary)', fontSize: '0.82rem', fontWeight: 600 }}>AI</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Supplier Risk Intel
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            className="btn btn-subtle btn-icon" 
            onClick={() => setIsMobileOpen(false)}
            style={{ display: isMobileOpen ? 'flex' : 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Fictional Mode Flag */}
        <div style={{
          margin: '12px 16px',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(14, 165, 233, 0.08)',
          border: '1px solid rgba(14, 165, 233, 0.22)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Database size={13} style={{ color: 'var(--teal-primary)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--teal-primary)', fontWeight: 600 }}>
            Phase 1 Demonstration Engine
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            padding: '8px 8px 4px 8px' 
          }}>
            Procurement Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-focus)' : 'transparent',
                  backgroundColor: isActive ? 'var(--bg-card-elevated)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon 
                    size={18} 
                    style={{ 
                      color: isActive ? 'var(--teal-primary)' : 'var(--text-muted)',
                      transition: 'color 0.15s ease'
                    }} 
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: item.badgeType === 'high' 
                      ? 'var(--risk-high-bg)' 
                      : item.badgeType === 'pending'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'var(--bg-card-hover)',
                    color: item.badgeType === 'high'
                      ? 'var(--risk-high-text)'
                      : item.badgeType === 'pending'
                      ? 'var(--risk-med-text)'
                      : 'var(--teal-primary)',
                    border: `1px solid ${
                      item.badgeType === 'high' 
                        ? 'var(--risk-high-border)' 
                        : item.badgeType === 'pending'
                        ? 'var(--risk-med-border)'
                        : 'var(--border-subtle)'
                    }`
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Telemetry Status */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(11, 19, 37, 0.5)',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block'
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Telemetry Active</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.71rem', lineHeight: 1.4 }}>
            Local demo dataset loaded. Single-source audit rules active.
          </p>
        </div>
      </aside>
    </>
  );
}
