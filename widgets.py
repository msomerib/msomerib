import tkinter as tk
from tkinter import ttk

AZUL = "#1565C0"
AZUL_ESC = "#0D47A1"
AZUL_CLARO = "#E3F2FD"
VERDE = "#2E7D32"
VERMELHO = "#C62828"
LARANJA = "#E65100"
AMARELO = "#F9A825"
CINZA = "#F5F5F5"
CINZA_ESC = "#E0E0E0"
BRANCO = "#FFFFFF"
TEXTO = "#212121"
TEXTO_SEC = "#757575"


def aplicar_estilo(root):
    style = ttk.Style(root)
    style.theme_use("clam")
    style.configure(".", background=CINZA, foreground=TEXTO, font=("Segoe UI", 10))
    style.configure("TFrame", background=CINZA)
    style.configure("TLabel", background=CINZA, foreground=TEXTO)
    style.configure("TButton", font=("Segoe UI", 10), padding=5)
    style.configure("Accent.TButton", background=AZUL, foreground=BRANCO,
                    font=("Segoe UI", 10, "bold"), padding=6)
    style.map("Accent.TButton", background=[("active", AZUL_ESC), ("pressed", AZUL_ESC)])
    style.configure("Danger.TButton", background=VERMELHO, foreground=BRANCO,
                    font=("Segoe UI", 10), padding=6)
    style.map("Danger.TButton", background=[("active", "#B71C1C")])
    style.configure("Success.TButton", background=VERDE, foreground=BRANCO,
                    font=("Segoe UI", 10), padding=6)
    style.configure("TNotebook", background=CINZA)
    style.configure("TNotebook.Tab", font=("Segoe UI", 10, "bold"), padding=(14, 7))
    style.configure("Treeview", font=("Segoe UI", 10), rowheight=26, fieldbackground=BRANCO)
    style.configure("Treeview.Heading", font=("Segoe UI", 10, "bold"),
                    background=AZUL, foreground=BRANCO, relief="flat")
    style.map("Treeview.Heading", background=[("active", AZUL_ESC)])
    style.configure("Header.TLabel", font=("Segoe UI", 14, "bold"), foreground=AZUL)
    style.configure("Card.TLabel", font=("Segoe UI", 22, "bold"), foreground=AZUL)
    style.configure("CardTitle.TLabel", font=("Segoe UI", 10), foreground=TEXTO_SEC)


def tv_padrao(parent, colunas, larguras=None, altura=18, show_iid=False):
    frame = tk.Frame(parent, bg=CINZA)
    vsb = ttk.Scrollbar(frame, orient="vertical")
    hsb = ttk.Scrollbar(frame, orient="horizontal")
    tv = ttk.Treeview(frame, columns=colunas, show="headings",
                      yscrollcommand=vsb.set, xscrollcommand=hsb.set, height=altura)
    vsb.config(command=tv.yview)
    hsb.config(command=tv.xview)
    vsb.pack(side="right", fill="y")
    hsb.pack(side="bottom", fill="x")
    tv.pack(side="left", fill="both", expand=True)
    if larguras is None:
        larguras = [120] * len(colunas)
    for col, larg in zip(colunas, larguras):
        tv.heading(col, text=col)
        tv.column(col, width=larg, anchor="w", minwidth=40)
    tv.tag_configure("vencido", foreground=VERMELHO)
    tv.tag_configure("vigente", foreground=VERDE)
    tv.tag_configure("alerta", foreground=LARANJA)
    tv.tag_configure("pago", foreground=VERDE)
    tv.tag_configure("pendente", foreground=LARANJA)
    return tv, frame


def card_kpi(parent, titulo, valor, cor=AZUL, largura=160):
    f = tk.Frame(parent, bg=BRANCO, width=largura, height=90,
                 highlightbackground=CINZA_ESC, highlightthickness=1)
    f.pack_propagate(False)
    barra = tk.Frame(f, bg=cor, height=4)
    barra.pack(fill="x")
    ttk.Label(f, text=titulo, style="CardTitle.TLabel", background=BRANCO,
              wraplength=largura-16).pack(anchor="w", padx=10, pady=(6, 0))
    ttk.Label(f, text=valor, style="Card.TLabel", background=BRANCO).pack(anchor="w", padx=10)
    return f


class FormDlg(tk.Toplevel):
    def __init__(self, parent, titulo, w=620, h=560):
        super().__init__(parent)
        self.title(titulo)
        self.geometry(f"{w}x{h}")
        self.resizable(True, True)
        self.grab_set()
        self.configure(bg=CINZA)
        self.resultado = None
        tk.Frame(self, bg=AZUL, height=48).place(x=0, y=0, relwidth=1)
        tk.Label(self, text=titulo, bg=AZUL, fg=BRANCO,
                 font=("Segoe UI", 12, "bold")).place(x=16, y=12)
        self.corpo = ttk.Frame(self, padding=16)
        self.corpo.place(x=0, y=48, relwidth=1, relheight=1, height=-80)
        self.rodape = tk.Frame(self, bg=CINZA_ESC)
        self.rodape.place(x=0, rely=1.0, y=-40, relwidth=1, height=40)

    def _lbl(self, p, t, row, col, cs=1):
        ttk.Label(p, text=t, font=("Segoe UI", 9), foreground=TEXTO_SEC
                  ).grid(row=row*2, column=col, sticky="w", padx=6, pady=(6, 0), columnspan=cs)

    def campo(self, p, label, row, col=0, cs=1, w=28, var=None):
        self._lbl(p, label, row, col, cs)
        if var is None:
            var = tk.StringVar()
        e = ttk.Entry(p, textvariable=var, width=w)
        e.grid(row=row*2+1, column=col, sticky="ew", padx=6, pady=(0, 2), columnspan=cs)
        return var, e

    def combo(self, p, label, opcoes, row, col=0, cs=1, w=26):
        self._lbl(p, label, row, col, cs)
        var = tk.StringVar(value=opcoes[0] if opcoes else "")
        cb = ttk.Combobox(p, textvariable=var, values=opcoes, width=w, state="readonly")
        cb.grid(row=row*2+1, column=col, sticky="ew", padx=6, pady=(0, 2), columnspan=cs)
        return var, cb

    def texto(self, p, label, row, col=0, cs=1, h=3):
        self._lbl(p, label, row, col, cs)
        t = tk.Text(p, height=h, font=("Segoe UI", 10))
        t.grid(row=row*2+1, column=col, sticky="ew", padx=6, pady=(0, 2), columnspan=cs)
        return t


def btn(parent, texto, cmd, estilo="TButton", **kw):
    return ttk.Button(parent, text=texto, command=cmd, style=estilo, **kw)
