import React from 'react';
import { OperationsVisual } from './OperationsVisual';
import { Sparkles, Target, Route } from 'lucide-react';

export const BrandPanel: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '3rem 3.5rem',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      {/* Top Header & Brand Identity */}
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-olive-muted)',
              border: '1px solid var(--accent-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-olive)',
            }}
          >
            {/* Clean minimal trash/recycle bin icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              EcoTrack <span style={{ color: 'var(--accent-olive)' }}>AI</span>
            </span>
            <span className="mono" style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Operations Platform v2.4
            </span>
          </div>
        </div>

        {/* Tagline & Descriptive Overview */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', lineHeight: '1.25', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
            Smarter Waste.<br />
            <span style={{ color: 'var(--accent-sand)', fontWeight: '500' }}>Cleaner Operations.</span>
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '440px' }}>
            An enterprise intelligence platform that leverages sensor mesh data and predictive AI to forecast bin overflow, streamline collection dispatches, optimize fleet routes, and elevate recycling purity.
          </p>
        </div>

        {/* Abstract Environmental Operations Visual */}
        <div style={{ marginBottom: '2.5rem' }}>
          <OperationsVisual />
        </div>

        {/* 3 Compact Trust / Feature Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Indicator 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-olive)' }}>
              <Sparkles size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                AI Prediction
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Predict upcoming bin overflow hours ahead.
            </p>
          </div>

          {/* Indicator 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-sand)' }}>
              <Target size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                Smart Collection
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Prioritize high-risk bins at the right time.
            </p>
          </div>

          {/* Indicator 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)' }}>
              <Route size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                Route Optimization
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Create efficient fuel-saving collection routes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Attribution */}
      <div style={{ paddingTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          MUNICIPALITY & FACILITY GRADE
        </span>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          SECURE 256-BIT ENCRYPTION
        </span>
      </div>
    </div>
  );
};
