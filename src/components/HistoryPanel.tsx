import React from 'react';
import { HistoryItem } from '../types/calculator';
import { Trash2, Download, Clock, ArrowRight } from 'lucide-react';
import { playKeyClick, playSpecialClick } from '../utils/soundEffects';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectCalculation: (item: HistoryItem) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectCalculation,
  onClearHistory,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    playSpecialClick();
    if (history.length === 0) return;
    const content = history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleTimeString()}] (${h.angleMode}) ${h.expression} = ${h.result}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_calculadora_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md rounded-3xl p-4 sm:p-5 flex flex-col border border-slate-800 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Histórico de Cálculos</span>
          <span className="text-xs text-slate-400 font-mono">({history.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExport}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Exportar histórico como TXT"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playKeyClick(350);
                  onClearHistory();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Limpar histórico"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors ml-1"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Clock className="w-8 h-8 stroke-[1.5] mb-2 text-slate-600" />
            <p className="text-sm">Nenhum cálculo registrado ainda</p>
            <p className="text-xs text-slate-600 mt-1">
              Os cálculos realizados aparecerão aqui para reutilização rápida.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                playKeyClick(650);
                onSelectCalculation(item);
              }}
              className="group p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>{item.angleMode}</span>
                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="font-mono text-xs text-slate-400 truncate group-hover:text-slate-300">
                {item.expression}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-base font-bold text-white group-hover:text-cyan-300">
                  = {item.result}
                </span>
                <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <span>Reutilizar</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
