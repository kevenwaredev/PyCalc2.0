#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Testes unitários para o motor matemático da calculadora científica em Python,
incluindo Operações Básicas (+, -, *, /), Trigonometria, Logaritmos e Exponenciação.
"""
import math
import calculadora

def test_engine():
    eng = calculadora.ScientificMathEngine()

    print("[1/5] Testando Operações Básicas: Adição, Subtração, Multiplicação e Divisão...")
    assert abs(eng.evaluate("15 + 27") - 42.0) < 1e-9, "Erro na adição 15 + 27"
    assert abs(eng.evaluate("100 - 37") - 63.0) < 1e-9, "Erro na subtração 100 - 37"
    assert abs(eng.evaluate("12 * 8") - 96.0) < 1e-9, "Erro na multiplicação 12 * 8"
    assert abs(eng.evaluate("12 × 8") - 96.0) < 1e-9, "Erro no símbolo ×"
    assert abs(eng.evaluate("144 / 12") - 12.0) < 1e-9, "Erro na divisão 144 / 12"
    assert abs(eng.evaluate("144 ÷ 12") - 12.0) < 1e-9, "Erro no símbolo ÷"
    assert abs(eng.evaluate("50 − 15") - 35.0) < 1e-9, "Erro no símbolo −"
    # Ordem das operações
    assert abs(eng.evaluate("10 + 5 * 4 - 6 / 2") - 27.0) < 1e-9, "Erro na ordem de operações"

    print("[2/5] Testando Trigonometria...")
    eng.angle_mode = "DEG"
    assert abs(eng.evaluate("sin(90)") - 1.0) < 1e-9, "Erro no sin(90 DEG)"
    assert abs(eng.evaluate("cos(0)") - 1.0) < 1e-9, "Erro no cos(0 DEG)"
    assert abs(eng.evaluate("tan(45)") - 1.0) < 1e-9, "Erro no tan(45 DEG)"
    assert abs(eng.evaluate("asin(1)") - 90.0) < 1e-9, "Erro no asin(1 DEG)"

    eng.angle_mode = "RAD"
    assert abs(eng.evaluate("sin(pi / 2)") - 1.0) < 1e-9, "Erro no sin(pi/2 RAD)"
    assert abs(eng.evaluate("cos(pi)") - (-1.0)) < 1e-9, "Erro no cos(pi RAD)"

    print("[3/5] Testando Logaritmos...")
    assert abs(eng.evaluate("ln(e)") - 1.0) < 1e-9, "Erro no ln(e)"
    assert abs(eng.evaluate("log10(1000)") - 3.0) < 1e-9, "Erro no log10(1000)"
    assert abs(eng.evaluate("log2(64)") - 6.0) < 1e-9, "Erro no log2(64)"

    print("[4/5] Testando Exponenciação e Raízes...")
    assert abs(eng.evaluate("2^5") - 32.0) < 1e-9, "Erro no 2^5"
    assert abs(eng.evaluate("sqrt(144)") - 12.0) < 1e-9, "Erro no sqrt(144)"
    assert abs(eng.evaluate("exp(2)") - math.exp(2)) < 1e-9, "Erro no exp(2)"
    assert abs(eng.evaluate("cbrt(27)") - 3.0) < 1e-9, "Erro no cbrt(27)"

    print("[5/5] Testando Operações Combinadas com Funções...")
    eng.angle_mode = "DEG"
    assert abs(eng.evaluate("sin(30) + 2^3") - 8.5) < 1e-9, "Erro na expressão sin(30) + 2^3"
    assert abs(eng.evaluate("fact(5) + 10") - 130.0) < 1e-9, "Erro na expressão fact(5) + 10"
    assert abs(eng.evaluate("log10(100) * 5 - 2") - 8.0) < 1e-9, "Erro na expressão log10(100) * 5 - 2"

    print(">> TODOS OS TESTES PASSARAM COM SUCESSO! ADIÇÃO, SUBTRAÇÃO, MULTIPLICAÇÃO E DIVISÃO 100% OPERACIONAIS.")

if __name__ == "__main__":
    test_engine()
