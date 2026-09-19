import React from 'react';
import { Truck, AlertTriangle, Recycle, BarChart3, Radio, RefreshCw } from 'lucide-react';
import type { UserRole } from '../../types/auth';

interface DashboardProps {
  user: { name: string; email: string; role: UserRole; organization: string };
  onSignOut: () => void;
}

export const AdminDashboardPreview: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      {/* Top Operations Header */}
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
          <div style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            EcoTrack <span style={{ color: 'var(--accent-olive)' }}>AI</span>
          </div>
          <span style={{ color: 'var(--border-medium)', height: '16px', borderRight: '1px solid currentColor' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {user.organization} — <strong style={{ color: 'var(--text-primary)' }}>ADMIN COMMAND CONSOLE</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
            <Radio size={10} style={{ animation: 'spin 3s linear infinite' }} />
            42 Sensors Active
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{user.name}</div>
            <div className="mono" style={{ fontSize: '0.675rem', color: 'var(--accent-olive)' }}>{user.role}</div>
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
        {/* Role Banner Alert */}
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--accent-olive-muted)', border: '1px solid var(--accent-olive)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Welcome back, {user.name}. You hold Waste Manager / Administrator privileges.
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Full fleet telemetry control, automated dispatch overrides, and bin sensor management are enabled.
            </div>
          </div>
          <span className="badge badge-normal">Admin Privilege Enabled</span>
        </div>

        {/* Operational Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>TOTAL MONITORED BINS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>148 <span style={{ fontSize: '0.85rem', color: 'var(--accent-olive)', fontWeight: '500' }}>+12 online</span></div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Campus & Municipality Fleet</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>CRITICAL OVERFLOW RISK</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--status-critical)' }}>
              3 Bins <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>(&gt;85% Fill)</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Requires Dispatch Priority</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>ACTIVE DISPATCH ROUTES</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-sand)' }}>
              4 Trucks <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>(Routes #1–4)</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>AI Optimized Efficiency 94.8%</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>RECYCLING PURITY SCORE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent-olive)' }}>
              91.4% <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>(+3.2%)</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Target &gt;90% Compliant</div>
          </div>
        </div>

        {/* Operational Control Tables & Action Queue */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Bin Fleet Priority Queue */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Priority Collection Dispatch Queue</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated sensor risk scoring updated 2 mins ago</p>
              </div>
              <button className="btn btn-secondary" style={{ height: '30px', fontSize: '0.75rem' }}>
                <RefreshCw size={12} /> Refresh Sensors
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem' }}>Bin ID & Location</th>
                  <th style={{ padding: '0.6rem' }}>Fill Level</th>
                  <th style={{ padding: '0.6rem' }}>Predicted Overflow</th>
                  <th style={{ padding: '0.6rem' }}>Status</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600' }}>BIN-105 — Library Courtyard</td>
                  <td style={{ padding: '0.75rem 0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                        <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--status-critical)', borderRadius: '3px' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem' }}>92%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem' }} className="mono">in 45 mins</td>
                  <td style={{ padding: '0.75rem 0.6rem' }}><span className="badge badge-critical">Critical</span></td>
                  <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                    <button className="btn btn-earthy" style={{ height: '28px', fontSize: '0.725rem', padding: '0 0.6rem' }}>
                      Dispatch Truck #4
                    </button>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600' }}>BIN-102 — Central Sq. Smart Bin</td>
                  <td style={{ padding: '0.75rem 0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                        <div style={{ width: '88%', height: '100%', backgroundColor: 'var(--status-critical)', borderRadius: '3px' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem' }}>88%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem' }} className="mono">in 1.2 hrs</td>
                  <td style={{ padding: '0.75rem 0.6rem' }}><span className="badge badge-critical">Critical</span></td>
                  <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                    <button className="btn btn-earthy" style={{ height: '28px', fontSize: '0.725rem', padding: '0 0.6rem' }}>
                      Dispatch Truck #4
                    </button>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600' }}>BIN-103 — Engineering Hub</td>
                  <td style={{ padding: '0.75rem 0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                        <div style={{ width: '64%', height: '100%', backgroundColor: 'var(--status-warning)', borderRadius: '3px' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem' }}>64%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem' }} className="mono">in 3.5 hrs</td>
                  <td style={{ padding: '0.75rem 0.6rem' }}><span className="badge badge-warning">Warning</span></td>
                  <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ height: '28px', fontSize: '0.725rem', padding: '0 0.6rem' }}>
                      Schedule Queue
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Admin Actions & Overrides */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Admin Overrides</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Manager privileges permit manual route recalculations and sensor thresholds.
            </p>

            <button className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <Truck size={16} />
              <span>Trigger AI Route Optimization</span>
            </button>

            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />
              <span>Broadcast Overflow Alert</span>
            </button>

            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <Recycle size={16} style={{ color: 'var(--accent-olive)' }} />
              <span>Recycling Purity Calibration</span>
            </button>

            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <BarChart3 size={16} />
              <span>Export Compliance Audit Report</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
