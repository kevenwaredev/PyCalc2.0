import React, { useState, useEffect, useCallback } from 'react';
import { AngleMode, CalculatorTab, HistoryItem, MemoryState } from './types/calculator';
import { WindowFrame } from './components/WindowFrame';
import { Display } from './components/Display';
import { ScientificKeypad } from './components/ScientificKeypad';
import { PythonConsole } from './components/PythonConsole';
import { FunctionPlotter } from './components/FunctionPlotter';
import { PythonScriptModal } from './components/PythonScriptModal';
import { HistoryPanel } from './components/HistoryPanel';
import {
  evaluateExpression,
  evaluateWithPythonBackend,
  formatResult,
  factorial,
} from './utils/mathEngine';
import {
  isSoundEnabled,
  toggleSound,
  playErrorSound,
  playKeyClick,
  playSpecialClick,
} from './utils/soundEffects';

const HISTORY_STORAGE_KEY = 'calc_history_v1';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [memory, setMemory] = useState<MemoryState>({ value: 0, hasValue: false });
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CalculatorTab>('calculator');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(isSoundEnabled());
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Handle Token Input
  const handleInputToken = useCallback((token: string) => {
    setError(null);
    setExpression((prev) => {
      // If previous was evaluated and starting fresh with a number
      if (result !== '0' && !prev && !isNaN(Number(token))) {
        return token;
      }
      return prev + token;
    });
  }, [result]);

  // Handle Function Call Input (e.g. sin, cos, ln)
  const handleInputFunction = useCallback((funcName: string) => {
    setError(null);
    setExpression((prev) => `${prev}${funcName}(`);
  }, []);

  // Backspace
  const handleBackspace = useCallback(() => {
    setError(null);
    setExpression((prev) => {
      if (!prev) return '';
      // If ending with a function like "sin(", remove the whole token
      const matchFunc = prev.match(/([a-z0-9_]+\()$/i);
      if (matchFunc) {
        return prev.slice(0, -matchFunc[0].length);
      }
      return prev.slice(0, -1);
    });
  }, []);

  // Clear All
  const handleClearAll = useCallback(() => {
    setError(null);
    setExpression('');
    setResult('0');
  }, []);

  // Clear Entry
  const handleClearEntry = useCallback(() => {
    setError(null);
    setExpression('');
  }, []);

  // Toggle Sign (±)
  const handleToggleSign = useCallback(() => {
    setError(null);
    if (expression) {
      if (expression.startsWith('-(') && expression.endsWith(')')) {
        setExpression(expression.slice(2, -1));
      } else {
        setExpression(`-(${expression})`);
      }
    } else if (result && result !== '0') {
      const num = parseFloat(result);
      if (!isNaN(num)) {
        setResult(formatResult(-num));
      }
    }
  }, [expression, result]);

  // Factorial (x!)
  const handleFactorial = useCallback(() => {
    setError(null);
    try {
      // If there's an active expression or previous result
      const targetVal = expression ? evaluateExpression(expression, angleMode) : parseFloat(result);
      if (isNaN(targetVal)) throw new Error('Valor inválido para fatorial');
      const factRes = factorial(targetVal);
      const formatted = formatResult(factRes);
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression: `${targetVal}!`,
        result: formatted,
        timestamp: new Date(),
        angleMode,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
      setResult(formatted);
      setExpression(`${targetVal}!`);
    } catch (err: any) {
      playErrorSound();
      setError(err.message || 'Erro em x!');
    }
  }, [expression, result, angleMode]);

  // Reciprocal (1/x)
  const handleReciprocal = useCallback(() => {
    setError(null);
    try {
      const targetVal = expression ? evaluateExpression(expression, angleMode) : parseFloat(result);
      if (targetVal === 0) throw new Error('Divisão por zero');
      const recRes = 1 / targetVal;
      const formatted = formatResult(recRes);

      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression: `1 / (${targetVal})`,
        result: formatted,
        timestamp: new Date(),
        angleMode,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
      setResult(formatted);
      setExpression(`1 / (${targetVal})`);
    } catch (err: any) {
      playErrorSound();
      setError(err.message || 'Erro em 1/x');
    }
  }, [expression, result, angleMode]);

  // Calculate Result (=) using real Python Backend
  const handleCalculate = useCallback(async () => {
    if (!expression.trim()) return;

    try {
      const { result: pyResult } = await evaluateWithPythonBackend(expression, angleMode);

      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression,
        result: pyResult,
        timestamp: new Date(),
        angleMode,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
      setResult(pyResult);
      setExpression('');
      setError(null);
    } catch (err: any) {
      playErrorSound();
      setError(err.message || 'Erro de sintaxe');
    }
  }, [expression, angleMode]);

  // Memory Functions
  const handleMemClear = useCallback(() => {
    setMemory({ value: 0, hasValue: false });
  }, []);

  const handleMemRecall = useCallback(() => {
    if (memory.hasValue) {
      handleInputToken(memory.value.toString());
    }
  }, [memory, handleInputToken]);

  const handleMemAdd = useCallback(() => {
    try {
      const curr = parseFloat(result) || (expression ? evaluateExpression(expression, angleMode) : 0);
      setMemory((prev) => ({ value: prev.value + curr, hasValue: true }));
    } catch {}
  }, [result, expression, angleMode]);

  const handleMemSubtract = useCallback(() => {
    try {
      const curr = parseFloat(result) || (expression ? evaluateExpression(expression, angleMode) : 0);
      setMemory((prev) => ({ value: prev.value - curr, hasValue: true }));
    } catch {}
  }, [result, expression, angleMode]);

  const handleMemStore = useCallback(() => {
    try {
      const curr = parseFloat(result) || (expression ? evaluateExpression(expression, angleMode) : 0);
      setMemory({ value: curr, hasValue: true });
    } catch {}
  }, [result, expression, angleMode]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in textarea / inputs (e.g. Python console or plotter)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        playKeyClick();
        handleInputToken(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        playKeyClick();
        handleInputToken(e.key);
      } else if (e.key === '.') {
        playKeyClick();
        handleInputToken('.');
      } else if (e.key === '(' || e.key === ')') {
        playKeyClick();
        handleInputToken(e.key);
      } else if (e.key === '^') {
        playKeyClick();
        handleInputToken('**');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        playSpecialClick();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        playKeyClick(500);
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playKeyClick(350);
        handleClearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputToken, handleCalculate, handleBackspace, handleClearAll]);

  // Re-use calculation from history
  const handleSelectHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
    setAngleMode(item.angleMode);
    setIsHistoryOpen(false);
    setActiveTab('calculator');
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundActive(newState);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      {/* Top Banner / Breadcrumb */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4 sm:pb-6 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">&gt;&gt;&gt;</span>
          <span className="text-slate-200">Calculadora Científica Python</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">GUI com Cantos Arredondados &amp; Alta Precisão</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-cyan-400">
            Python 3.12 Engine
          </span>
        </div>
      </header>

      {/* Main OS Window Frame with Rounded Corners */}
      <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        <WindowFrame
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsHistoryOpen(false);
          }}
          historyCount={history.length}
          onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
          isHistoryOpen={isHistoryOpen}
          soundEnabled={soundActive}
          onToggleSound={handleSoundToggle}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized((prev) => !prev)}
        >
          {/* History Slide-over drawer */}
          <HistoryPanel
            history={history}
            onSelectCalculation={handleSelectHistory}
            onClearHistory={() => setHistory([])}
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
          />

          {/* Tab 1: Scientific Calculator Keypad */}
          {activeTab === 'calculator' && (
            <div className="flex flex-col gap-4">
              <Display
                expression={expression}
                result={result}
                angleMode={angleMode}
                memory={memory}
                isSecondMode={isSecondMode}
                onBackspace={handleBackspace}
                onClear={handleClearEntry}
                onAngleModeToggle={() =>
                  setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))
                }
                error={error}
              />

              <ScientificKeypad
                onInputToken={handleInputToken}
                onInputFunction={handleInputFunction}
                onCalculate={handleCalculate}
                onClearAll={handleClearAll}
                onClearEntry={handleClearEntry}
                onToggleSign={handleToggleSign}
                onFactorial={handleFactorial}
                onReciprocal={handleReciprocal}
                isSecondMode={isSecondMode}
                onToggleSecondMode={() => setIsSecondMode((prev) => !prev)}
                onMemClear={handleMemClear}
                onMemRecall={handleMemRecall}
                onMemAdd={handleMemAdd}
                onMemSubtract={handleMemSubtract}
                onMemStore={handleMemStore}
              />
            </div>
          )}

          {/* Tab 2: Python Interactive Math Console */}
          {activeTab === 'python_console' && (
            <PythonConsole
              angleMode={angleMode}
              onSendToCalculator={(val) => {
                setResult(val);
                setExpression('');
                setActiveTab('calculator');
              }}
            />
          )}

          {/* Tab 3: 2D Function Plotter */}
          {activeTab === 'plotter' && <FunctionPlotter angleMode={angleMode} />}

          {/* Tab 4: Standalone Python Desktop Script */}
          {activeTab === 'python_script' && <PythonScriptModal />}
        </WindowFrame>
      </main>

      {/* Footer Info & Feature Highlights */}
      <footer className="max-w-5xl mx-auto w-full pt-6 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>• Trigonometria: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh (DEG/RAD)</span>
          <span>• Logaritmos: ln, log₁₀, log₂</span>
          <span>• Exponenciação: xʸ, x², x³, eˣ, 10ˣ, √x, ∛x</span>
          <span>• Código Python nativo com CustomTkinter disponível na aba "Código Python"</span>
        </div>
      </footer>
    </div>
  );
}
