import React, { useState } from 'react';
import {
  PYTHON_CUSTOMTKINTER_CODE,
  PYTHON_TKINTER_STANDALONE,
} from '../utils/pythonCodeTemplate';
import { Copy, Check, Download, Terminal, Code2, Sparkles } from 'lucide-react';
import { playSpecialClick } from '../utils/soundEffects';

export const PythonScriptModal: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<'customtkinter' | 'standard'>('customtkinter');
  const [copied, setCopied] = useState(false);

  const activeCode =
    selectedVersion === 'customtkinter'
      ? PYTHON_CUSTOMTKINTER_CODE
      : PYTHON_TKINTER_STANDALONE;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    playSpecialClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playSpecialClick();
    const filename =
      selectedVersion === 'customtkinter'
        ? 'calculadora_cientifica_moderna.py'
        : 'calculadora_padrao.py';
    const blob = new Blob([activeCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header Info & Version Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Código Python Desktop Nativo (GUI com Cantos Arredondados)</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Script Python completo pronto para rodar no seu computador (Windows, Mac ou Linux).
          </p>
        </div>

        {/* Version toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedVersion('customtkinter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedVersion === 'customtkinter'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CustomTkinter (Recomendado)
          </button>
          <button
            type="button"
            onClick={() => setSelectedVersion('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedVersion === 'standard'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tkinter Padrão (Sem pip)
          </button>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-3">
        <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="truncate">
          {selectedVersion === 'customtkinter' ? (
            <span>
              Passo a passo:&nbsp;
              <span className="text-cyan-300 font-bold">pip install customtkinter</span>
              &nbsp;&rarr;&nbsp;
              <span className="text-cyan-300 font-bold">python calculadora_cientifica_moderna.py</span>
            </span>
          ) : (
            <span>
              Execução direta:&nbsp;
              <span className="text-cyan-300 font-bold">python calculadora_padrao.py</span>
              &nbsp;(Já incluso em qualquer instalação Python)
            </span>
          )}
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="relative flex-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col min-h-[300px]">
        {/* Top Code Bar with Actions */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>
              {selectedVersion === 'customtkinter'
                ? 'calculadora_cientifica_moderna.py'
                : 'calculadora_padrao.py'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo .py</span>
            </button>
          </div>
        </div>

        {/* Scrollable Python Code View */}
        <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed selection:bg-cyan-500/30">
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
};
