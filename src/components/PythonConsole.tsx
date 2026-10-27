import React, { useState } from 'react';
import { AngleMode } from '../types/calculator';
import { executePythonCode } from '../utils/mathEngine';
import { Play, RotateCcw, ArrowRight, Terminal } from 'lucide-react';
import { playKeyClick, playSpecialClick } from '../utils/soundEffects';

interface PythonConsoleProps {
  angleMode: AngleMode;
  onSendToCalculator: (val: string) => void;
}

export const PythonConsole: React.FC<PythonConsoleProps> = ({
  angleMode,
  onSendToCalculator,
}) => {
  const [code, setCode] = useState<string>(
    '# Exemplo: Trigonometria, Logaritmo e Exponenciação em Python\nx = math.radians(45) if "' +
      angleMode +
      '" == "DEG" else math.pi / 4\nres = math.sin(x)**2 + math.cos(x)**2\nprint("Identidade trigonométrica:", res)\nmath.log10(1000) * (2 ** 3)'
  );

  const [history, setHistory] = useState<
    Array<{
      code: string;
      result: string;
      outputs: string[];
      error?: string;
      timestamp: Date;
    }>
  >([]);

  const [lastResult, setLastResult] = useState<string | null>(null);

  const presets = [
    {
      label: 'Trigonométrica (sin/cos)',
      code: 'math.sin(math.radians(30)) + math.cos(math.radians(60))',
    },
    {
      label: 'Logaritmos (ln e log10)',
      code: 'math.log(math.e) + math.log10(10000)',
    },
    {
      label: 'Exponenciação & Raiz',
      code: 'math.sqrt(144) * (2 ** 5)',
    },
    {
      label: 'Fatorial & Euler',
      code: 'math.factorial(5) / math.exp(2)',
    },
  ];

  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    playSpecialClick();
    setIsRunning(true);

    try {
      // 1. Try real Python backend
      const res = await fetch('/api/python/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: `import math\n${code}`
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const outputLines = data.stdout ? data.stdout.split('\n') : [];
        const err = data.stderr || (!data.success ? 'Erro na execução Python' : undefined);
        const finalRes = data.stdout || (data.success ? 'Executado com sucesso (Python 3.10)' : 'Falha');

        setLastResult(finalRes);
        setHistory((prev) => [
          {
            code,
            result: finalRes,
            outputs: outputLines,
            error: err,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9),
        ]);
        setIsRunning(false);
        return;
      }
    } catch {
      // fallback
    }

    // 2. Client-side fallback
    const { result, output, error } = executePythonCode(code, angleMode);
    setLastResult(result);
    setHistory((prev) => [
      {
        code,
        result,
        outputs: output,
        error,
        timestamp: new Date(),
      },
      ...prev.slice(0, 9),
    ]);
    setIsRunning(false);
  };

  const handleClear = () => {
    playKeyClick(400);
    setCode('');
    setLastResult(null);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Preset snippets bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-mono text-[11px] shrink-0">Exemplos:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              playKeyClick(650);
              setCode(p.code);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono whitespace-nowrap transition-colors border border-slate-700/60"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Code Editor Area */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Python 3.12 • math sandbox</span>
          </div>
          <span>Ângulo: {angleMode}</span>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={5}
          placeholder="Digite expressões em Python (ex: math.sin(math.radians(30)) + 2**3)..."
          className="w-full p-3 bg-transparent text-slate-100 font-mono text-sm focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
          spellCheck={false}
        />

        {/* Action bar */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar</span>
          </button>

          <button
            type="button"
            onClick={handleRun}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Executar Python</span>
          </button>
        </div>
      </div>

      {/* Execution Output Box */}
      {lastResult !== null && (
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Saída / Retorno:</span>
            <button
              type="button"
              onClick={() => onSendToCalculator(lastResult)}
              className="text-cyan-400 hover:text-cyan-300 text-[11px] font-sans flex items-center gap-1 transition-colors"
            >
              <span>Usar na Calculadora</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 text-cyan-200 text-sm font-bold break-all">
            {lastResult}
          </div>
        </div>
      )}

      {/* Log history stream */}
      {history.length > 0 && (
        <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 pt-1">
            Histórico do Console:
          </div>
          {history.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-xs hover:border-slate-700 transition-colors"
            >
              <div className="text-slate-400 truncate mb-1">&gt;&gt;&gt; {item.code.replace(/\n/g, ' ⏎ ')}</div>
              {item.outputs.length > 0 && (
                <div className="text-slate-300 pl-3 border-l border-slate-700 my-1 text-[11px]">
                  {item.outputs.map((o, oi) => (
                    <div key={oi}>{o}</div>
                  ))}
                </div>
              )}
              {item.error ? (
                <div className="text-rose-400 font-sans">{item.error}</div>
              ) : (
                <div className="text-emerald-400 font-bold">{item.result}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
