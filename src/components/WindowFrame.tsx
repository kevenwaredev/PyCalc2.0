import React from 'react';
import { CalculatorTab } from '../types/calculator';
import {
  Calculator as CalcIcon,
  Terminal,
  LineChart,
  Code2,
  History,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { playSpecialClick, playKeyClick } from '../utils/soundEffects';

interface WindowFrameProps {
  children: React.ReactNode;
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
  historyCount: number;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  historyCount,
  onToggleHistory,
  isHistoryOpen,
  soundEnabled,
  onToggleSound,
  isMaximized,
  onToggleMaximize,
}) => {
  const tabs = [
    { id: 'calculator' as CalculatorTab, label: 'Calculadora', icon: CalcIcon },
    { id: 'python_console' as CalculatorTab, label: 'Console Python', icon: Terminal },
    { id: 'plotter' as CalculatorTab, label: 'Gráfico 2D', icon: LineChart },
    { id: 'python_script' as CalculatorTab, label: 'Código Python (.py)', icon: Code2 },
  ];

  return (
    <div
      className={`relative mx-auto transition-all duration-300 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/20 overflow-hidden ${
        isMaximized
          ? 'w-full max-w-5xl h-[calc(100vh-2rem)] my-2'
          : 'w-full max-w-2xl min-h-[640px]'
      }`}
    >
      {/* OS Modern Window Titlebar with Rounded Corners */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-950/80 border-b border-slate-800/80 select-none">
        {/* Left: Window controls (macOS / modern desktop style) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <button
              type="button"
              onClick={() => {
                playKeyClick(300);
                onTabChange('calculator');
              }}
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors shadow-inner"
              title="Fechar / Redefinir"
              aria-label="Redefinir"
            />
            <button
              type="button"
              onClick={() => {
                playKeyClick(400);
                onToggleHistory();
              }}
              className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors shadow-inner"
              title="Minimizar / Histórico"
              aria-label="Histórico"
            />
            <button
              type="button"
              onClick={() => {
                playKeyClick(500);
                onToggleMaximize();
              }}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors shadow-inner"
              title="Expandir / Alternar Tamanho"
              aria-label="Expandir Janela"
            />
          </div>

          {/* App title */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-white whitespace-nowrap">
              Calculadora Científica Python
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              v2.4
            </span>
          </div>
        </div>

        {/* Right: Quick actions (History, Sound, Maximize) */}
        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              playSpecialClick();
              onToggleSound();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Silenciar cliques sonoros' : 'Ativar feedback sonoro'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* History Button with Counter */}
          <button
            type="button"
            onClick={() => {
              playKeyClick(550);
              onToggleHistory();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
              isHistoryOpen
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Histórico de Cálculos"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Histórico</span>
            {historyCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isHistoryOpen ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>

          {/* Expand Window Toggle */}
          <button
            type="button"
            onClick={() => {
              playSpecialClick();
              onToggleMaximize();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors hidden sm:flex"
            title={isMaximized ? 'Restaurar tamanho' : 'Maximizar janela'}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="px-4 sm:px-6 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/40">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playKeyClick(600);
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Window Body Container */}
      <div className="relative flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
};
