import React, { useState, useRef, useEffect } from 'react';
import { AngleMode } from '../types/calculator';
import { evaluateExpression } from '../utils/mathEngine';
import { RotateCcw, LineChart } from 'lucide-react';
import { playKeyClick, playSpecialClick } from '../utils/soundEffects';

interface FunctionPlotterProps {
  angleMode: AngleMode;
}

export const FunctionPlotter: React.FC<FunctionPlotterProps> = ({ angleMode }) => {
  const [funcStr, setFuncStr] = useState<string>('sin(x)');
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presets = [
    { label: 'Seno: sin(x)', expr: 'sin(x)', min: -10, max: 10 },
    { label: 'Cosseno: cos(x)', expr: 'cos(x)', min: -10, max: 10 },
    { label: 'Tangente: tan(x)', expr: 'tan(x)', min: -5, max: 5 },
    { label: 'Exponencial: exp(x)', expr: 'exp(x)', min: -3, max: 4 },
    { label: 'Logaritmo: ln(x)', expr: 'ln(x)', min: 0.1, max: 15 },
    { label: 'Parábola: x²', expr: 'x^2', min: -5, max: 5 },
    { label: 'Cúbica: x³ - 3x', expr: 'x^3 - 3*x', min: -3, max: 3 },
  ];

  useEffect(() => {
    drawPlot();
  }, [funcStr, xMin, xMax, angleMode]);

  const drawPlot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Coordinate transforms
    const samples = 400;
    const step = (xMax - xMin) / samples;
    const points: Array<{ x: number; y: number; valid: boolean }> = [];

    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= samples; i++) {
      const x = xMin + i * step;
      try {
        const exprEvaluated = funcStr.replace(/\bx\b/g, `(${x})`);
        const y = evaluateExpression(exprEvaluated, angleMode);
        if (Number.isFinite(y) && !Number.isNaN(y)) {
          // Clamp insane values for smooth plotting
          if (Math.abs(y) < 1000) {
            yMin = Math.min(yMin, y);
            yMax = Math.max(yMax, y);
          }
          points.push({ x, y, valid: true });
        } else {
          points.push({ x, y: 0, valid: false });
        }
      } catch (e) {
        points.push({ x, y: 0, valid: false });
      }
    }

    if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || yMin === yMax) {
      yMin = -5;
      yMax = 5;
    }

    // Add 15% vertical padding
    const yRange = yMax - yMin;
    const paddedYMin = yMin - yRange * 0.15;
    const paddedYMax = yMax + yRange * 0.15;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - paddedYMin) / (paddedYMax - paddedYMin)) * height;

    // Draw Subtle Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    const gridLines = 8;
    for (let i = 0; i <= gridLines; i++) {
      const gx = (width / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();

      const gy = (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // Draw Axis (x=0 and y=0)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // Y Axis (x=0)
    if (xMin <= 0 && xMax >= 0) {
      const originX = toScreenX(0);
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();
    }

    // X Axis (y=0)
    if (paddedYMin <= 0 && paddedYMax >= 0) {
      const originY = toScreenY(0);
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();
    }

    // Draw Function Curve
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    let started = false;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      if (!pt.valid || Math.abs(pt.y) > 500) {
        started = false;
        continue;
      }

      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);

      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        // Discontinuity check (e.g. asymptote in tan)
        const prev = points[i - 1];
        if (prev && prev.valid && Math.abs(pt.y - prev.y) > (paddedYMax - paddedYMin) * 0.7) {
          ctx.moveTo(sx, sy);
        } else {
          ctx.lineTo(sx, sy);
        }
      }
    }
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`x: ${xMin.toFixed(1)}`, 8, height - 8);
    ctx.fillText(`x: ${xMax.toFixed(1)}`, width - 60, height - 8);
    ctx.fillText(`y: ${paddedYMax.toFixed(1)}`, 8, 14);
    ctx.fillText(`y: ${paddedYMin.toFixed(1)}`, 8, height - 24);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = rect.width;

    const xVal = xMin + (mouseX / width) * (xMax - xMin);
    try {
      const expr = funcStr.replace(/\bx\b/g, `(${xVal})`);
      const yVal = evaluateExpression(expr, angleMode);
      if (Number.isFinite(yVal)) {
        setHoverCoord({ x: parseFloat(xVal.toFixed(3)), y: parseFloat(yVal.toFixed(3)) });
      }
    } catch {
      setHoverCoord(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Preset pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-mono text-[11px] shrink-0">Curvas:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              playKeyClick(650);
              setFuncStr(p.expr);
              setXMin(p.min);
              setXMax(p.max);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono whitespace-nowrap transition-colors border border-slate-700/60"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Function input and range bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-mono text-cyan-400 font-bold pl-1">f(x) =</span>
          <input
            type="text"
            value={funcStr}
            onChange={(e) => setFuncStr(e.target.value)}
            placeholder="ex: sin(x) + cos(2*x)"
            className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
          <span>X: [</span>
          <input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
            className="w-12 bg-slate-800 px-1 py-0.5 rounded text-white text-center focus:outline-none"
          />
          <span>,</span>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
            className="w-12 bg-slate-800 px-1 py-0.5 rounded text-white text-center focus:outline-none"
          />
          <span>]</span>
        </div>
      </div>

      {/* Canvas Area with Coordinates HUD */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex-1 min-h-[250px] sm:min-h-[290px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Live probe HUD */}
        {hoverCoord && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 pointer-events-none shadow-lg">
            <span>x: {hoverCoord.x}</span>
            <span className="mx-2 text-slate-500">|</span>
            <span>y: {hoverCoord.y}</span>
          </div>
        )}
      </div>
    </div>
  );
};
