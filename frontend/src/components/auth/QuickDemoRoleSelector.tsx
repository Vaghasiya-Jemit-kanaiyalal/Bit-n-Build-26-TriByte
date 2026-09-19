import React from 'react';
import { UserCheck, ShieldAlert, WifiOff } from 'lucide-react';
import type { UserRole } from '../../types/auth';

interface QuickDemoRoleSelectorProps {
  onSelectRole: (role: UserRole, email: string) => void;
  onSimulateError: (type: 'credentials' | 'network') => void;
}

export const QuickDemoRoleSelector: React.FC<QuickDemoRoleSelectorProps> = ({
  onSelectRole,
  onSimulateError,
}) => {
  return (
    <div
      style={{
        padding: '0.65rem 0.85rem',
        backgroundColor: 'rgba(245, 244, 239, 0.03)',
        border: '1px dashed var(--border-medium)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.4rem',
        }}
      >
        <span
          className="mono"
          style={{ fontSize: '0.68rem', color: 'var(--accent-sand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          ⚡ Quick Fill Demo Presets
        </span>
        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
          TESTING SUITE
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSelectRole('Waste Manager', 'admin.manager@wastewise.ai')}
          style={{ height: '26px', fontSize: '0.725rem', padding: '0 0.5rem' }}
        >
          <UserCheck size={12} style={{ color: 'var(--accent-olive)' }} />
          Manager
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSelectRole('Driver / Field Worker', 'driver.field@wastewise.ai')}
          style={{ height: '26px', fontSize: '0.725rem', padding: '0 0.5rem' }}
        >
          <UserCheck size={12} style={{ color: 'var(--accent-sand)' }} />
          Driver
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSelectRole('Analyst / Supervisor', 'analyst.supervisor@wastewise.ai')}
          style={{ height: '26px', fontSize: '0.725rem', padding: '0 0.5rem' }}
        >
          <UserCheck size={12} style={{ color: 'var(--accent-amber)' }} />
          Analyst
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSimulateError('credentials')}
          style={{ height: '26px', fontSize: '0.725rem', padding: '0 0.5rem', color: '#e89e9b' }}
        >
          <ShieldAlert size={12} />
          Bad Auth Error
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSimulateError('network')}
          style={{ height: '26px', fontSize: '0.725rem', padding: '0 0.5rem', color: 'var(--text-muted)' }}
        >
          <WifiOff size={12} />
          Network Error
        </button>
      </div>
    </div>
  );
};
