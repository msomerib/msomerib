#!/usr/bin/env python3
"""
Sistema de Gerenciamento de Moradias - Setor de Moradias
Itaipu Binacional
"""
import tkinter as tk
from tkinter import ttk
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from widgets import aplicar_estilo, AZUL, CINZA, BRANCO


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Sistema de Moradias - Itaipu Binacional")
        self.geometry("1400x820")
        self.minsize(1100, 680)
        self.configure(bg=CINZA)
        init_db()
        aplicar_estilo(self)
        self._build()

    def _build(self):
        header = tk.Frame(self, bg=AZUL, height=56)
        header.pack(fill="x")
        header.pack_propagate(False)
        tk.Label(header, text="Sistema de Moradias - Itaipu Binacional",
                 bg=AZUL, fg=BRANCO,
                 font=("Segoe UI", 14, "bold")).pack(side="left", padx=18, pady=14)
        import datetime
        tk.Label(header, text=datetime.date.today().strftime("%d/%m/%Y"),
                 bg=AZUL, fg="#90CAF9", font=("Segoe UI", 11)).pack(side="right", padx=18)

        nb = ttk.Notebook(self)
        nb.pack(fill="both", expand=True, padx=8, pady=8)

        from tab_dashboard import TabDashboard
        from tab_imoveis import TabImoveis
        from tab_contratos import TabContratos
        from tab_leiloes import TabLeiloes
        from tab_ofertas import TabOfertas
        from tab_relatorios import TabRelatorios

        abas = [
            ("  Painel  ", TabDashboard),
            ("  Imoveis  ", TabImoveis),
            ("  Contratos  ", TabContratos),
            ("  Leiloes (ALN)  ", TabLeiloes),
            ("  Ofertas de Compra  ", TabOfertas),
            ("  Relatorios  ", TabRelatorios),
        ]
        for titulo, Cls in abas:
            frame = Cls(nb)
            nb.add(frame, text=titulo)

        rodape = tk.Frame(self, bg="#E8EAF6", height=28)
        rodape.pack(fill="x")
        tk.Label(rodape, text="Setor de Moradias - SGII.AD - Itaipu Binacional",
                 bg="#E8EAF6", fg="#5C6BC0",
                 font=("Segoe UI", 9)).pack(side="left", padx=12, pady=4)
        tk.Label(rodape, text="Banco de dados: moradias.db",
                 bg="#E8EAF6", fg="#9E9E9E",
                 font=("Segoe UI", 9)).pack(side="right", padx=12, pady=4)


if __name__ == "__main__":
    app = App()
    app.mainloop()
