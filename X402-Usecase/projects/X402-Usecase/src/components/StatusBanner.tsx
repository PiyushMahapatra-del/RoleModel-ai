import React from 'react';

export type PaymentStage = 'idle' | 'connecting' | 'signing' | 'processing' | 'success' | 'error';

interface StatusBannerProps {
  stage: PaymentStage;
  errorMessage?: string | null;
}

const STAGE_COPY: Record<Exclude<PaymentStage, 'idle' | 'error'>, string> = {
  connecting: 'Waiting for wallet connection…',
  signing: 'Sign the payment request in your wallet…',
  processing: 'Payment settled — analyzing with RoleModel AI…',
  success: 'Done — results below.',
};

const DOT_CLASS: Record<Exclude<PaymentStage, 'idle' | 'error'>, string> = {
  connecting: 'bg-ochre-500 animate-pulse',
  signing: 'bg-ochre-500 animate-pulse',
  processing: 'bg-ochre-500 animate-pulse',
  success: 'bg-sage-500',
};

const StatusBanner: React.FC<StatusBannerProps> = ({ stage, errorMessage }) => {
  if (stage === 'idle') return null;

  if (stage === 'error') {
    return (
      <div className="pp-status-error">
        <span className="pp-status-dot bg-red-500" aria-hidden="true" />
        <span>{errorMessage || 'Something went wrong. Please try again.'}</span>
      </div>
    );
  }

  return (
    <div className="pp-status-row">
      {stage === 'success' ? (
        <span className={`pp-status-dot ${DOT_CLASS[stage]}`} aria-hidden="true" />
      ) : (
        <span className="pp-spinner" aria-hidden="true" />
      )}
      <span>{STAGE_COPY[stage]}</span>
    </div>
  );
};

export default StatusBanner;
