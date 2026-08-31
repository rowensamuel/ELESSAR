import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash, WifiOff } from 'lucide-react';
import { ApiError } from '../../services/apiClient';

export interface ErrorFallbackProps {
  error: Error | ApiError | string | null | unknown;
  onRetry?: () => void;
  title?: string;
  variant?: 'page' | 'card' | 'banner';
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title,
  variant = 'card',
  className = '',
}) => {
  let errorMessage = 'An unexpected error occurred while communicating with the telemetry server.';
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode: number | undefined;

  if (error instanceof ApiError) {
    errorMessage = error.message;
    errorCode = error.code;
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorCode = error.name;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const isNetworkError = errorCode === 'NETWORK_ERROR' || statusCode === 0;
  const isNotFound = statusCode === 404;

  const defaultTitle = isNetworkError
    ? 'Telemetry Service Disconnected'
    : isNotFound
    ? 'Resource Not Found'
    : 'Data Pipeline Operation Failed';

  const heading = title || defaultTitle;

  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-xl bg-[var(--negative-subtle)] border border-[var(--negative)]/30 flex items-center justify-between gap-4 font-sans ${className}`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--negative)] flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[var(--negative)]">{heading}</p>
            <p className="text-[11px] text-[var(--text-secondary)]">{errorMessage}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-[var(--negative-subtle)] border border-[var(--negative)]/40 flex items-center justify-center mb-5 text-[var(--negative)] shadow-lg">
          {isNetworkError ? <WifiOff className="w-8 h-8" /> : <ServerCrash className="w-8 h-8" />}
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--negative-subtle)] border border-[var(--negative)]/30 text-[10px] font-mono font-bold text-[var(--negative)] uppercase tracking-wider mb-2">
          <span>CODE // {errorCode}</span>
          {statusCode !== undefined && statusCode > 0 && <span>(HTTP {statusCode})</span>}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] mb-2">
          {heading}
        </h2>

        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6 leading-relaxed">
          {errorMessage}
        </p>

        {isNetworkError && (
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-left text-xs text-[var(--text-muted)] max-w-md mb-6 space-y-1 font-mono">
            <div className="font-bold text-[var(--accent)]">SYSTEM DIAGNOSTICS:</div>
            <div>• Ensure API server is active on: <code className="text-[var(--text-primary)]">http://localhost:5000</code></div>
            <div>• Verify endpoint route: <code className="text-[var(--text-primary)]">/api/health</code></div>
            <div>• Check CORS & MongoDB database connectivity</div>
          </div>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98 uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  // Card Variant
  return (
    <div className={`p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden font-sans ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-[var(--negative-subtle)] border border-[var(--negative)]/30 text-[var(--negative)] flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[var(--negative)] uppercase tracking-wider">
              {heading}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
              {errorCode}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {errorMessage}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--border)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border)] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Fetch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
