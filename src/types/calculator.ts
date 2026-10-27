export type AngleMode = 'DEG' | 'RAD';

export type CalculatorTab = 'calculator' | 'python_console' | 'plotter' | 'python_script';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
  angleMode: AngleMode;
}

export interface MemoryState {
  value: number;
  hasValue: boolean;
}

export interface PlotPoint {
  x: number;
  y: number;
}
