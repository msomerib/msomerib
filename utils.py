import re
from datetime import date, datetime

def fmt_moeda(v):
    if v is None or v == "":
        return ""
    try:
        return f"R$ {float(v):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return str(v)

def fmt_data(v):
    if not v:
        return ""
    try:
        if isinstance(v, datetime):
            return v.strftime("%d/%m/%Y")
        return datetime.strptime(str(v)[:10], "%Y-%m-%d").strftime("%d/%m/%Y")
    except Exception:
        return str(v)

def parse_data(texto):
    if not texto:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(texto.strip(), fmt).strftime("%Y-%m-%d")
        except Exception:
            pass
    return None

def parse_moeda(texto):
    if not texto:
        return 0.0
    texto = re.sub(r"[R$\s]", "", str(texto)).replace(".", "").replace(",", ".")
    try:
        return float(texto)
    except Exception:
        return 0.0

def dias_para_vencer(data_str):
    if not data_str:
        return None
    try:
        venc = datetime.strptime(str(data_str)[:10], "%Y-%m-%d").date()
        return (venc - date.today()).days
    except Exception:
        return None

STATUS_IMOVEL = ["OCUPADO", "VAGO", "ALIENADO", "EM LEILAO", "SUSPENSO"]
STATUS_CONTRATO = ["VIGENTE", "VENCIDO", "RESCINDIDO", "SUSPENSO"]
MODALIDADES = ["ONEROSO", "COMODATO", "CESSAO GRATUITA"]
TIPOS_USO = ["RESIDENCIAL", "COMERCIAL", "INSTITUCIONAL"]
STATUS_LEILAO = ["PLANEJADO", "EM ANDAMENTO", "ENCERRADO", "CANCELADO"]
STATUS_PARCELA_DOC = ["NAO", "SIM", "ENTREGOU", "ENTREGOU PARCIAL", "NAO SE APLICA"]
OPCOES_COMPRA = ["COM DESCONTO", "SEM DESCONTO"]
FORMAS_PAGAMENTO = ["A VISTA - RECURSOS PROPRIOS", "CREDITO IMOBILIARIO", "PARCELADO"]
COMPOSICAO_CREDITO = ["RENDA DO MORADOR", "RENDA DO MORADOR E FAMILIARES", "FGTS", "OUTRO"]
