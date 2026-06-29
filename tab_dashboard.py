import tkinter as tk
from tkinter import ttk
from database import get_conn
from widgets import card_kpi, AZUL, VERDE, VERMELHO, LARANJA, CINZA, BRANCO, TEXTO_SEC
from utils import fmt_moeda
import datetime


class TabDashboard(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent, padding=16)
        self._build()
        self.atualizar()

    def _build(self):
        ttk.Label(self, text="Painel de Controle - Setor de Moradias",
                  style="Header.TLabel").pack(anchor="w", pady=(0, 4))
        hoje = datetime.date.today().strftime("%d/%m/%Y")
        ttk.Label(self, text=f"Atualizado em {hoje}",
                  foreground=TEXTO_SEC).pack(anchor="w", pady=(0, 16))

        self.frame_kpis = tk.Frame(self, bg="#F5F5F5")
        self.frame_kpis.pack(fill="x", pady=(0, 20))

        linha2 = ttk.Frame(self)
        linha2.pack(fill="both", expand=True)
        linha2.columnconfigure(0, weight=1)
        linha2.columnconfigure(1, weight=1)

        f_venc = tk.LabelFrame(linha2, text="  Contratos Vencendo em 60 dias  ",
                               bg=BRANCO, font=("Segoe UI", 10, "bold"), fg=LARANJA)
        f_venc.grid(row=0, column=0, sticky="nsew", padx=(0, 8), pady=4)
        from widgets import tv_padrao
        self.tv_venc, frm = tv_padrao(f_venc,
            ["Contrato", "Entidade", "Vencimento", "Dias"],
            [130, 200, 100, 60], altura=8)
        frm.pack(fill="both", expand=True, padx=4, pady=4)

        f_ofert = tk.LabelFrame(linha2, text="  Ofertas de Compra com Prazo Expirado  ",
                                bg=BRANCO, font=("Segoe UI", 10, "bold"), fg=VERMELHO)
        f_ofert.grid(row=0, column=1, sticky="nsew", padx=(8, 0), pady=4)
        self.tv_ofert, frm2 = tv_padrao(f_ofert,
            ["Morador", "Endereco", "Prazo Pgto.", "Status Valor"],
            [160, 180, 100, 140], altura=8)
        frm2.pack(fill="both", expand=True, padx=4, pady=4)

        ttk.Button(self, text="Atualizar", command=self.atualizar).pack(anchor="e", pady=8)

    def atualizar(self):
        for w in self.frame_kpis.winfo_children():
            w.destroy()

        with get_conn() as conn:
            total_im = conn.execute("SELECT COUNT(*) FROM imoveis").fetchone()[0]
            vagos = conn.execute("SELECT COUNT(*) FROM imoveis WHERE status='VAGO'").fetchone()[0]
            alienados = conn.execute("SELECT COUNT(*) FROM imoveis WHERE status='ALIENADO'").fetchone()[0]
            ct_vigente = conn.execute("SELECT COUNT(*) FROM contratos WHERE status='VIGENTE'").fetchone()[0]
            ct_vencido = conn.execute("SELECT COUNT(*) FROM contratos WHERE status='VENCIDO'").fetchone()[0]
            leiloes_at = conn.execute("SELECT COUNT(*) FROM leiloes WHERE status='EM ANDAMENTO'").fetchone()[0]
            ofertas = conn.execute("SELECT COUNT(*) FROM ofertas_compra").fetchone()[0]
            pgto_ok = conn.execute("SELECT COUNT(*) FROM ofertas_compra WHERE status_valor_pgto='PGTO. FINALIZADO'").fetchone()[0]

        kpis = [
            ("Imoveis Cadastrados", str(total_im), AZUL),
            ("Imoveis Vagos", str(vagos), LARANJA),
            ("Alienados", str(alienados), VERDE),
            ("Contratos Vigentes", str(ct_vigente), VERDE),
            ("Contratos Vencidos", str(ct_vencido), VERMELHO),
            ("Leiloes em Andamento", str(leiloes_at), AZUL),
            ("Ofertas de Compra", str(ofertas), AZUL),
            ("Pagamentos Concluidos", str(pgto_ok), VERDE),
        ]
        for titulo, valor, cor in kpis:
            k = card_kpi(self.frame_kpis, titulo, valor, cor)
            k.pack(side="left", padx=6, pady=4)

        for i in self.tv_venc.get_children():
            self.tv_venc.delete(i)
        hoje = datetime.date.today()
        limite = (hoje + datetime.timedelta(days=60)).isoformat()
        with get_conn() as conn:
            rows = conn.execute("""SELECT num_contrato, entidade, data_vigencia,
                julianday(data_vigencia) - julianday('now') as dias
                FROM contratos WHERE status='VIGENTE' AND data_vigencia <= ?
                ORDER BY data_vigencia""", (limite,)).fetchall()
        from utils import fmt_data
        for r in rows:
            dias = int(r["dias"]) if r["dias"] else 0
            tag = "vencido" if dias < 0 else ("alerta" if dias <= 30 else "")
            self.tv_venc.insert("", "end", values=(
                r["num_contrato"], r["entidade"][:30],
                fmt_data(r["data_vigencia"]), dias
            ), tags=(tag,))

        for i in self.tv_ofert.get_children():
            self.tv_ofert.delete(i)
        with get_conn() as conn:
            rows = conn.execute("""SELECT morador, endereco, numero, data_limite_pgto,
                status_valor_pgto FROM ofertas_compra
                WHERE (status_valor_pgto IS NULL OR status_valor_pgto != 'PGTO. FINALIZADO')
                ORDER BY data_limite_pgto""").fetchall()
        for r in rows:
            end = f"{r['endereco'] or ''}, {r['numero'] or ''}"
            self.tv_ofert.insert("", "end", values=(
                r["morador"][:25] if r["morador"] else "",
                end[:28], fmt_data(r["data_limite_pgto"]),
                r["status_valor_pgto"] or "PENDENTE"
            ))
