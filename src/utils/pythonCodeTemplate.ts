export const PYTHON_CUSTOMTKINTER_CODE = `"""
====================================================================
CALCULADORA CIENTÍFICA MODERNA EM PYTHON (CustomTkinter)
Cantos arredondados, visual escuro moderno e suporte científico completo:
- Operações Fundamentais: Adição (+), Subtração (−), Multiplicação (×), Divisão (÷)
- Funções Trigonométricas (sin, cos, tan, asin, acos, atan, sinh, cosh, tanh)
- Modos DEG (Graus) e RAD (Radianos)
- Logaritmos (ln, log10, log2)
- Exponenciação e Raízes (x^y, x², x³, √x, ∛x, e^x, 10^x)
- Fatorial (x!), Inverso (1/x), Porcentagem (%)
- Constantes Matemáticas (π, e, τ)
- Memória de Cálculo (MC, MR, M+, M-)

Como rodar:
  1. Instale o customtkinter:
     pip install customtkinter

  2. Execute este arquivo:
     python calculadora_cientifica.py
====================================================================
"""

import customtkinter as ctk
import math
import sys

# Configurações globais de aparência moderna
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class ModernScientificCalculator(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Configurações da Janela com Cantos Arredondados
        self.title("Calculadora Científica Moderna Python")
        self.geometry("540x720")
        self.minsize(500, 660)
        self.configure(fg_color="#0b0f19")

        # Estados da calculadora
        self.current_expression = ""
        self.angle_mode = "DEG"  # 'DEG' ou 'RAD'
        self.memory_value = 0.0
        self.is_second_mode = False

        # Paleta de Cores Moderna
        self.colors = {
            "bg": "#0b0f19",
            "card": "#131b2e",
            "display_bg": "#080c14",
            "text_main": "#f8fafc",
            "text_muted": "#94a3b8",
            "btn_num": "#1e293b",
            "btn_num_hover": "#334155",
            "btn_op": "#0284c7",
            "btn_op_hover": "#0369a1",
            "btn_sci": "#0f172a",
            "btn_sci_hover": "#1e293b",
            "btn_equal": "#06b6d4",
            "btn_equal_hover": "#0891b2",
            "btn_danger": "#e11d48",
            "btn_danger_hover": "#be123c",
            "accent": "#06b6d4"
        }

        self.setup_ui()
        self.bind_keys()

    def setup_ui(self):
        # Container principal com cantos arredondados (corner_radius=24)
        self.main_container = ctk.CTkFrame(
            self,
            fg_color=self.colors["card"],
            corner_radius=24,
            border_width=1,
            border_color="#1e293b"
        )
        self.main_container.pack(fill="both", expand=True, padx=16, pady=16)

        # 1. Barra de Título Interna (Estilo Janela de Aplicativo Moderno)
        self.top_bar = ctk.CTkFrame(self.main_container, fg_color="transparent", height=32)
        self.top_bar.pack(fill="x", padx=16, pady=(14, 6))

        # Indicador de Modo de Ângulo (DEG / RAD)
        self.angle_btn = ctk.CTkButton(
            self.top_bar,
            text=f"MODO: {self.angle_mode}",
            command=self.toggle_angle_mode,
            width=100,
            height=28,
            corner_radius=14,
            fg_color="#1e293b",
            hover_color="#334155",
            font=ctk.CTkFont(family="Arial", size=11, weight="bold")
        )
        self.angle_btn.pack(side="left")

        # Indicador de Memória Ativa
        self.mem_label = ctk.CTkLabel(
            self.top_bar,
            text="",
            font=ctk.CTkFont(family="Arial", size=11, weight="bold"),
            text_color="#06b6d4"
        )
        self.mem_label.pack(side="left", padx=10)

        # Botão 2nd (Inversas / Alternativas)
        self.second_btn = ctk.CTkButton(
            self.top_bar,
            text="2nd",
            command=self.toggle_second_mode,
            width=50,
            height=28,
            corner_radius=14,
            fg_color="#1e293b",
            hover_color="#334155",
            font=ctk.CTkFont(family="Arial", size=11, weight="bold")
        )
        self.second_btn.pack(side="right")

        # 2. Tela de Exibição (LCD Digital com cantos arredondados)
        self.display_frame = ctk.CTkFrame(
            self.main_container,
            fg_color=self.colors["display_bg"],
            corner_radius=18,
            border_width=1,
            border_color="#1e293b"
        )
        self.display_frame.pack(fill="x", padx=16, pady=(0, 14))

        # Linha de Expressão (Histórico / Fórmula)
        self.expr_label = ctk.CTkLabel(
            self.display_frame,
            text="",
            font=ctk.CTkFont(family="Courier", size=14),
            text_color=self.colors["text_muted"],
            anchor="e"
        )
        self.expr_label.pack(fill="x", padx=16, pady=(12, 2))

        # Linha de Resultado Principal
        self.result_label = ctk.CTkLabel(
            self.display_frame,
            text="0",
            font=ctk.CTkFont(family="Courier", size=36, weight="bold"),
            text_color=self.colors["text_main"],
            anchor="e"
        )
        self.result_label.pack(fill="x", padx=16, pady=(0, 14))

        # 3. Grade de Botões Científicos e Numéricos
        self.keypad_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.keypad_frame.pack(fill="both", expand=True, padx=12, pady=(0, 12))

        # Grid responsivo 6 colunas x 7 linhas
        for c in range(6):
            self.keypad_frame.grid_columnconfigure(c, weight=1, pad=4)
        for r in range(7):
            self.keypad_frame.grid_rowconfigure(r, weight=1, pad=4)

        self.create_buttons()

    def create_buttons(self):
        # Definição das teclas (6 colunas x 7 linhas)
        # Coluna 5 é dedicada aos operadores matemáticos fundamentais: ÷, ×, −, +, =
        buttons_layout = [
            # Linha 0: Funções de Memória & Limpeza
            [
                ("MC", self.mem_clear, "sci"),
                ("MR", self.mem_recall, "sci"),
                ("M+", self.mem_add, "sci"),
                ("M-", self.mem_sub, "sci"),
                ("C", self.clear_entry, "danger"),
                ("AC", self.clear_all, "danger")
            ],
            # Linha 1: Trigonometria, Potências e Divisão (÷)
            [
                ("sin", lambda: self.append_func("sin("), "sci"),
                ("cos", lambda: self.append_func("cos("), "sci"),
                ("tan", lambda: self.append_func("tan("), "sci"),
                ("x²", lambda: self.append_token("**2"), "sci"),
                ("x^y", lambda: self.append_token("**"), "sci"),
                ("÷", lambda: self.append_token("/"), "op")
            ],
            # Linha 2: Logaritmos, Teclado Numérico (7, 8, 9) e Multiplicação (×)
            [
                ("ln", lambda: self.append_func("ln("), "sci"),
                ("log₁₀", lambda: self.append_func("log10("), "sci"),
                ("7", lambda: self.append_token("7"), "num"),
                ("8", lambda: self.append_token("8"), "num"),
                ("9", lambda: self.append_token("9"), "num"),
                ("×", lambda: self.append_token("*"), "op")
            ],
            # Linha 3: Exponenciais, Teclado Numérico (4, 5, 6) e Subtração (−)
            [
                ("eˣ", lambda: self.append_func("exp("), "sci"),
                ("10ˣ", lambda: self.append_token("10**"), "sci"),
                ("4", lambda: self.append_token("4"), "num"),
                ("5", lambda: self.append_token("5"), "num"),
                ("6", lambda: self.append_token("6"), "num"),
                ("−", lambda: self.append_token("-"), "op")
            ],
            # Linha 4: Raiz, Fatorial, Teclado Numérico (1, 2, 3) e Adição (+)
            [
                ("√x", lambda: self.append_func("sqrt("), "sci"),
                ("x!", self.apply_factorial, "sci"),
                ("1", lambda: self.append_token("1"), "num"),
                ("2", lambda: self.append_token("2"), "num"),
                ("3", lambda: self.append_token("3"), "num"),
                ("+", lambda: self.append_token("+"), "op")
            ],
            # Linha 5: Constantes (π, e), Sinal (±), Zero, Ponto e Igualdade (=)
            [
                ("π", lambda: self.append_token("π"), "sci"),
                ("e", lambda: self.append_token("e"), "sci"),
                ("±", self.toggle_sign, "sci"),
                ("0", lambda: self.append_token("0"), "num"),
                (".", lambda: self.append_token("."), "num"),
                ("=", self.calculate_result, "equal")
            ],
            # Linha 6: Parênteses, Inverso, Módulo, Porcentagem e Raiz Cúbica
            [
                ("(", lambda: self.append_token("("), "sci"),
                (")", lambda: self.append_token(")"), "sci"),
                ("1/x", self.apply_reciprocal, "sci"),
                ("|x|", lambda: self.append_func("abs("), "sci"),
                ("%", lambda: self.append_token("%"), "sci"),
                ("∛x", lambda: self.append_func("cbrt("), "sci")
            ]
        ]

        self.buttons = {}
        for row_idx, row in enumerate(buttons_layout):
            for col_idx, (text, action, b_type) in enumerate(row):
                fg_col = self.colors["btn_num"]
                hover_col = self.colors["btn_num_hover"]
                text_col = self.colors["text_main"]

                if b_type == "sci":
                    fg_col = self.colors["btn_sci"]
                    hover_col = self.colors["btn_sci_hover"]
                elif b_type == "op":
                    fg_col = self.colors["btn_op"]
                    hover_col = self.colors["btn_op_hover"]
                    text_col = "#ffffff"
                elif b_type == "danger":
                    fg_col = self.colors["btn_danger"]
                    hover_col = self.colors["btn_danger_hover"]
                elif b_type == "equal":
                    fg_col = self.colors["btn_equal"]
                    hover_col = self.colors["btn_equal_hover"]
                    text_col = "#080c14"

                btn = ctk.CTkButton(
                    self.keypad_frame,
                    text=text,
                    command=action,
                    corner_radius=14,  # Cantos arredondados modernos
                    font=ctk.CTkFont(family="Arial", size=13, weight="bold"),
                    fg_color=fg_col,
                    hover_color=hover_col,
                    text_color=text_col,
                    height=46
                )
                btn.grid(row=row_idx, column=col_idx, sticky="nsew", padx=3, pady=2)
                self.buttons[f"{row_idx}_{col_idx}"] = btn

    # Lógica de Interação e Funções Matemáticas
    def toggle_angle_mode(self):
        self.angle_mode = "RAD" if self.angle_mode == "DEG" else "DEG"
        self.angle_btn.configure(text=f"MODO: {self.angle_mode}")

    def toggle_second_mode(self):
        self.is_second_mode = not self.is_second_mode
        if self.is_second_mode:
            self.second_btn.configure(fg_color="#06b6d4", text_color="#080c14")
        else:
            self.second_btn.configure(fg_color="#1e293b", text_color="#f8fafc")

    def append_token(self, token):
        self.current_expression += str(token)
        self.update_display()

    def append_func(self, func_str):
        self.current_expression += func_str
        self.update_display()

    def clear_all(self):
        self.current_expression = ""
        self.result_label.configure(text="0")
        self.expr_label.configure(text="")

    def clear_entry(self):
        self.current_expression = ""
        self.result_label.configure(text="0")

    def toggle_sign(self):
        if self.current_expression:
            if self.current_expression.startswith("-(") and self.current_expression.endswith(")"):
                self.current_expression = self.current_expression[2:-1]
            else:
                self.current_expression = f"-({self.current_expression})"
            self.update_display()

    def backspace(self):
        if self.current_expression:
            self.current_expression = self.current_expression[:-1]
            self.update_display()
            if not self.current_expression:
                self.result_label.configure(text="0")

    def update_display(self):
        display_text = self.current_expression.replace("**", "^").replace("*", "×").replace("/", "÷")
        self.result_label.configure(text=display_text if display_text else "0")

    def calculate_result(self):
        if not self.current_expression:
            return

        expr = self.current_expression
        try:
            sanitized = expr.replace("×", "*").replace("÷", "/").replace("−", "-")
            sanitized = sanitized.replace("π", "math.pi").replace("e", "math.e")

            # Funções Trigonométricas com respeito ao modo DEG / RAD
            def sin_f(x):
                r = math.radians(x) if self.angle_mode == "DEG" else x
                return 0.0 if (self.angle_mode == "DEG" and x % 180 == 0) else math.sin(r)

            def cos_f(x):
                r = math.radians(x) if self.angle_mode == "DEG" else x
                return 0.0 if (self.angle_mode == "DEG" and (x - 90) % 180 == 0) else math.cos(r)

            def tan_f(x):
                r = math.radians(x) if self.angle_mode == "DEG" else x
                if self.angle_mode == "DEG" and (x - 90) % 180 == 0:
                    raise ZeroDivisionError("Tangente indefinida")
                return math.tan(r)

            allowed_names = {
                "math": math,
                "sin": sin_f,
                "cos": cos_f,
                "tan": tan_f,
                "asin": lambda x: (math.degrees(math.asin(x)) if self.angle_mode == "DEG" else math.asin(x)),
                "acos": lambda x: (math.degrees(math.acos(x)) if self.angle_mode == "DEG" else math.acos(x)),
                "atan": lambda x: (math.degrees(math.atan(x)) if self.angle_mode == "DEG" else math.atan(x)),
                "sinh": math.sinh,
                "cosh": math.cosh,
                "tanh": math.tanh,
                "ln": math.log,
                "log10": math.log10,
                "log2": math.log2,
                "sqrt": math.sqrt,
                "cbrt": lambda x: (-math.pow(-x, 1/3) if x < 0 else math.pow(x, 1/3)),
                "exp": math.exp,
                "abs": abs,
                "fact": math.factorial
            }

            result_val = eval(sanitized, {"__builtins__": {}}, allowed_names)

            if isinstance(result_val, (int, float)):
                if abs(result_val) < 1e-15:
                    result_val = 0
                if isinstance(result_val, float) and result_val.is_integer():
                    formatted = str(int(result_val))
                else:
                    formatted = f"{result_val:.10g}"
            else:
                formatted = str(result_val)

            self.expr_label.configure(text=self.current_expression + " =")
            self.result_label.configure(text=formatted)
            self.current_expression = formatted

        except ZeroDivisionError:
            self.result_label.configure(text="Erro: Divisão por 0")
        except Exception:
            self.result_label.configure(text="Erro de Sintaxe")

    def apply_factorial(self):
        try:
            val = float(self.result_label.cget("text"))
            if val < 0 or not val.is_integer():
                self.result_label.configure(text="Erro: n! requer int >= 0")
                return
            res = math.factorial(int(val))
            self.expr_label.configure(text=f"{int(val)}! =")
            self.result_label.configure(text=str(res))
            self.current_expression = str(res)
        except Exception:
            self.result_label.configure(text="Erro")

    def apply_reciprocal(self):
        try:
            val = float(self.result_label.cget("text"))
            if val == 0:
                self.result_label.configure(text="Erro: Divisão por 0")
                return
            res = 1 / val
            formatted = f"{res:.10g}"
            self.expr_label.configure(text=f"1/({val}) =")
            self.result_label.configure(text=formatted)
            self.current_expression = formatted
        except Exception:
            self.result_label.configure(text="Erro")

    def mem_clear(self):
        self.memory_value = 0.0
        self.mem_label.configure(text="")

    def mem_recall(self):
        self.append_token(str(self.memory_value))

    def mem_add(self):
        try:
            self.memory_value += float(self.result_label.cget("text"))
            self.mem_label.configure(text=f"[M: {self.memory_value:.4g}]")
        except Exception:
            pass

    def mem_sub(self):
        try:
            self.memory_value -= float(self.result_label.cget("text"))
            self.mem_label.configure(text=f"[M: {self.memory_value:.4g}]")
        except Exception:
            pass

    def bind_keys(self):
        self.bind("<Return>", lambda e: self.calculate_result())
        self.bind("<KP_Enter>", lambda e: self.calculate_result())
        self.bind("<BackSpace>", lambda e: self.backspace())
        self.bind("<Escape>", lambda e: self.clear_all())
        self.bind("+", lambda e: self.append_token("+"))
        self.bind("-", lambda e: self.append_token("-"))
        self.bind("*", lambda e: self.append_token("*"))
        self.bind("/", lambda e: self.append_token("/"))
        self.bind("=", lambda e: self.calculate_result())
        for d in range(10):
            self.bind(str(d), lambda e, digit=str(d): self.append_token(digit))
        self.bind(".", lambda e: self.append_token("."))

if __name__ == "__main__":
    app = ModernScientificCalculator()
    app.mainloop()
`;

export const PYTHON_TKINTER_STANDALONE = `"""
====================================================================
CALCULADORA CIENTÍFICA EM PYTHON NATIVO (Tkinter Padrão)
Sem dependências externas - roda diretamente em qualquer Python 3.
Inclui cantos arredondados simulados, modo escuro e todas as 4 operações básicas.
====================================================================
"""
import tkinter as tk
from tkinter import ttk
import math

class StandardScientificCalculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Calculadora Científica Python")
        self.root.geometry("480x680")
        self.root.configure(bg="#0f172a")

        self.expression = ""
        self.angle_mode = "DEG"

        self.setup_ui()
        self.bind_keys()

    def setup_ui(self):
        # Tela Display
        disp_frame = tk.Frame(self.root, bg="#020617", bd=0, highlightthickness=1, highlightbackground="#334155")
        disp_frame.pack(fill="x", padx=16, pady=16)

        self.lbl_expr = tk.Label(disp_frame, text="", font=("Courier", 12), fg="#94a3b8", bg="#020617", anchor="e")
        self.lbl_expr.pack(fill="x", padx=12, pady=(10, 2))

        self.lbl_res = tk.Label(disp_frame, text="0", font=("Courier", 28, "bold"), fg="#f8fafc", bg="#020617", anchor="e")
        self.lbl_res.pack(fill="x", padx=12, pady=(0, 10))

        # Barra de Controles DEG/RAD
        ctrl_frame = tk.Frame(self.root, bg="#0f172a")
        ctrl_frame.pack(fill="x", padx=16, pady=(0, 10))

        self.btn_angle = tk.Button(
            ctrl_frame, text=f"Ângulo: {self.angle_mode}", bg="#1e293b", fg="#38bdf8",
            relief="flat", font=("Arial", 10, "bold"), command=self.toggle_angle
        )
        self.btn_angle.pack(side="left")

        # Grade de Teclas (6 Colunas x 7 Linhas)
        # Coluna 5 com os 4 operadores fundamentais: ÷, ×, −, + e =
        grid_frame = tk.Frame(self.root, bg="#0f172a")
        grid_frame.pack(fill="both", expand=True, padx=16, pady=(0, 16))

        keys = [
            # Linha 0
            ("MC", "MC"), ("MR", "MR"), ("M+", "M+"), ("M-", "M-"), ("C", "C"), ("AC", "AC"),
            # Linha 1
            ("sin", "sin("), ("cos", "cos("), ("tan", "tan("), ("x²", "**2"), ("x^y", "**"), ("÷", "/"),
            # Linha 2: 7, 8, 9 e Multiplicação (×)
            ("ln", "ln("), ("log₁₀", "log10("), ("7", "7"), ("8", "8"), ("9", "9"), ("×", "*"),
            # Linha 3: 4, 5, 6 e Subtração (−)
            ("eˣ", "exp("), ("10ˣ", "10**"), ("4", "4"), ("5", "5"), ("6", "6"), ("−", "-"),
            # Linha 4: 1, 2, 3 e Adição (+)
            ("√x", "sqrt("), ("x!", "!"), ("1", "1"), ("2", "2"), ("3", "3"), ("+", "+"),
            # Linha 5: 0, ., =
            ("π", "π"), ("e", "e"), ("±", "±"), ("0", "0"), (".", "."), ("=", "="),
            # Linha 6: Auxiliares
            ("(", "("), (")", ")"), ("1/x", "1/x"), ("|x|", "abs("), ("%", "%"), ("⌫", "DEL")
        ]

        for i, (label, val) in enumerate(keys):
            r = i // 6
            c = i % 6
            grid_frame.columnconfigure(c, weight=1)
            grid_frame.rowconfigure(r, weight=1)

            bg_c = "#1e293b" if val.isdigit() or val in [".", "π", "e"] else "#0f172a"
            fg_c = "#f8fafc"
            if val in ["/", "*", "-", "+"]:
                bg_c = "#0369a1"
                fg_c = "#ffffff"
            elif val == "=":
                bg_c = "#06b6d4"
                fg_c = "#080c14"
            elif val in ["AC", "C", "DEL"]:
                bg_c = "#be123c"

            b = tk.Button(
                grid_frame, text=label, bg=bg_c, fg=fg_c, relief="flat",
                font=("Arial", 11, "bold"), bd=0, activebackground="#38bdf8",
                command=lambda v=val: self.on_press(v)
            )
            b.grid(row=r, column=c, sticky="nsew", padx=2, pady=2)

    def toggle_angle(self):
        self.angle_mode = "RAD" if self.angle_mode == "DEG" else "DEG"
        self.btn_angle.config(text=f"Ângulo: {self.angle_mode}")

    def on_press(self, val):
        if val == "AC":
            self.expression = ""
            self.lbl_res.config(text="0")
            self.lbl_expr.config(text="")
        elif val in ["C", "DEL"]:
            self.expression = self.expression[:-1]
            self.lbl_res.config(text=self.expression or "0")
        elif val == "=":
            self.eval_expr()
        elif val == "±":
            if self.expression:
                self.expression = f"-({self.expression})"
                self.lbl_res.config(text=self.expression)
        else:
            self.expression += val
            self.lbl_res.config(text=self.expression)

    def eval_expr(self):
        try:
            expr = self.expression.replace("π", "math.pi").replace("e", "math.e")
            sin_f = lambda x: math.sin(math.radians(x)) if self.angle_mode == "DEG" else math.sin(x)
            cos_f = lambda x: math.cos(math.radians(x)) if self.angle_mode == "DEG" else math.cos(x)
            tan_f = lambda x: math.tan(math.radians(x)) if self.angle_mode == "DEG" else math.tan(x)

            allowed = {
                "math": math, "sin": sin_f, "cos": cos_f, "tan": tan_f,
                "ln": math.log, "log10": math.log10, "sqrt": math.sqrt, "exp": math.exp,
                "abs": abs
            }
            res = eval(expr, {"__builtins__": {}}, allowed)
            self.lbl_expr.config(text=self.expression + " =")
            self.lbl_res.config(text=str(round(res, 8)))
            self.expression = str(res)
        except Exception:
            self.lbl_res.config(text="Erro")

    def bind_keys(self):
        self.root.bind("<Return>", lambda e: self.eval_expr())
        self.root.bind("<Escape>", lambda e: self.on_press("AC"))
        for op in ["+", "-", "*", "/"]:
            self.root.bind(op, lambda e, o=op: self.on_press(o))
        for d in range(10):
            self.root.bind(str(d), lambda e, dig=str(d): self.on_press(dig))

if __name__ == "__main__":
    root = tk.Tk()
    app = StandardScientificCalculator(root)
    root.mainloop()
`;
