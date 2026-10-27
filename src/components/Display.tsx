import React, { useState } from 'react';
import { AngleMode, MemoryState } from '../types/calculator';
import { Copy, Check, Delete } from 'lucide-react';
import { playKeyClick, playSpecialClick } from '../utils/soundEffects';

interface DisplayProps {
  expression: string;
  result: string;
  angleMode: AngleMode;
  memory: MemoryState;
  isSecondMode: boolean;
  onBackspace: () => void;
  onClear: () => void;
  onAngleModeToggle: () => void;
  error?: string | null;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  angleMode,
  memory,
  isSecondMode,
  onBackspace,
  onClear,
  onAngleModeToggle,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = error || result || expression || '0';
    navigator.clipboard.writeText(textToCopy);
    playSpecialClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Format expression for visual clarity
  const formattedExpression = expression
    ? expression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/\*\*/g, '^')
    : '';

  // Dynamic font size depending on length
  const resultLength = (error || result).length;
  let resultFontSize = 'text-3xl sm:text-4xl';
  if (resultLength > 16) {
    resultFontSize = 'text-xl sm:text-2xl';
  } else if (resultLength > 11) {
    resultFontSize = 'text-2xl sm:text-3xl';
  }

  return (
    <div className="relative bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-inner transition-all flex flex-col justify-between min-h-[140px]">
      {/* Top telemetry status bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2 mb-2 select-none">
        <div className="flex items-center gap-2">
          {/* Angle mode badge / toggle button */}
          <button
            type="button"
            onClick={() => {
              playKeyClick(700);
              onAngleModeToggle();
            }}
            className="px-2 py-0.5 rounded-md font-semibold tracking-wider transition-colors bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/60"
            title="Alternar entre Graus (DEG) e Radianos (RAD)"
          >
            {angleMode}
          </button>

          {isSecondMode && (
            <span className="px-2 py-0.5 rounded-md font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30">
              2nd
            </span>
          )}

          {memory.hasValue && (
            <span className="px-2 py-0.5 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
              <span>M</span>
              <span className="text-[10px] opacity-80">({memory.value})</span>
            </span>
          )}
        </div>

        {/* Action icons: Copy, Backspace, Clear */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Copiar resultado"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px] font-sans">Copiado!</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playKeyClick(500);
              onBackspace();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-rose-300 transition-colors"
            title="Apagar último caractere (Backspace)"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expression Tape (Upper line) */}
      <div className="w-full text-right font-mono text-sm sm:text-base text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 min-h-[24px]">
        {formattedExpression || <span className="opacity-0">0</span>}
      </div>

      {/* Main Result (Lower line) */}
      <div className="w-full text-right font-mono font-bold tracking-tight text-white overflow-x-auto whitespace-nowrap scrollbar-none mt-1">
        {error ? (
          <span className="text-rose-400 text-lg sm:text-xl font-medium">{error}</span>
        ) : (
          <span className={`${resultFontSize} tabular-nums text-slate-50 transition-all`}>
            {result || '0'}
          </span>
        )}
      </div>
    </div>
  );
};
