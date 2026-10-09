import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export function RiskBadge({ level, score }) {
  const normLevel = (level || '').toUpperCase();
  
  if (normLevel === 'HIGH') {
    return (
      <span className="badge badge-high" title={`High Risk Severity Score: ${score || 'High'}/100`}>
        <span className="badge-dot" />
        <AlertTriangle size={12} strokeWidth={2.5} />
        HIGH {score ? `(${score})` : ''}
      </span>
    );
  }
  
  if (normLevel === 'MEDIUM') {
    return (
      <span className="badge badge-med" title={`Medium Risk Severity Score: ${score || 'Medium'}/100`}>
        <span className="badge-dot" />
        <AlertCircle size={12} strokeWidth={2.5} />
        MEDIUM {score ? `(${score})` : ''}
      </span>
    );
  }

  return (
    <span className="badge badge-low" title={`Low Risk Severity Score: ${score || 'Low'}/100`}>
      <span className="badge-dot" />
      <CheckCircle size={12} strokeWidth={2.5} />
      LOW {score ? `(${score})` : ''}
    </span>
  );
}

export function CertificateBadge({ status, expiryDays }) {
  if (status === 'Expiring Soon' || (expiryDays !== undefined && expiryDays <= 30)) {
    return (
      <span className="badge badge-high" title={`Expires in ${expiryDays} days`}>
        <Clock size={12} strokeWidth={2.5} />
        Expiring in {expiryDays}d
      </span>
    );
  }
  
  return (
    <span className="badge badge-low" title="Certificate fully verified and valid">
      <ShieldCheck size={12} strokeWidth={2.5} />
      Valid
    </span>
  );
}

export function CriticalityBadge({ criticality, isSingleSource }) {
  if (isSingleSource) {
    return (
      <span className="badge badge-high" title="Single approved supplier — zero redundancy">
        <ShieldAlert size={12} strokeWidth={2.5} />
        Sole Source
      </span>
    );
  }

  if (criticality?.toLowerCase().includes('critical') || criticality?.toLowerCase().includes('high')) {
    return (
      <span className="badge badge-info" title="High manufacturing criticality">
        Critical Item
      </span>
    );
  }

  return (
    <span className="badge badge-neutral" title="Standard commodity item">
      Standard
    </span>
  );
}
