import React from 'react';
import { Download } from 'lucide-react';
import type { UserRole } from '../../types/auth';

interface DashboardProps {
  user: { name: string; email: string; role: UserRole; organization: string };
  onSignOut: () => void;
}

export const AnalystDashboardPreview: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      {/* Analyst Header */}
      <header
        style={{
          height: '60px',
          padding: '0 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
            WasteWise <span style={{ color: 'var(--accent-amber)' }}>ANALYTICS</span>
          </div>
          <span style={{ color: 'var(--border-medium)', height: '16px', borderRight: '1px solid currentColor' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {user.organization} — <strong style={{ color: 'var(--text-primary)' }}>SUPERVISOR & ANALYTICS PORTAL</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{user.name}</div>
            <div className="mono" style={{ fontSize: '0.675rem', color: 'var(--accent-amber)' }}>{user.role}</div>
          </div>
          <button
            onClick={onSignOut}
            className="btn btn-secondary"
            style={{ height: '32px', fontSize: '0.775rem', padding: '0 0.75rem' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Waste Stream & AI Recycling Analytics</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Real-time classification telemetry, recycling purity, and municipal diversion rates.
            </p>
          </div>

          <button className="btn btn-secondary" style={{ height: '36px', fontSize: '0.825rem' }}>
            <Download size={14} /> Export CSV & PDF Report
          </button>
        </div>

        {/* Analytics KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>WEEKLY DIVERSION RATE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-olive)' }}>
              74.2% <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>(+4.8%)</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Diverted from Landfills</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>CO2 EMISSIONS REDUCTION</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-sand)' }}>
              -1.42 Tons <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>CO2e</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Fuel Route Optimization</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>AI CLASSIFICATION ACCURACY</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
              98.6% <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Vision Model</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>14,280 Items Classified</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>CONTAMINATION ALERTS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--status-warning)' }}>
              2 Flags <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>(Non-Recyclable)</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Inspection Required</div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Stream Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>AI Waste Classification Stream Breakdown</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Organic / Compostable</span>
                  <span className="mono" style={{ fontWeight: '600' }}>42.5% (6.2 Tons)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{ width: '42.5%', height: '100%', backgroundColor: 'var(--accent-olive)', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Plastics (PET & HDPE)</span>
                  <span className="mono" style={{ fontWeight: '600' }}>28.1% (4.1 Tons)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{ width: '28.1%', height: '100%', backgroundColor: 'var(--accent-sand)', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Paper & Cardboard</span>
                  <span className="mono" style={{ fontWeight: '600' }}>18.4% (2.7 Tons)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{ width: '18.4%', height: '100%', backgroundColor: 'var(--accent-amber)', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>E-Waste & Batteries</span>
                  <span className="mono" style={{ fontWeight: '600' }}>6.2% (0.9 Tons)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{ width: '6.2%', height: '100%', backgroundColor: '#91908a', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Supervisor Audit Log */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>Supervisor Audit & Contamination Log</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--status-warning)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>BIN-104 Flagged for Plastic Contamination</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>10 mins ago • Cafeteria Recycling Unit</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--status-normal)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Weekly Diversion Milestone Achieved (&gt;70%)</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>2 hours ago • System Auto Audit</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--accent-sand)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>AI Vision Classification Retrained (v2.4.1)</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Yesterday • Accuracy increased to 98.6%</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
