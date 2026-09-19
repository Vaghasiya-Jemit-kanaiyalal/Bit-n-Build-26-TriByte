import React, { useEffect, useRef, useState } from 'react';

interface BinNode {
  id: string;
  x: number;
  y: number;
  fill: number; // 0 to 100
  label: string;
  status: 'normal' | 'warning' | 'critical';
}

export const OperationsVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTelemetry, setActiveTelemetry] = useState<string>(
    'SYSTEM ONLINE // SENSOR MESH ACTIVE // AI ROUTE OPTIMIZER RUNNING'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mock Bin nodes across a campus grid layout
    const nodes: BinNode[] = [
      { id: 'BIN-101', x: width * 0.2, y: height * 0.35, fill: 42, label: 'North Gate Bin', status: 'normal' },
      { id: 'BIN-102', x: width * 0.42, y: height * 0.25, fill: 88, label: 'Central Sq. Smart Bin', status: 'critical' },
      { id: 'BIN-103', x: width * 0.75, y: height * 0.3, fill: 64, label: 'Engineering Hub', status: 'warning' },
      { id: 'BIN-104', x: width * 0.3, y: height * 0.68, fill: 30, label: 'Cafeteria Recycling', status: 'normal' },
      { id: 'BIN-105', x: width * 0.62, y: height * 0.65, fill: 92, label: 'Library Courtyard', status: 'critical' },
      { id: 'BIN-106', x: width * 0.85, y: height * 0.72, fill: 55, label: 'East Parking Lot', status: 'normal' },
    ];

    // Animated particles flowing along the route
    let progress = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Restrained Grid
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(245, 244, 239, 0.03)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Render Minimal Campus/City Silhouette Lines at Bottom
      ctx.strokeStyle = 'rgba(245, 244, 239, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 30);
      ctx.lineTo(width * 0.15, height - 30);
      ctx.lineTo(width * 0.15, height - 70);
      ctx.lineTo(width * 0.28, height - 70);
      ctx.lineTo(width * 0.28, height - 30);
      ctx.lineTo(width * 0.45, height - 30);
      ctx.lineTo(width * 0.45, height - 90);
      ctx.lineTo(width * 0.58, height - 90);
      ctx.lineTo(width * 0.58, height - 40);
      ctx.lineTo(width * 0.75, height - 40);
      ctx.lineTo(width * 0.75, height - 110);
      ctx.lineTo(width * 0.88, height - 110);
      ctx.lineTo(width * 0.88, height - 30);
      ctx.lineTo(width, height - 30);
      ctx.stroke();

      // Fill area lightly under silhouette
      ctx.fillStyle = 'rgba(18, 22, 26, 0.4)';
      ctx.fill();

      // 3. Render Optimized Route Path connecting critical/warning nodes
      // Route sequence: Depot (0.1, 0.8) -> BIN-102 -> BIN-105 -> BIN-103 -> Depot
      const routePoints = [
        { x: width * 0.08, y: height * 0.85 },
        { x: nodes[1].x, y: nodes[1].y },
        { x: nodes[4].x, y: nodes[4].y },
        { x: nodes[2].x, y: nodes[2].y },
        { x: width * 0.08, y: height * 0.85 },
      ];

      ctx.beginPath();
      ctx.moveTo(routePoints[0].x, routePoints[0].y);
      for (let i = 1; i < routePoints.length; i++) {
        ctx.lineTo(routePoints[i].x, routePoints[i].y);
      }
      ctx.strokeStyle = 'rgba(115, 138, 98, 0.35)'; // Muted olive line
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Render Route Particle Motion
      progress += 0.003;
      if (progress > 1) progress = 0;

      // Interpolate along route segments
      const totalSegments = routePoints.length - 1;
      const segmentProgress = progress * totalSegments;
      const currentSegmentIndex = Math.floor(segmentProgress);
      const subProgress = segmentProgress - currentSegmentIndex;

      if (currentSegmentIndex < totalSegments) {
        const p1 = routePoints[currentSegmentIndex];
        const p2 = routePoints[currentSegmentIndex + 1];
        const px = p1.x + (p2.x - p1.x) * subProgress;
        const py = p1.y + (p2.y - p1.y) * subProgress;

        // Pulse dot
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#c9bfab'; // Sand highlight
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(201, 191, 171, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 5. Render Bin Nodes & Status Indicators
      nodes.forEach((node) => {
        // Node outer ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 22, 26, 0.9)';
        ctx.fill();

        let nodeColor = 'rgba(115, 138, 98, 0.8)'; // Olive (normal)
        if (node.status === 'warning') nodeColor = 'rgba(196, 137, 59, 0.85)'; // Amber
        if (node.status === 'critical') nodeColor = 'rgba(186, 87, 83, 0.9)'; // Muted Red

        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node center fill level
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Small data label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(245, 244, 239, 0.4)';
        ctx.fillText(`${node.id} (${node.fill}%)`, node.x + 12, node.y + 3);
      });

      // 6. Depot Marker
      const depotX = width * 0.08;
      const depotY = height * 0.85;
      ctx.beginPath();
      ctx.rect(depotX - 6, depotY - 6, 12, 12);
      ctx.strokeStyle = 'rgba(201, 191, 171, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(201, 191, 171, 0.6)';
      ctx.fillText('DEPOT 01', depotX - 18, depotY + 18);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Telemetry log ticker cycling
    const telemetryLogs = [
      'PREDICTIVE ENGINE: BIN-105 OVERFLOW PROJECTION AT 14:30',
      'ROUTE OPTIMIZER: DISPATCH VEHICLE TRUCK-04 (SAVING 18% FUEL)',
      'RECYCLING PURITY SCAN: CAMPUS HUB 94.2% PURITY SCORE',
      'SENSOR MESH: 42 BINS ONLINE // ZERO TELEMETRY GAPS',
      'CARBON DIVERSION METRIC: -410 KG CO2 EQUIVALENT THIS WEEK',
    ];
    let logIndex = 0;
    const logInterval = setInterval(() => {
      logIndex = (logIndex + 1) % telemetryLogs.length;
      setActiveTelemetry(telemetryLogs[logIndex]);
    }, 4500);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '340px', background: 'rgba(18, 22, 26, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      {/* Dynamic Canvas Visual */}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Top Left Telemetry Overlay */}
      <div style={{ position: 'absolute', top: '12px', left: '14px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-olive)', boxShadow: '0 0 8px var(--accent-olive)' }}></span>
          <span className="mono" style={{ fontSize: '0.675rem', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Live Sensor Mesh Telemetry
          </span>
        </div>
      </div>

      {/* Bottom Telemetry Ticker Stream */}
      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '8px 14px', background: 'rgba(12, 14, 16, 0.85)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-sand)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          &gt; {activeTelemetry}
        </span>
        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', flexShrink: 0, paddingLeft: '8px' }}>
          MODE: AUTO
        </span>
      </div>
    </div>
  );
};
