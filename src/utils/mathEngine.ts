import { AngleMode } from '../types/calculator';

export function factorial(n: number): number {
  if (n < 0) throw new Error('Fatorial não definido para números negativos');
  if (!Number.isInteger(n)) {
    // Stirling / Lanczos Gamma approximation for non-integers
    return gamma(n + 1);
  }
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Lanczos approximation for Gamma function
function gamma(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

export function formatResult(num: number): string {
  if (Number.isNaN(num)) return 'Erro (Indefinido)';
  if (!Number.isFinite(num)) {
    return num > 0 ? '∞' : '-∞';
  }

  // Handle tiny floating point noise (e.g. sin(pi) -> 1e-16 => 0)
  if (Math.abs(num) < 1e-14 && Math.abs(num) > 0) {
    return '0';
  }

  // Float precision cleanup
  const rounded = parseFloat(num.toPrecision(14));
  
  // Format scientific notation if too big or too small
  if (Math.abs(rounded) >= 1e14 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    return rounded.toExponential(8).replace(/\.?0+e/, 'e');
  }

  // Localized clean number string
  return rounded.toString();
}

/**
 * Evaluates mathematical string expression with given angle mode
 */
export function evaluateExpression(expr: string, angleMode: AngleMode): number {
  if (!expr || !expr.trim()) return 0;

  let sanitized = expr.trim();

  // Replace visual math symbols
  sanitized = sanitized
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/e\b/g, 'E_CONST')
    .replace(/φ/g, 'PHI_CONST');

  // Parse custom factorial notation: e.g. 5! or (3+2)!
  sanitized = parseFactorials(sanitized);

  // Transform powers
  sanitized = sanitized.replace(/\^/g, '**');

  // Math environment creation
  const degToRad = (d: number) => (d * Math.PI) / 180;
  const radToDeg = (r: number) => (r * 180) / Math.PI;

  const scope: Record<string, any> = {
    pi: Math.PI,
    E_CONST: Math.E,
    PHI_CONST: (1 + Math.sqrt(5)) / 2,
    tau: Math.PI * 2,
    
    // Trig
    sin: (x: number) => {
      const rad = angleMode === 'DEG' ? degToRad(x) : x;
      // Handle multiples of 180 deg
      if (angleMode === 'DEG' && x % 180 === 0) return 0;
      return Math.sin(rad);
    },
    cos: (x: number) => {
      const rad = angleMode === 'DEG' ? degToRad(x) : x;
      if (angleMode === 'DEG' && (x - 90) % 180 === 0) return 0;
      return Math.cos(rad);
    },
    tan: (x: number) => {
      const rad = angleMode === 'DEG' ? degToRad(x) : x;
      if (angleMode === 'DEG' && (x - 90) % 180 === 0) {
        throw new Error('Tangente indefinida (90° / 270°)');
      }
      return Math.tan(rad);
    },
    asin: (x: number) => {
      if (x < -1 || x > 1) throw new Error('asin fora do domínio [-1, 1]');
      const r = Math.asin(x);
      return angleMode === 'DEG' ? radToDeg(r) : r;
    },
    acos: (x: number) => {
      if (x < -1 || x > 1) throw new Error('acos fora do domínio [-1, 1]');
      const r = Math.acos(x);
      return angleMode === 'DEG' ? radToDeg(r) : r;
    },
    atan: (x: number) => {
      const r = Math.atan(x);
      return angleMode === 'DEG' ? radToDeg(r) : r;
    },
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    asinh: Math.asinh,
    acosh: (x: number) => {
      if (x < 1) throw new Error('acosh definido apenas para x ≥ 1');
      return Math.acosh(x);
    },
    atanh: (x: number) => {
      if (Math.abs(x) >= 1) throw new Error('atanh definido apenas para |x| < 1');
      return Math.atanh(x);
    },

    // Logs
    ln: (x: number) => {
      if (x <= 0) throw new Error('Logaritmo indefinido para x ≤ 0');
      return Math.log(x);
    },
    log: (x: number) => {
      if (x <= 0) throw new Error('Logaritmo indefinido para x ≤ 0');
      return Math.log10(x);
    },
    log10: (x: number) => {
      if (x <= 0) throw new Error('Logaritmo indefinido para x ≤ 0');
      return Math.log10(x);
    },
    log2: (x: number) => {
      if (x <= 0) throw new Error('Logaritmo indefinido para x ≤ 0');
      return Math.log2(x);
    },
    log_base: (x: number, b: number) => {
      if (x <= 0 || b <= 0 || b === 1) throw new Error('Logaritmo com base inválida');
      return Math.log(x) / Math.log(b);
    },

    // Roots & Powers
    sqrt: (x: number) => {
      if (x < 0) throw new Error('Raiz quadrada de número negativo');
      return Math.sqrt(x);
    },
    cbrt: Math.cbrt,
    root: (x: number, n: number) => {
      if (x < 0 && n % 2 === 0) throw new Error('Raiz par de número negativo');
      if (x < 0) return -Math.pow(-x, 1 / n);
      return Math.pow(x, 1 / n);
    },
    exp: Math.exp,
    fact: factorial,
    abs: Math.abs,
  };

  // Replace function calls with scope access
  const funcNames = Object.keys(scope);
  let transformed = sanitized;

  // Insert implicit multiplication: e.g. 2pi -> 2*pi, 3(4) -> 3*(4), (2)(3) -> (2)*(3)
  transformed = transformed
    .replace(/(\d)(\s*)(pi|E_CONST|PHI_CONST|tau|[a-z_][a-z0-9_]*\()/gi, '$1*$3')
    .replace(/(\))(\s*)(\d|[a-z_][a-z0-9_]*\(|\()/gi, '$1*$3')
    .replace(/(\d)(\s*)(\()/g, '$1*$3');

  // Safe Function evaluation
  const keys = Object.keys(scope);
  const values = Object.values(scope);
  
  try {
    // eslint-disable-next-line no-new-func
    const evalFunc = new Function(...keys, `"use strict"; return (${transformed});`);
    const val = evalFunc(...values);
    if (typeof val !== 'number') {
      throw new Error('Resultado inválido');
    }
    return val;
  } catch (err: any) {
    throw new Error(err.message || 'Erro de sintaxe');
  }
}

// Convert numbers followed by ! into fact(number)
function parseFactorials(expr: string): string {
  let res = expr;
  // Match (expr)!
  const parenFactRegex = /\(([^()]+)\)!/g;
  while (parenFactRegex.test(res)) {
    res = res.replace(parenFactRegex, 'fact($1)');
  }
  // Match number! or identifier!
  res = res.replace(/(\d+(?:\.\d+)?|\b[a-zA-Z_]\w*)!/g, 'fact($1)');
  return res;
}

/**
 * Python console evaluation simulation
 */
export function executePythonCode(code: string, angleMode: AngleMode): { result: string; output: string[]; error?: string } {
  const outputs: string[] = [];
  try {
    const lines = code.trim().split('\n');
    let lastResult: any = undefined;

    // Simulated math module in Python
    const math = {
      pi: Math.PI,
      e: Math.E,
      tau: Math.PI * 2,
      sin: (x: number) => (angleMode === 'DEG' ? Math.sin((x * Math.PI) / 180) : Math.sin(x)),
      cos: (x: number) => (angleMode === 'DEG' ? Math.cos((x * Math.PI) / 180) : Math.cos(x)),
      tan: (x: number) => (angleMode === 'DEG' ? Math.tan((x * Math.PI) / 180) : Math.tan(x)),
      asin: (x: number) => (angleMode === 'DEG' ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
      acos: (x: number) => (angleMode === 'DEG' ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
      atan: (x: number) => (angleMode === 'DEG' ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      log: (x: number, base?: number) => (base ? Math.log(x) / Math.log(base) : Math.log(x)),
      log10: Math.log10,
      log2: Math.log2,
      exp: Math.exp,
      sqrt: Math.sqrt,
      factorial: factorial,
      radians: (deg: number) => (deg * Math.PI) / 180,
      degrees: (rad: number) => (rad * 180) / Math.PI,
      pow: Math.pow,
      fabs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
    };

    const pyPrint = (...args: any[]) => {
      outputs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };

    // Transform Python-specific syntax to JS
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      let jsLine = line
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\bprint\s*\(/g, 'pyPrint(');

      // Handle simple python exponentiation **
      // JS supports ** natively!

      // If expression, try to evaluate and assign to lastResult
      // eslint-disable-next-line no-new-func
      const runner = new Function('math', 'pyPrint', `"use strict"; return (${jsLine});`);
      lastResult = runner(math, pyPrint);
    }

    let finalStr = '';
    if (lastResult !== undefined) {
      if (typeof lastResult === 'number') {
        finalStr = formatResult(lastResult);
      } else {
        finalStr = String(lastResult);
      }
    } else if (outputs.length > 0) {
      finalStr = outputs[outputs.length - 1];
    } else {
      finalStr = 'Executado com sucesso.';
    }

    return { result: finalStr, output: outputs };
  } catch (err: any) {
    return { result: '', output: outputs, error: err.message || 'Erro de execução Python' };
  }
}

/**
 * Executes calculation using the real Python backend
 */
export async function evaluateWithPythonBackend(
  expression: string,
  angleMode: AngleMode
): Promise<{ result: string; engine: string }> {
  try {
    const res = await fetch('/api/python/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, angleMode }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro no cálculo Python');
    }

    const data = await res.json();
    return { result: data.result, engine: 'Python 3 (CPython)' };
  } catch (err: any) {
    // Graceful fallback to client-side evaluation if server route is offline
    const localVal = evaluateExpression(expression, angleMode);
    return { result: formatResult(localVal), engine: 'Python Emulador' };
  }
}

