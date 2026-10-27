


import sys
import math
import os

# Verificação de ambiente gráfico e biblioteca CustomTkinter
GUI_AVAILABLE = False
try:
    import customtkinter as ctk
    GUI_AVAILABLE = True
except ImportError:
    pass

class ScientificMathEngine:
    
    def __init__(self):
        self.angle_mode = "DEG"  # "DEG" ou "RAD"
        self.memory_value = 0.0

    def evaluate(self, expr: str) -> float:
        
        if not expr or not expr.strip():
            return 0.0

        sanitized = expr.strip()
        sanitized = sanitized.replace("×", "*").replace("÷", "/").replace("−", "-")
        sanitized = sanitized.replace("π", "pi").replace("φ", "phi")
        sanitized = sanitized.replace("^", "**")

        # Inserir multiplicação implícita (ex: 2pi -> 2*pi, 3(4) -> 3*(4))
        # Escopo de funções permitidas no Python
        def get_sin(x):
            rad = math.radians(x) if self.angle_mode == "DEG" else x
            if self.angle_mode == "DEG" and x % 180 == 0:
                return 0.0
            return math.sin(rad)

        def get_cos(x):
            rad = math.radians(x) if self.angle_mode == "DEG" else x
            if self.angle_mode == "DEG" and (x - 90) % 180 == 0:
                return 0.0
            return math.cos(rad)

        def get_tan(x):
            rad = math.radians(x) if self.angle_mode == "DEG" else x
            if self.angle_mode == "DEG" and (x - 90) % 180 == 0:
                raise ZeroDivisionError("Tangente indefinida (90° / 270°)")
            return math.tan(rad)

        def get_asin(x):
            r = math.asin(x)
            return math.degrees(r) if self.angle_mode == "DEG" else r

        def get_acos(x):
            r = math.acos(x)
            return math.degrees(r) if self.angle_mode == "DEG" else r

        def get_atan(x):
            r = math.atan(x)
            return math.degrees(r) if self.angle_mode == "DEG" else r

        allowed = {
            "math": math,
            "sin": get_sin,
            "cos": get_cos,
            "tan": get_tan,
            "asin": get_asin,
            "acos": get_acos,
            "atan": get_atan,
            "sinh": math.sinh,
            "cosh": math.cosh,
            "tanh": math.tanh,
            "ln": math.log,
            "log": math.log10,
            "log10": math.log10,
            "log2": math.log2,
            "exp": math.exp,
            "sqrt": math.sqrt,
            "cbrt": (lambda x: -math.pow(-x, 1/3) if x < 0 else math.pow(x, 1/3)),
            "fact": math.factorial,
            "abs": abs,
            "round": round,
            "pow": pow,
            "pi": math.pi,
            "e": math.e,
            "tau": math.pi * 2,
            "phi": (1 + math.sqrt(5)) / 2,
        }

        
        res = eval(sanitized, {"__builtins__": {}}, allowed)
        if isinstance(res, (int, float)):
            if abs(res) < 1e-15:
                return 0.0
            return float(res)
        return float(res)



if GUI_AVAILABLE:
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")

    class ModernScientificCalculatorGUI(ctk.CTk):
        def __init__(self):
            super().__init__()

            # Propriedades da Janela com Cantos Arredondados
            self.title("Calculadora Científica Python")
            self.geometry("540x700")
            self.minsize(500, 640)
            self.configure(fg_color="#0b0f19")

            self.engine = ScientificMathEngine()
            self.current_expression = ""
            self.is_second = False

            
            self.theme = {
                "window_bg": "#0b0f19",
                "card_bg": "#111827",
                "display_bg": "#080c14",
                "display_text": "#f8fafc",
                "display_muted": "#94a3b8",
                "btn_num": "#1e293b",
                "btn_num_hover": "#334155",
                "btn_sci": "#0f172a",
                "btn_sci_hover": "#1e293b",
                "btn_op": "#0369a1",
                "btn_op_hover": "#0284c7",
                "btn_danger": "#be123c",
                "btn_danger_hover": "#e11d48",
                "btn_equal": "#06b6d4",
                "btn_equal_hover": "#22d3ee",
            }

            self.setup_ui()
            self.bind_keyboard()

        def setup_ui(self):
            
            self.card = ctk.CTkFrame(
                self,
                fg_color=self.theme["card_bg"],
                corner_radius=24,
                border_width=1,
                border_color="#1e293b"
            )
            self.card.pack(fill="both", expand=True, padx=16, pady=16)

            
            top_bar = ctk.CTkFrame(self.card, fg_color="transparent", height=36)
            top_bar.pack(fill="x", padx=16, pady=(12, 6))

            
            self.btn_angle = ctk.CTkButton(
                top_bar,
                text=f"ÂNGULO: {self.engine.angle_mode}",
                command=self.toggle_angle,
                width=110,
                height=30,
                corner_radius=15,
                fg_color="#1e293b",
                hover_color="#334155",
                text_color="#06b6d4",
                font=ctk.CTkFont(family="Arial", size=11, weight="bold")
            )
            self.btn_angle.pack(side="left")

         
            self.lbl_mem = ctk.CTkLabel(
                top_bar,
                text="",
                font=ctk.CTkFont(family="Arial", size=11, weight="bold"),
                text_color="#34d399"
            )
            self.lbl_mem.pack(side="left", padx=12)

          
            self.btn_2nd = ctk.CTkButton(
                top_bar,
                text="2nd",
                command=self.toggle_second,
                width=55,
                height=30,
                corner_radius=15,
                fg_color="#1e293b",
                hover_color="#334155",
                font=ctk.CTkFont(family="Arial", size=11, weight="bold")
            )
            self.btn_2nd.pack(side="right")

       
            self.disp_frame = ctk.CTkFrame(
                self.card,
                fg_color=self.theme["display_bg"],
                corner_radius=18,
                border_width=1,
                border_color="#1e293b"
            )
            self.disp_frame.pack(fill="x", padx=16, pady=(0, 12))

          
            self.lbl_formula = ctk.CTkLabel(
                self.disp_frame,
                text="",
                font=ctk.CTkFont(family="Courier", size=13),
                text_color=self.theme["display_muted"],
                anchor="e"
            )
            self.lbl_formula.pack(fill="x", padx=16, pady=(10, 2))

            
            self.lbl_result = ctk.CTkLabel(
                self.disp_frame,
                text="0",
                font=ctk.CTkFont(family="Courier", size=36, weight="bold"),
                text_color=self.theme["display_text"],
                anchor="e"
            )
            self.lbl_result.pack(fill="x", padx=16, pady=(0, 12))

            
            self.grid_frame = ctk.CTkFrame(self.card, fg_color="transparent")
            self.grid_frame.pack(fill="both", expand=True, padx=12, pady=(0, 12))

            for c in range(6):
                self.grid_frame.grid_columnconfigure(c, weight=1, pad=4)
            for r in range(6):
                self.grid_frame.grid_rowconfigure(r, weight=1, pad=4)

            self.create_buttons()

        def create_buttons(self):
            
            layout = [
                # Linha 0: Funções de Memória e Limpeza
                [("MC", self.mem_clear, "sci"), ("MR", self.mem_recall, "sci"), ("M+", self.mem_add, "sci"),
                 ("M-", self.mem_sub, "sci"), ("C", self.clear_entry, "danger"), ("AC", self.clear_all, "danger")],
                # Linha 1: Trigonometria, Potências e Divisão (÷)
                [("sin", lambda: self.add_func("sin("), "sci"), ("cos", lambda: self.add_func("cos("), "sci"),
                 ("tan", lambda: self.add_func("tan("), "sci"), ("x²", lambda: self.add_tok("**2"), "sci"),
                 ("x^y", lambda: self.add_tok("**"), "sci"), ("÷", lambda: self.add_tok("/"), "op")],
                # Linha 2: Logaritmos, Teclado Numérico (7, 8, 9) e Multiplicação (×)
                [("ln", lambda: self.add_func("ln("), "sci"), ("log₁₀", lambda: self.add_func("log10("), "sci"),
                 ("7", lambda: self.add_tok("7"), "num"), ("8", lambda: self.add_tok("8"), "num"),
                 ("9", lambda: self.add_tok("9"), "num"), ("×", lambda: self.add_tok("*"), "op")],
                # Linha 3: Exponenciais, Teclado Numérico (4, 5, 6) e Subtração (−)
                [("eˣ", lambda: self.add_func("exp("), "sci"), ("10ˣ", lambda: self.add_tok("10**"), "sci"),
                 ("4", lambda: self.add_tok("4"), "num"), ("5", lambda: self.add_tok("5"), "num"),
                 ("6", lambda: self.add_tok("6"), "num"), ("−", lambda: self.add_tok("-"), "op")],
                # Linha 4: Raiz, Fatorial, Teclado Numérico (1, 2, 3) e Adição (+)
                [("√x", lambda: self.add_func("sqrt("), "sci"), ("x!", self.do_factorial, "sci"),
                 ("1", lambda: self.add_tok("1"), "num"), ("2", lambda: self.add_tok("2"), "num"),
                 ("3", lambda: self.add_tok("3"), "num"), ("+", lambda: self.add_tok("+"), "op")],
                # Linha 5: Constantes (π, e), Sinal (±), Zero, Ponto e Igualdade (=)
                [("π", lambda: self.add_tok("π"), "sci"), ("e", lambda: self.add_tok("e"), "sci"),
                 ("±", self.toggle_sign, "sci"), ("0", lambda: self.add_tok("0"), "num"),
                 (".", lambda: self.add_tok("."), "num"), ("=", self.calculate, "equal")],
                # Linha 6: Parênteses, Inverso, Módulo, Porcentagem e Raiz Cúbica
                [("(", lambda: self.add_tok("("), "sci"), (")", lambda: self.add_tok(")"), "sci"),
                 ("1/x", self.do_reciprocal, "sci"), ("|x|", lambda: self.add_func("abs("), "sci"),
                 ("%", lambda: self.add_tok("%"), "sci"), ("∛x", lambda: self.add_func("cbrt("), "sci")]
            ]

            for r, row in enumerate(layout):
                for c, (txt, cmd, kind) in enumerate(row):
                    bg = self.theme["btn_num"]
                    hover = self.theme["btn_num_hover"]
                    fg = "#f8fafc"

                    if kind == "sci":
                        bg = self.theme["btn_sci"]
                        hover = self.theme["btn_sci_hover"]
                        fg = "#94a3b8"
                    elif kind == "op":
                        bg = self.theme["btn_op"]
                        hover = self.theme["btn_op_hover"]
                        fg = "#ffffff"
                    elif kind == "danger":
                        bg = self.theme["btn_danger"]
                        hover = self.theme["btn_danger_hover"]
                    elif kind == "equal":
                        bg = self.theme["btn_equal"]
                        hover = self.theme["btn_equal_hover"]
                        fg = "#080c14"

                    btn = ctk.CTkButton(
                        self.grid_frame,
                        text=txt,
                        command=cmd,
                        corner_radius=14,  # Cantos arredondados nos botões
                        font=ctk.CTkFont(family="Arial", size=13, weight="bold"),
                        fg_color=bg,
                        hover_color=hover,
                        text_color=fg,
                        height=44
                    )
                    btn.grid(row=r, column=c, sticky="nsew", padx=3, pady=2)

        def toggle_angle(self):
            self.engine.angle_mode = "RAD" if self.engine.angle_mode == "DEG" else "DEG"
            self.btn_angle.configure(text=f"ÂNGULO: {self.engine.angle_mode}")

        def toggle_second(self):
            self.is_second = not self.is_second
            self.btn_2nd.configure(
                fg_color="#06b6d4" if self.is_second else "#1e293b",
                text_color="#080c14" if self.is_second else "#f8fafc"
            )

        def add_tok(self, token):
            self.current_expression += str(token)
            self.update_display()

        def add_func(self, func):
            self.current_expression += func
            self.update_display()

        def clear_all(self):
            self.current_expression = ""
            self.lbl_result.configure(text="0")
            self.lbl_formula.configure(text="")

        def clear_entry(self):
            self.current_expression = ""
            self.lbl_result.configure(text="0")

        def toggle_sign(self):
            if self.current_expression:
                if self.current_expression.startswith("-(") and self.current_expression.endswith(")"):
                    self.current_expression = self.current_expression[2:-1]
                else:
                    self.current_expression = f"-({self.current_expression})"
                self.update_display()

        def update_display(self):
            visual = self.current_expression.replace("**", "^").replace("*", "×").replace("/", "÷")
            self.lbl_result.configure(text=visual if visual else "0")

        def calculate(self):
            if not self.current_expression:
                return
            try:
                res = self.engine.evaluate(self.current_expression)
                if abs(res - round(res)) < 1e-12:
                    out = str(int(round(res)))
                else:
                    out = f"{res:.10g}"
                self.lbl_formula.configure(text=self.current_expression + " =")
                self.lbl_result.configure(text=out)
                self.current_expression = out
            except ZeroDivisionError:
                self.lbl_result.configure(text="Erro: Divisão por 0")
            except Exception:
                self.lbl_result.configure(text="Erro de Sintaxe")

        def do_factorial(self):
            try:
                val = float(self.lbl_result.cget("text"))
                if val < 0 or not val.is_integer():
                    self.lbl_result.configure(text="Erro: n! requer inteiro >= 0")
                    return
                res = math.factorial(int(val))
                self.lbl_formula.configure(text=f"{int(val)}! =")
                self.lbl_result.configure(text=str(res))
                self.current_expression = str(res)
            except Exception:
                self.lbl_result.configure(text="Erro")

        def do_reciprocal(self):
            try:
                val = float(self.lbl_result.cget("text"))
                if val == 0:
                    self.lbl_result.configure(text="Erro: Divisão por 0")
                    return
                res = 1 / val
                out = f"{res:.10g}"
                self.lbl_formula.configure(text=f"1/({val}) =")
                self.lbl_result.configure(text=out)
                self.current_expression = out
            except Exception:
                self.lbl_result.configure(text="Erro")

        def mem_clear(self):
            self.engine.memory_value = 0.0
            self.lbl_mem.configure(text="")

        def mem_recall(self):
            self.add_tok(str(self.engine.memory_value))

        def mem_add(self):
            try:
                val = float(self.lbl_result.cget("text"))
                self.engine.memory_value += val
                self.lbl_mem.configure(text=f"[M: {self.engine.memory_value:.4g}]")
            except Exception:
                pass

        def mem_sub(self):
            try:
                val = float(self.lbl_result.cget("text"))
                self.engine.memory_value -= val
                self.lbl_mem.configure(text=f"[M: {self.engine.memory_value:.4g}]")
            except Exception:
                pass

        def bind_keyboard(self):
            self.bind("<Return>", lambda e: self.calculate())
            self.bind("<KP_Enter>", lambda e: self.calculate())
            self.bind("<Escape>", lambda e: self.clear_all())
            self.bind("<BackSpace>", lambda e: self.add_tok("") if not self.current_expression else setattr(self, 'current_expression', self.current_expression[:-1]) or self.update_display())
            self.bind("+", lambda e: self.add_tok("+"))
            self.bind("-", lambda e: self.add_tok("-"))
            self.bind("*", lambda e: self.add_tok("*"))
            self.bind("/", lambda e: self.add_tok("/"))
            self.bind("=", lambda e: self.calculate())
            for d in range(10):
                self.bind(str(d), lambda e, digit=str(d): self.add_tok(digit))
            self.bind(".", lambda e: self.add_tok("."))



def run_cli():
    engine = ScientificMathEngine()
    print("=" * 65)
    print("  CALCULADORA CIENTÍFICA EM PYTHON PURO")
    print("  Suporte: sin, cos, tan, ln, log10, log2, exp, sqrt, **, fact")
    print(f"  Modo Angular Padrão: {engine.angle_mode}")
    print("  Comandos: 'modo' (alterna DEG/RAD), 'ajuda', 'sair'")
    print("=" * 65)

    while True:
        try:
            cmd = input(f"Python [{engine.angle_mode}] > ").strip()
            if not cmd:
                continue
            if cmd.lower() in ["sair", "exit", "quit", "q"]:
                print("Encerrando calculadora Python. Até logo!")
                break
            if cmd.lower() == "modo":
                engine.angle_mode = "RAD" if engine.angle_mode == "DEG" else "DEG"
                print(f">> Modo angular alterado para: {engine.angle_mode}")
                continue
            if cmd.lower() == "ajuda":
                print("Exemplos válidos:")
                print("  sin(45) + cos(45)")
                print("  ln(e) + log10(1000)")
                print("  2**8 + sqrt(144)")
                print("  fact(5) / exp(2)")
                continue

            res = engine.evaluate(cmd)
            print(f" = {res}")
        except KeyboardInterrupt:
            print("\nEncerrando...")
            break
        except Exception as e:
            print(f" Erro: {e}")


# Ponto de Entrada Principal
if __name__ == "__main__":
    has_display = bool(os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY") or sys.platform == "win32" or sys.platform == "darwin")
    
    if GUI_AVAILABLE and has_display:
        app = ModernScientificCalculatorGUI()
        app.mainloop()
    else:
        run_cli()
