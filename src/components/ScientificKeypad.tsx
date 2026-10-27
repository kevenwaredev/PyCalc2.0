import React from 'react';
import { playKeyClick, playSpecialClick } from '../utils/soundEffects';

interface KeypadProps {
  onInputToken: (token: string) => void;
  onInputFunction: (funcName: string) => void;
  onCalculate: () => void;
  onClearAll: () => void;
  onClearEntry: () => void;
  onToggleSign: () => void;
  onFactorial: () => void;
  onReciprocal: () => void;
  isSecondMode: boolean;
  onToggleSecondMode: () => void;
  // Memory
  onMemClear: () => void;
  onMemRecall: () => void;
  onMemAdd: () => void;
  onMemSubtract: () => void;
  onMemStore: () => void;
}

export const ScientificKeypad: React.FC<KeypadProps> = ({
  onInputToken,
  onInputFunction,
  onCalculate,
  onClearAll,
  onClearEntry,
  onToggleSign,
  onFactorial,
  onReciprocal,
  isSecondMode,
  onToggleSecondMode,
  onMemClear,
  onMemRecall,
  onMemAdd,
  onMemSubtract,
  onMemStore,
}) => {
  const triggerClick = (freq = 600) => playKeyClick(freq);

  // Modern button styling
  const numBtnClass =
    'h-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700/90 active:scale-95 text-slate-100 font-semibold text-base sm:text-lg transition-all shadow-sm border border-slate-700/50 flex items-center justify-center';
  const sciBtnClass =
    'h-11 sm:h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-cyan-300 font-mono text-xs sm:text-sm transition-all border border-slate-800/80 flex items-center justify-center';
  const opBtnClass =
    'h-11 sm:h-12 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 active:scale-95 text-sky-300 hover:text-white font-bold text-xl transition-all border border-sky-800/60 flex items-center justify-center shadow-sm';
  const dangerBtnClass =
    'h-11 sm:h-12 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-rose-300 font-bold text-sm sm:text-base transition-all border border-rose-800/40 flex items-center justify-center';
  const memBtnClass =
    'h-8 sm:h-9 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all border border-slate-800/60 flex items-center justify-center';

  return (
    <div className="flex flex-col gap-2 select-none">
      {/* 1. Memory Ribbon */}
      <div className="grid grid-cols-5 gap-1.5 px-0.5">
        <button
          type="button"
          onClick={() => {
            triggerClick(450);
            onMemClear();
          }}
          className={memBtnClass}
          title="Memory Clear (MC)"
        >
          MC
        </button>
        <button
          type="button"
          onClick={() => {
            triggerClick(450);
            onMemRecall();
          }}
          className={memBtnClass}
          title="Memory Recall (MR)"
        >
          MR
        </button>
        <button
          type="button"
          onClick={() => {
            triggerClick(450);
            onMemAdd();
          }}
          className={memBtnClass}
          title="Memory Add (M+)"
        >
          M+
        </button>
        <button
          type="button"
          onClick={() => {
            triggerClick(450);
            onMemSubtract();
          }}
          className={memBtnClass}
          title="Memory Subtract (M-)"
        >
          M-
        </button>
        <button
          type="button"
          onClick={() => {
            triggerClick(450);
            onMemStore();
          }}
          className={memBtnClass}
          title="Memory Store (MS)"
        >
          MS
        </button>
      </div>

      {/* 2. Main Keypad Grid (6 columns x 7 rows) */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {/* Row 0: Cleaning, Sign and Secondary */}
        <button
          type="button"
          onClick={() => {
            triggerClick(650);
            onToggleSecondMode();
          }}
          className={`h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all border flex items-center justify-center active:scale-95 ${
            isSecondMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
          }`}
          title="Alternar funções secundárias (2nd)"
        >
          2nd
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('(');
          }}
          className={sciBtnClass}
          title="Abre parênteses"
        >
          (
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken(')');
          }}
          className={sciBtnClass}
          title="Fecha parênteses"
        >
          )
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('%');
          }}
          className={sciBtnClass}
          title="Porcentagem (%)"
        >
          %
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick(400);
            onClearEntry();
          }}
          className={dangerBtnClass}
          title="Limpar Entrada Atual (C)"
        >
          C
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick(350);
            onClearAll();
          }}
          className={dangerBtnClass}
          title="Limpar Tudo (All Clear)"
        >
          AC
        </button>

        {/* Row 1: Trigonometry, Powers & Division (÷) */}
        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction(isSecondMode ? 'asin' : 'sin');
          }}
          className={sciBtnClass}
          title={isSecondMode ? 'Arco-seno (sin⁻¹)' : 'Seno (sin)'}
        >
          {isSecondMode ? 'sin⁻¹' : 'sin'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction(isSecondMode ? 'acos' : 'cos');
          }}
          className={sciBtnClass}
          title={isSecondMode ? 'Arco-cosseno (cos⁻¹)' : 'Cosseno (cos)'}
        >
          {isSecondMode ? 'cos⁻¹' : 'cos'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction(isSecondMode ? 'atan' : 'tan');
          }}
          className={sciBtnClass}
          title={isSecondMode ? 'Arco-tangente (tan⁻¹)' : 'Tangente (tan)'}
        >
          {isSecondMode ? 'tan⁻¹' : 'tan'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken(isSecondMode ? '**3' : '**2');
          }}
          className={sciBtnClass}
          title={isSecondMode ? 'Cubo (x³)' : 'Quadrado (x²)'}
        >
          {isSecondMode ? 'x³' : 'x²'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('**');
          }}
          className={sciBtnClass}
          title="Exponenciação arbitrária (x^y)"
        >
          xʸ
        </button>

        {/* OPERAÇÃO: DIVISÃO (÷) */}
        <button
          type="button"
          onClick={() => {
            triggerClick(750);
            onInputToken('/');
          }}
          className={opBtnClass}
          title="Divisão (÷)"
        >
          ÷
        </button>

        {/* Row 2: Logarithms, Numbers 7, 8, 9 & MULTIPLICAÇÃO (×) */}
        <button
          type="button"
          onClick={() => {
            triggerClick();
            if (isSecondMode) {
              onInputFunction('exp');
            } else {
              onInputFunction('ln');
            }
          }}
          className={sciBtnClass}
          title={isSecondMode ? 'Exponencial e^x' : 'Logaritmo Natural (ln)'}
        >
          {isSecondMode ? 'eˣ' : 'ln'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            if (isSecondMode) {
              onInputToken('10**');
            } else {
              onInputFunction('log10');
            }
          }}
          className={sciBtnClass}
          title={isSecondMode ? '10^x' : 'Logaritmo Base 10'}
        >
          {isSecondMode ? '10ˣ' : 'log₁₀'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('7');
          }}
          className={numBtnClass}
        >
          7
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('8');
          }}
          className={numBtnClass}
        >
          8
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('9');
          }}
          className={numBtnClass}
        >
          9
        </button>

        {/* OPERAÇÃO: MULTIPLICAÇÃO (×) */}
        <button
          type="button"
          onClick={() => {
            triggerClick(750);
            onInputToken('*');
          }}
          className={opBtnClass}
          title="Multiplicação (×)"
        >
          ×
        </button>

        {/* Row 3: Hyperbolics/Roots, Numbers 4, 5, 6 & SUBTRAÇÃO (−) */}
        <button
          type="button"
          onClick={() => {
            triggerClick();
            if (isSecondMode) {
              onInputFunction('cbrt');
            } else {
              onInputFunction('sqrt');
            }
          }}
          className={sciBtnClass}
          title={isSecondMode ? 'Raiz Cúbica (∛x)' : 'Raiz Quadrada (√x)'}
        >
          {isSecondMode ? '∛x' : '√x'}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onFactorial();
          }}
          className={sciBtnClass}
          title="Fatorial (x!)"
        >
          x!
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('4');
          }}
          className={numBtnClass}
        >
          4
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('5');
          }}
          className={numBtnClass}
        >
          5
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('6');
          }}
          className={numBtnClass}
        >
          6
        </button>

        {/* OPERAÇÃO: SUBTRAÇÃO (−) */}
        <button
          type="button"
          onClick={() => {
            triggerClick(750);
            onInputToken('-');
          }}
          className={opBtnClass}
          title="Subtração (−)"
        >
          −
        </button>

        {/* Row 4: Constants/Reciprocal, Numbers 1, 2, 3 & ADIÇÃO (+) */}
        <button
          type="button"
          onClick={() => {
            triggerClick();
            onReciprocal();
          }}
          className={sciBtnClass}
          title="Inverso (1/x)"
        >
          1/x
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction('abs');
          }}
          className={sciBtnClass}
          title="Valor Absoluto / Módulo |x|"
        >
          |x|
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('1');
          }}
          className={numBtnClass}
        >
          1
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('2');
          }}
          className={numBtnClass}
        >
          2
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('3');
          }}
          className={numBtnClass}
        >
          3
        </button>

        {/* OPERAÇÃO: ADIÇÃO (+) */}
        <button
          type="button"
          onClick={() => {
            triggerClick(750);
            onInputToken('+');
          }}
          className={opBtnClass}
          title="Adição (+)"
        >
          +
        </button>

        {/* Row 5: Constants, Sign, Zero, Period & EQUALS (=) */}
        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('π');
          }}
          className={sciBtnClass}
          title="Constante Pi (π ≈ 3.14159...)"
        >
          π
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('e');
          }}
          className={sciBtnClass}
          title="Constante de Euler (e ≈ 2.71828...)"
        >
          e
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onToggleSign();
          }}
          className={sciBtnClass}
          title="Inverter Sinal (±)"
        >
          ±
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('0');
          }}
          className={numBtnClass}
        >
          0
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('.');
          }}
          className={numBtnClass}
        >
          .
        </button>

        {/* OPERAÇÃO: IGUALDADE (=) */}
        <button
          type="button"
          onClick={() => {
            playSpecialClick();
            onCalculate();
          }}
          className="h-11 sm:h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-mono font-bold text-2xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center border border-cyan-300/40"
          title="Calcular Resultado (=)"
        >
          =
        </button>

        {/* Row 6: Hyperbolic Functions and Advanced Constants */}
        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction('sinh');
          }}
          className={sciBtnClass}
          title="Seno Hiperbólico"
        >
          sinh
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction('cosh');
          }}
          className={sciBtnClass}
          title="Cosseno Hiperbólico"
        >
          cosh
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction('tanh');
          }}
          className={sciBtnClass}
          title="Tangente Hiperbólica"
        >
          tanh
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputFunction('log2');
          }}
          className={sciBtnClass}
          title="Logaritmo Base 2"
        >
          log₂
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('φ');
          }}
          className={sciBtnClass}
          title="Proporção Áurea (φ ≈ 1.618)"
        >
          φ
        </button>

        <button
          type="button"
          onClick={() => {
            triggerClick();
            onInputToken('tau');
          }}
          className={sciBtnClass}
          title="Constante Tau (2π)"
        >
          τ
        </button>
      </div>
    </div>
  );
};
