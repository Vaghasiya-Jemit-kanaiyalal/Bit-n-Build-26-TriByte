import React, { useState } from 'react';
import { Navigation, CheckCircle, QrCode } from 'lucide-react';
import type { UserRole } from '../../types/auth';

interface DashboardProps {
  user: { name: string; email: string; role: UserRole; organization: string };
  onSignOut: () => void;
}

export const DriverDashboardPreview: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [completedBins, setCompletedBins] = useState<string[]>([]);

  const handleScanBin = (binId: string) => {
    if (!completedBins.includes(binId)) {
      setCompletedBins([...completedBins, binId]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      {/* Driver Cab Top Header */}
      <header
        style={{
          height: '60px',
          padding: '0 1.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
            EcoTrack <span style={{ color: 'var(--accent-sand)' }}>FIELD</span>
          </div>
          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>TRUCK-04 ACTIVE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{user.name}</div>
            <div className="mono" style={{ fontSize: '0.675rem', color: 'var(--accent-sand)' }}>{user.role}</div>
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

      <main style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Driver Assigned Route Banner */}
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-olive-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-olive)' }}>
              <Navigation size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>ASSIGNED ROUTE #04 — METRO CAMPUS LOOP</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                3 High Priority Pickups • Estimated Fuel Savings: 2.4 Gal • Next Waypoint: 0.8 Miles
              </p>
            </div>
          </div>
          <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent-olive)', fontWeight: '600' }}>
            STATUS: EN ROUTE
          </span>
        </div>

        {/* Priority Waypoint Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>PRIORITY PICKUP WAYPOINTS</h3>

          {/* Waypoint 1 */}
          <div className="card" style={{ borderColor: completedBins.includes('BIN-105') ? 'var(--accent-olive)' : 'var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: completedBins.includes('BIN-105') ? 'var(--accent-olive)' : 'var(--status-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0c0e10', fontWeight: '700' }}>
                  1
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>BIN-105 — Library Courtyard</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Type: Mixed Recyclable • Sensor Level: <strong style={{ color: 'var(--status-critical)' }}>92% FULL</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {completedBins.includes('BIN-105') ? (
                  <span className="badge badge-normal" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    <CheckCircle size={14} /> CLEARED & LOGGED
                  </span>
                ) : (
                  <button
                    className="btn btn-earthy"
                    onClick={() => handleScanBin('BIN-105')}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  >
                    <QrCode size={16} />
                    <span>Scan RFID & Clear Bin</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Waypoint 2 */}
          <div className="card" style={{ borderColor: completedBins.includes('BIN-102') ? 'var(--accent-olive)' : 'var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: completedBins.includes('BIN-102') ? 'var(--accent-olive)' : 'var(--status-critical)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0c0e10', fontWeight: '700' }}>
                  2
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>BIN-102 — Central Sq. Smart Bin</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Type: Organic Waste • Sensor Level: <strong style={{ color: 'var(--status-critical)' }}>88% FULL</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {completedBins.includes('BIN-102') ? (
                  <span className="badge badge-normal" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    <CheckCircle size={14} /> CLEARED & LOGGED
                  </span>
                ) : (
                  <button
                    className="btn btn-earthy"
                    onClick={() => handleScanBin('BIN-102')}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  >
                    <QrCode size={16} />
                    <span>Scan RFID & Clear Bin</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Waypoint 3 */}
          <div className="card" style={{ opacity: 0.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0c0e10', fontWeight: '700' }}>
                  3
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>BIN-103 — Engineering Hub</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Type: Electronic Waste • Sensor Level: 64% FULL
                  </div>
                </div>
              </div>

              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Upcoming Waypoint</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
