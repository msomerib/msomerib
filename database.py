import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "moradias.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS imoveis (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo        TEXT UNIQUE NOT NULL,
            entidade      TEXT,
            quadra        INTEGER,
            lote          INTEGER,
            endereco      TEXT NOT NULL,
            numero        TEXT,
            tipo          TEXT,
            area_m2       REAL,
            construcao_m2 REAL,
            matricula     INTEGER,
            local_area    TEXT,
            morador       TEXT,
            num_contrato  TEXT,
            tipo_contrato TEXT,
            vigencia      TEXT,
            sit_contrato  TEXT DEFAULT 'VIGENTE',
            taxa_ocupacao REAL,
            preco_minimo  REAL,
            preco_25pct   REAL,
            status        TEXT DEFAULT 'OCUPADO',
            observacoes   TEXT,
            criado_em     TEXT DEFAULT (date('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS contratos (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            imovel_id       INTEGER REFERENCES imoveis(id),
            num_contrato    TEXT UNIQUE NOT NULL,
            entidade        TEXT NOT NULL,
            modalidade      TEXT DEFAULT 'ONEROSO',
            tipo_uso        TEXT DEFAULT 'RESIDENCIAL',
            assinatura_dig  TEXT,
            data_vigencia   TEXT,
            status          TEXT DEFAULT 'VIGENTE',
            dias_vencer     INTEGER,
            prorrogavel_ate TEXT,
            cpf_cnpj        TEXT,
            responsavel     TEXT,
            end_correspondencia TEXT,
            telefone        TEXT,
            email           TEXT,
            observacoes     TEXT,
            criado_em       TEXT DEFAULT (date('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS leiloes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            numero      TEXT UNIQUE NOT NULL,
            descricao   TEXT,
            data_edital TEXT,
            qtd_imoveis INTEGER DEFAULT 0,
            status      TEXT DEFAULT 'PLANEJADO',
            observacoes TEXT,
            criado_em   TEXT DEFAULT (date('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS lotes_leilao (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            leilao_id       INTEGER NOT NULL REFERENCES leiloes(id),
            lote_leilao     INTEGER,
            quadra          INTEGER,
            lote            INTEGER,
            matricula       INTEGER,
            endereco        TEXT,
            numero          TEXT,
            arrematante     TEXT,
            depositante     TEXT,
            modo_pagamento  TEXT,
            cpf_cnpj        TEXT,
            rg              TEXT,
            conjuge         TEXT,
            cpf_conjuge     TEXT,
            rg_conjuge      TEXT,
            valor_minimo    REAL,
            valor_arrematado REAL,
            agio            REAL,
            garantia_5pct   REAL,
            valor_pago_5pct REAL,
            valor_complementar REAL,
            doc_termo_arr   TEXT DEFAULT 'NAO',
            doc_pessoais    TEXT DEFAULT 'NAO',
            doc_comprov_res TEXT DEFAULT 'NAO',
            doc_leiloeiro   TEXT DEFAULT 'NAO',
            telefone        TEXT,
            email           TEXT,
            status          TEXT DEFAULT 'PENDENTE',
            observacoes     TEXT
        );

        CREATE TABLE IF NOT EXISTS ofertas_compra (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            imovel_id           INTEGER REFERENCES imoveis(id),
            entidade            TEXT,
            morador             TEXT NOT NULL,
            cpf                 TEXT,
            telefone            TEXT,
            email               TEXT,
            matricula           INTEGER,
            endereco            TEXT,
            numero              TEXT,
            tipo                TEXT,
            num_siscor          TEXT,
            data_siscor         TEXT,
            opcao_compra        TEXT,
            forma_pagamento     TEXT,
            composicao_credito  TEXT,
            form_correto        TEXT DEFAULT 'NAO',
            doc_identidade      TEXT DEFAULT 'NAO SE APLICA',
            vinculo_entidade    TEXT DEFAULT 'NAO SE APLICA',
            fatura_energia      TEXT DEFAULT 'NAO',
            fatura_agua         TEXT DEFAULT 'NAO',
            certidao_neg_1      TEXT DEFAULT 'NAO',
            certidao_neg_2      TEXT DEFAULT 'NAO',
            cadastro_cadunico   TEXT DEFAULT 'NAO',
            doc_herdeiro        TEXT DEFAULT 'NAO SE APLICA',
            num_ar_envio        TEXT,
            data_entrega_form   TEXT,
            dias_prorrog_form   INTEGER DEFAULT 0,
            status_resposta     TEXT,
            valor_total         REAL,
            valor_pago          REAL DEFAULT 0,
            correcao_monetaria  REAL DEFAULT 0,
            outras_obs          TEXT,
            data_limite_pgto    TEXT,
            dias_prorrog_pgto   INTEGER DEFAULT 0,
            status_prazo_pgto   TEXT,
            status_valor_pgto   TEXT,
            data_email_escritura TEXT,
            valor_imovel        REAL,
            valor_com_desconto  REAL,
            data_pagamento      TEXT,
            data_transferencia  TEXT,
            observacoes         TEXT,
            criado_em           TEXT DEFAULT (date('now','localtime'))
        );
        """)
