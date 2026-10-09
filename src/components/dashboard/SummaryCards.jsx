import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  CheckSquare, 
  DollarSign, 
  ArrowUpRight
} from 'lucide-react';

export function SummaryCards({ 
  suppliers = [], 
  pendingActionsCount = 4,
  onSelectRiskFilter,
  onNavigateTab 
}) {
  const totalSuppliers = suppliers.length;
  const highRiskSuppliers = suppliers.filter(s => s.riskLevel === 'HIGH');
  
  // Calculate total quarterly overpayment exposure across suppliers with positive price variances
  const totalQuarterlyOverpayment = suppliers.reduce((acc, curr) => {
    return acc + (curr.quarterlyOverpaymentExposure || 0);
  }, 0);

  const formattedOverpayment = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalQuarterlyOverpayment);

  const cards = [
    {
      id: 'total-suppliers',
      title: 'Monitored Suppliers',
      value: totalSuppliers,
      subtitle: `${suppliers.filter(s => s.isSingleSource).length} single-source sole providers`,
      icon: Building2,
      accentColor: 'var(--teal-primary)',
      bgTint: 'rgba(14, 165, 233, 0.08)',
      borderColor: 'var(--border-subtle)',
      actionText: 'View All Suppliers',
      onClick: () => onNavigateTab && onNavigateTab('suppliers')
    },
    {
      id: 'high-risk',
      title: 'High-Risk Suppliers',
      value: highRiskSuppliers.length,
      subtitle: 'Critical quality, cert, or delivery breaches',
      icon: AlertTriangle,
      accentColor: 'var(--risk-high-solid)',
      bgTint: 'var(--risk-high-bg)',
      borderColor: 'var(--risk-high-border)',
      actionText: 'Filter High Risk',
      badge: 'Action Needed',
      badgeClass: 'badge-high',
      onClick: () => onSelectRiskFilter && onSelectRiskFilter('HIGH')
    },
    {
      id: 'pending-actions',
      title: 'Pending Decisions',
      value: pendingActionsCount,
      subtitle: 'Awaiting human procurement sign-off',
      icon: CheckSquare,
      accentColor: 'var(--risk-med-solid)',
      bgTint: 'var(--risk-med-bg)',
      borderColor: 'var(--risk-med-border)',
      actionText: 'Open Action Center',
      badge: 'In Review Queue',
      badgeClass: 'badge-med',
      onClick: () => onNavigateTab && onNavigateTab('decisions')
    },
    {
      id: 'price-overpayment',
      title: 'Potential Price Overpayment',
      value: formattedOverpayment,
      subtitle: 'Quarterly unratified contract price variances',
      icon: DollarSign,
      accentColor: '#38bdf8',
      bgTint: 'rgba(56, 189, 248, 0.08)',
      borderColor: 'rgba(56, 189, 248, 0.25)',
      actionText: 'Audit Variances',
      badge: 'Active Leakage',
      badgeClass: 'badge-high',
      isCurrency: true,
      onClick: () => onNavigateTab && onNavigateTab('risk')
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${card.borderColor}`,
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: card.onClick ? 'pointer' : 'default',
              transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = card.accentColor;
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = card.borderColor;
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {/* Top header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {card.title}
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: card.bgTint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.accentColor
              }}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
            </div>

            {/* Metric Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: card.isCurrency ? '1.5rem' : '1.85rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em'
              }}>
                {card.value}
              </span>

              {card.badge && (
                <span className={`badge ${card.badgeClass}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  {card.badge}
                </span>
              )}
            </div>

            {/* Subtitle & Action footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {card.subtitle}
              </p>
              <span style={{ 
                fontSize: '0.72rem', 
                color: card.accentColor, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '2px',
                fontWeight: 600 
              }}>
                {card.actionText} <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
