#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera docs/security-audit/relatorio-auditoria-seguranca.pdf a partir dos
achados descritos em dados_auditoria.py.

Uso (a partir da raiz do projeto):
    docs/security-audit/.venv/bin/python docs/security-audit/gerar_relatorio.py

O venv é criado uma vez com:
    python3 -m venv docs/security-audit/.venv
    docs/security-audit/.venv/bin/pip install reportlab matplotlib
"""
import os
import sys
import textwrap

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import dados_auditoria as D  # noqa: E402

SAIDA = os.path.join(AQUI, "relatorio-auditoria-seguranca.pdf")
TMP = os.path.join(AQUI, ".graficos")

CORES = {
    "critica": colors.HexColor("#B91C1C"),
    "alta": colors.HexColor("#EA580C"),
    "media": colors.HexColor("#D97706"),
    "baixa": colors.HexColor("#2563EB"),
    "informativa": colors.HexColor("#64748B"),
    "forte": colors.HexColor("#059669"),
}
HEX = {k: v.hexval().replace("0x", "#")[:7] for k, v in CORES.items()}
ROTULO = {
    "critica": "CRÍTICA",
    "alta": "ALTA",
    "media": "MÉDIA",
    "baixa": "BAIXA",
    "informativa": "INFORMATIVA",
}
ORDEM = ["critica", "alta", "media", "baixa", "informativa"]

TINTA = colors.HexColor("#0F172A")
TINTA_SUAVE = colors.HexColor("#475569")
LINHA = colors.HexColor("#CBD5E1")
FUNDO_CODIGO = colors.HexColor("#F1F5F9")

TITULO_RELATORIO = f"Relatório de Auditoria de Segurança — {D.PROJETO}"

# O quadro de texto tem 469.89pt de largura (A4 menos 2cm de cada lado).
# 16.6cm dá 470.55pt e fazia as tabelas vazarem meio ponto para fora da
# margem direita, cortando o fim das linhas longas dentro dos blocos de
# código. 16.4cm cabe com folga.
LARGURA = 16.4 * cm


# --------------------------------------------------------------------------
# estilos
# --------------------------------------------------------------------------
def montar_estilos():
    ss = getSampleStyleSheet()
    e = {}
    e["capa_titulo"] = ParagraphStyle(
        "capa_titulo", parent=ss["Title"], fontName="Helvetica-Bold",
        fontSize=25, leading=31, textColor=TINTA, alignment=TA_CENTER, spaceAfter=6,
    )
    e["capa_sub"] = ParagraphStyle(
        "capa_sub", parent=ss["Normal"], fontSize=13.5, leading=19,
        textColor=TINTA_SUAVE, alignment=TA_CENTER,
    )
    e["h1"] = ParagraphStyle(
        "h1", parent=ss["Heading1"], fontName="Helvetica-Bold", fontSize=17,
        leading=21, textColor=TINTA, spaceBefore=2, spaceAfter=9,
    )
    e["h2"] = ParagraphStyle(
        "h2", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=12.5,
        leading=16, textColor=TINTA, spaceBefore=13, spaceAfter=5,
    )
    e["h3"] = ParagraphStyle(
        "h3", parent=ss["Heading3"], fontName="Helvetica-Bold", fontSize=10.5,
        leading=14, textColor=TINTA_SUAVE, spaceBefore=9, spaceAfter=3,
    )
    e["corpo"] = ParagraphStyle(
        "corpo", parent=ss["Normal"], fontSize=9.6, leading=14.2,
        textColor=TINTA, alignment=TA_JUSTIFY, spaceAfter=6,
    )
    e["corpo_pequeno"] = ParagraphStyle(
        "corpo_pequeno", parent=e["corpo"], fontSize=8.6, leading=12.4, spaceAfter=3,
    )
    e["celula"] = ParagraphStyle(
        "celula", parent=ss["Normal"], fontSize=8.4, leading=11.6, textColor=TINTA,
    )
    e["celula_mono"] = ParagraphStyle(
        "celula_mono", parent=ss["Normal"], fontName="Courier", fontSize=7.6,
        leading=10.4, textColor=colors.HexColor("#1E293B"),
    )
    e["chip"] = ParagraphStyle(
        "chip", parent=ss["Normal"], fontName="Helvetica-Bold", fontSize=7.3,
        leading=9.4, textColor=colors.white, alignment=TA_CENTER,
    )
    e["codigo"] = ParagraphStyle(
        "codigo", parent=ss["Code"], fontName="Courier", fontSize=7.4, leading=9.8,
        textColor=colors.HexColor("#0F172A"),
    )
    e["legenda"] = ParagraphStyle(
        "legenda", parent=ss["Normal"], fontSize=7.8, leading=10.4,
        textColor=TINTA_SUAVE, alignment=TA_CENTER,
    )
    return e


def esc(t):
    """Escapa tudo para Paragraph. Negrito nos dados usa a sentinela [[b]]…[[/b]],
    para que um <b> literal no texto (ex.: exemplo de allowlist de tags) continue
    sendo mostrado como texto em vez de virar marcação."""
    t = (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    return t.replace("[[b]]", "<b>").replace("[[/b]]", "</b>")


# --------------------------------------------------------------------------
# cabeçalho / rodapé
# --------------------------------------------------------------------------
def decorar(canvas, doc):
    canvas.saveState()
    largura, altura = A4
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(TINTA_SUAVE)
    canvas.drawString(2 * cm, altura - 1.15 * cm, TITULO_RELATORIO)
    canvas.setStrokeColor(LINHA)
    canvas.setLineWidth(0.5)
    canvas.line(2 * cm, altura - 1.32 * cm, largura - 2 * cm, altura - 1.32 * cm)
    canvas.line(2 * cm, 1.42 * cm, largura - 2 * cm, 1.42 * cm)
    canvas.drawString(2 * cm, 1.05 * cm, D.DATA_AUDITORIA)
    canvas.drawRightString(largura - 2 * cm, 1.05 * cm, f"Página {canvas.getPageNumber()}")
    canvas.restoreState()


def sem_decoracao(canvas, doc):
    pass


# --------------------------------------------------------------------------
# gráficos
# --------------------------------------------------------------------------
def gerar_graficos():
    os.makedirs(TMP, exist_ok=True)
    plt.rcParams["font.family"] = "DejaVu Sans"

    por_sev = {s: 0 for s in ORDEM}
    for a in D.ACHADOS:
        por_sev[a["severidade"]] += 1
    sev_presentes = [(s, n) for s, n in por_sev.items() if n]

    # rosca por severidade
    fig, ax = plt.subplots(figsize=(4.5, 3.4), dpi=220)
    valores = [n for _, n in sev_presentes]
    cores_ = [HEX[s] for s, _ in sev_presentes]
    rotulos = [f"{ROTULO[s].title()} ({n})" for s, n in sev_presentes]
    cunhas, _ = ax.pie(valores, colors=cores_, startangle=90,
                       wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2))
    ax.text(0, 0.08, str(len(D.ACHADOS)), ha="center", va="center",
            fontsize=25, fontweight="bold", color="#0F172A")
    ax.text(0, -0.24, "achados", ha="center", va="center", fontsize=9.5, color="#475569")
    ax.legend(cunhas, rotulos, loc="center left", bbox_to_anchor=(1.0, 0.5),
              frameon=False, fontsize=8.6)
    ax.set(aspect="equal")
    fig.tight_layout()
    p_rosca = os.path.join(TMP, "rosca.png")
    fig.savefig(p_rosca, transparent=True, bbox_inches="tight")
    plt.close(fig)

    # barras por categoria
    por_cat = {c: 0 for c in D.CATEGORIAS}
    cor_cat = {}
    for a in D.ACHADOS:
        por_cat[a["categoria"]] += 1
        atual = cor_cat.get(a["categoria"])
        if atual is None or ORDEM.index(a["severidade"]) < ORDEM.index(atual):
            cor_cat[a["categoria"]] = a["severidade"]

    cats = list(D.CATEGORIAS)
    fig, ax = plt.subplots(figsize=(6.2, 3.0), dpi=220)
    nomes = [textwrap.fill(D.CATEGORIAS[c], 22) for c in cats]
    vals = [por_cat[c] for c in cats]
    cs = [HEX[cor_cat.get(c, "informativa")] for c in cats]
    barras = ax.barh(nomes, vals, color=cs, height=0.58)
    ax.invert_yaxis()
    ax.set_xlim(0, max(vals) + 1)
    for b, v in zip(barras, vals):
        ax.text(b.get_width() + 0.09, b.get_y() + b.get_height() / 2, str(v),
                va="center", fontsize=9.5, fontweight="bold", color="#0F172A")
    ax.set_xlabel("Achados", fontsize=8.6, color="#475569")
    ax.tick_params(axis="y", labelsize=8.4, length=0)
    ax.tick_params(axis="x", labelsize=8, colors="#475569")
    for lado in ("top", "right", "left"):
        ax.spines[lado].set_visible(False)
    ax.spines["bottom"].set_color("#CBD5E1")
    ax.xaxis.set_major_locator(matplotlib.ticker.MaxNLocator(integer=True))
    fig.tight_layout()
    p_barras = os.path.join(TMP, "barras.png")
    fig.savefig(p_barras, transparent=True, bbox_inches="tight")
    plt.close(fig)

    return p_rosca, p_barras, por_sev


# --------------------------------------------------------------------------
# blocos reutilizáveis
# --------------------------------------------------------------------------
def chip(sev, e, largura=2.45 * cm):
    t = Table([[Paragraph(ROTULO[sev], e["chip"])]], colWidths=[largura], rowHeights=[0.46 * cm])
    t.hAlign = "LEFT"
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CORES[sev]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


def bloco_codigo(rotulo, codigo, e, largura=LARGURA):
    linhas = []
    for linha in codigo.split("\n"):
        linhas.extend(textwrap.wrap(linha, 96) or [""])
    corpo = Preformatted("\n".join(linhas), e["codigo"])
    t = Table([[Paragraph(f"<font color='#475569'>{esc(rotulo)}</font>", e["celula_mono"])], [corpo]],
              colWidths=[largura])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), FUNDO_CODIGO),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, LINHA),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (0, 0), 5),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
    ]))
    return t


def rotulo_valor(rot, valor, e):
    return Paragraph(f"<b>{esc(rot)}</b> {esc(valor)}", e["corpo_pequeno"])


# --------------------------------------------------------------------------
# seções
# --------------------------------------------------------------------------
def capa(e, hist):
    el = [Spacer(1, 3.4 * cm)]
    el.append(Paragraph("Relatório de Auditoria de Segurança", e["capa_titulo"]))
    el.append(Paragraph(esc(D.PROJETO), e["capa_titulo"]))
    el.append(Spacer(1, 0.5 * cm))
    barra = Table([[""]], colWidths=[5 * cm], rowHeights=[3])
    barra.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), CORES["critica"])]))
    barra.hAlign = "CENTER"
    el.append(barra)
    el.append(Spacer(1, 0.7 * cm))
    el.append(Paragraph(esc(D.DATA_AUDITORIA), e["capa_sub"]))
    el.append(Spacer(1, 0.25 * cm))
    resumo = " · ".join(f"{hist[s]} {ROTULO[s].lower()}" for s in ORDEM if hist[s])
    el.append(Paragraph(f"<b>{len(D.ACHADOS)} achados</b> — {esc(resumo)}", e["capa_sub"]))
    el.append(Spacer(1, 1.5 * cm))

    el.append(Paragraph("Escopo auditado", e["h2"]))
    el.append(Paragraph(
        "Repositório <b>" + esc(D.REPO) + "</b>, na íntegra: os 20 route handlers de app/api/** e "
        "app/payload-api/**, as 4 Server Actions de app/actions.ts, as 11 collections e 6 globals do Payload "
        "(incluindo o access control de cada uma), o frontend em app/(frontend)/** e components/**, os arquivos "
        "de configuração (next.config.mjs, payload.config.ts, vercel.json, .env.example), o histórico completo "
        "do git e o bundle compilado do cliente. Verificações de confirmação foram feitas contra o ambiente de "
        "produção usando apenas requisições de leitura.", e["corpo"]))

    el.append(Paragraph("Stack detectada", e["h2"]))
    linhas = [[Paragraph(f"<b>{esc(k)}</b>", e["celula"]), Paragraph(esc(v), e["celula"])] for k, v in D.STACK]
    t = Table(linhas, colWidths=[3.5 * cm, 12.9 * cm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINHA),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
    ]))
    el.append(t)
    return el


def metodologia(e):
    el = [Paragraph("Nota metodológica", e["h1"])]
    el.append(Paragraph(
        "As cinco categorias pedidas foram traduzidas para os equivalentes desta stack antes da varredura. Onde "
        "uma categoria não tem correspondente no projeto, isso está dito explicitamente em vez de forçar um "
        "achado.", e["corpo"]))
    for titulo, texto in D.NOTA_METODOLOGICA:
        el.append(Paragraph(esc(titulo), e["h3"]))
        el.append(Paragraph(esc(texto), e["corpo"]))
    el.append(Paragraph("Categoria sem correspondente no projeto", e["h3"]))
    el.append(Paragraph(
        "<b>Permissão definida no navegador não se aplica na forma clássica.</b> O projeto não tem papéis: a "
        "collection users (collections/Users.ts) não declara nenhum campo de papel, e a varredura do frontend por "
        "isAdmin, canEdit, role ou permission não encontrou nenhum gate de interface para cruzar com o backend. "
        "Só existem dois níveis — autenticado no /cms ou anônimo. A categoria foi então auditada na forma que "
        "existe aqui: operações privilegiadas expostas como rota HTTP ou Server Action sem verificação "
        "equivalente no servidor.", e["corpo"]))
    el.append(Paragraph(
        "<b>Sem infraestrutura como código para auditar.</b> Não há Dockerfile, docker-compose, chart Helm nem "
        "Terraform no repositório; o deploy é gerenciado pela Vercel e o único arquivo é vercel.json, que contém "
        "apenas a região de execução.", e["corpo"]))
    return el


def resumo_executivo(e, p_rosca, p_barras, hist):
    el = [Paragraph("Resumo executivo", e["h1"])]
    criticos = [a for a in D.ACHADOS if a["severidade"] in ("critica", "alta")]
    el.append(Paragraph(
        f"A auditoria registrou <b>{len(D.ACHADOS)} achados</b>, sendo <b>{len(criticos)} de severidade crítica ou "
        "alta</b>, e <b>" + str(len(D.PONTOS_FORTES)) + " controles verificados e aprovados</b>. O achado central "
        "é uma exposição de dados pessoais já ocorrendo em produção: fotos e nomes de fiéis que pediram sigilo ao "
        "acender uma vela estão publicamente listáveis. Os demais riscos altos são um ponto de XSS alimentado por "
        "API de terceiro e uma rota de IA aberta que gasta a chave da paróquia.", e["corpo"]))
    el.append(Paragraph(
        "O contraste é importante para interpretar o relatório: o projeto acerta os controles difíceis — posse "
        "verificada em todo handler por ID, SQL inteiramente parametrizado, coleções com dado pessoal fechadas, "
        "nenhum segredo no código ou no histórico. As falhas estão nas bordas, onde uma defesa existente deixou "
        "de ser estendida a um caminho novo.", e["corpo"]))

    corrigidos = [a for a in D.ACHADOS if str(a.get("situacao", "")).startswith("CORRIGIDO")]
    if corrigidos:
        el.append(Paragraph(
            f"<b>Estado desta revisão:</b> {len(corrigidos)} dos {len(D.ACHADOS)} achados já foram corrigidos e "
            "verificados; o restante está registrado como decisão consciente. A linha <b>Situação</b>, ao fim de "
            "cada achado, diz o que foi feito e com qual commit. As correções ainda precisam ser publicadas para "
            "valerem em produção.", e["corpo"]))

    el.append(Spacer(1, 0.35 * cm))
    cab = [Paragraph(f"<font color='white'><b>{c}</b></font>", e["celula"])
           for c in ("Severidade", "Achados", "O que representa")]
    corpo = []
    resumos = {
        "critica": "Dado pessoal exposto agora, sem necessidade de autenticação",
        "alta": "Execução de script de terceiro no domínio e abuso de chave paga",
        "media": "Operação privilegiada sem autorização própria, hoje protegida por acaso",
        "baixa": "Endurecimento: exige condição prévia para ser explorado",
        "informativa": "Padrão frágil sem impacto explorável hoje",
    }
    for s in ORDEM:
        if not hist[s]:
            continue
        corpo.append([chip(s, e), Paragraph(f"<b>{hist[s]}</b>", e["celula"]),
                      Paragraph(esc(resumos[s]), e["celula"])])
    tabela = Table([cab] + corpo, colWidths=[2.9 * cm, 1.9 * cm, 11.6 * cm], repeatRows=1)
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TINTA),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINHA),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    # A tabela vem antes dos gráficos: assim ela não é partida deixando uma
    # linha órfã numa página quase vazia, e os dois gráficos seguem juntos.
    el.append(KeepTogether(tabela))

    rosca = Table([[Image(p_rosca, width=8.4 * cm, height=8.4 * cm * 0.66)]], colWidths=[LARGURA])
    rosca.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
    graficos = [
        Spacer(1, 0.5 * cm),
        rosca,
        Paragraph("Distribuição dos achados por severidade", e["legenda"]),
        Spacer(1, 0.6 * cm),
        Image(p_barras, width=14.2 * cm, height=14.2 * cm * 0.47, hAlign="CENTER"),
        Paragraph("Achados por categoria (cor = maior severidade da categoria)", e["legenda"]),
    ]
    el.append(KeepTogether(graficos))
    return el


def fortes_fracos(e):
    el = [Paragraph("Pontos fortes verificados", e["h1"])]
    el.append(Paragraph(
        "Cada item abaixo foi conferido no código e, quando indicado, confirmado contra produção. Esta seção "
        "também serve de prova de cobertura da auditoria.", e["corpo"]))
    linhas = []
    for titulo, ev in D.PONTOS_FORTES:
        marca = Table([[Paragraph("<font color='white'><b>OK</b></font>", e["chip"])]],
                      colWidths=[1.0 * cm], rowHeights=[0.42 * cm])
        marca.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CORES["forte"]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 1), ("RIGHTPADDING", (0, 0), (-1, -1), 1),
            ("TOPPADDING", (0, 0), (-1, -1), 1), ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]))
        linhas.append([marca, Paragraph(f"<b>{esc(titulo)}</b><br/>{esc(ev)}", e["celula"])])
    t = Table(linhas, colWidths=[1.3 * cm, 15.1 * cm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINHA),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
    ]))
    el.append(t)

    el.append(Paragraph("Pontos fracos — os riscos centrais", e["h1"]))
    for f in D.PONTOS_FRACOS:
        el.append(Paragraph(f"•&nbsp;&nbsp;{esc(f)}", e["corpo"]))
    return el


def achados_detalhados(e):
    el = [Paragraph("Achados detalhados", e["h1"])]
    el.append(Paragraph(
        "Organizados por categoria. Cada achado traz arquivo e linha exatos, o trecho de código, por que é "
        "explorável, o impacto e a correção sugerida. Condições de explorabilidade, quando existem, estão "
        "marcadas em <b>Condição</b>.", e["corpo"]))

    for cod, nome in D.CATEGORIAS.items():
        da_cat = [a for a in D.ACHADOS if a["categoria"] == cod]
        if not da_cat:
            continue
        el.append(Paragraph(f"{cod} — {esc(nome)}", e["h2"]))

        cab = [Paragraph(f"<font color='white'><b>{c}</b></font>", e["celula"])
               for c in ("Severidade", "Arquivo:linha", "Descrição")]
        linhas = [cab]
        for a in da_cat:
            arqs = "<br/>".join(f"{esc(f)}:{esc(l)}" for f, l in a["arquivos"])
            linhas.append([
                chip(a["severidade"], e, largura=2.3 * cm),
                Paragraph(arqs, e["celula_mono"]),
                Paragraph(f"<b>{esc(a['id'])}</b> — {esc(a['titulo'])}", e["celula"]),
            ])
        t = Table(linhas, colWidths=[2.6 * cm, 6.4 * cm, 7.4 * cm], repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TINTA),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINHA),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ]))
        el.append(t)
        el.append(Spacer(1, 0.25 * cm))

        for a in da_cat:
            bloco = [Paragraph(f"{esc(a['id'])} — {esc(a['titulo'])}", e["h3"]),
                     chip(a["severidade"], e)]
            bloco.append(Spacer(1, 0.18 * cm))
            for rot, cod_ in a["codigo"]:
                bloco.append(bloco_codigo(rot, cod_, e))
                bloco.append(Spacer(1, 0.14 * cm))
            bloco.append(rotulo_valor("Por que é explorável:", a["porque"], e))
            if a.get("evidencia_extra"):
                bloco.append(rotulo_valor("Condição / evidência:", a["evidencia_extra"], e))
            bloco.append(rotulo_valor("Impacto:", a["impacto"], e))
            bloco.append(rotulo_valor("Correção sugerida:", a["correcao"], e))
            if a.get("situacao"):
                bloco.append(rotulo_valor("Situação:", a["situacao"], e))
            bloco.append(Spacer(1, 0.3 * cm))
            el.append(KeepTogether(bloco[:3]))
            el.extend(bloco[3:])
    return el


def recomendacoes(e):
    el = [Paragraph("Recomendações priorizadas", e["h1"])]
    cab = [Paragraph(f"<font color='white'><b>{c}</b></font>", e["celula"])
           for c in ("Prioridade", "Ação", "Detalhe", "Achados")]
    linhas = [cab]
    for pri, acao, det, refs in D.RECOMENDACOES:
        cor = {"P1": CORES["critica"], "P2": CORES["alta"], "P3": CORES["baixa"]}[pri]
        m = Table([[Paragraph(pri, e["chip"])]], colWidths=[1.5 * cm], rowHeights=[0.46 * cm])
        m.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), cor),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2), ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        linhas.append([m, Paragraph(f"<b>{esc(acao)}</b>", e["celula"]),
                       Paragraph(esc(det), e["celula"]),
                       Paragraph(esc(refs), e["celula_mono"])])
    t = Table(linhas, colWidths=[1.9 * cm, 4.4 * cm, 7.9 * cm, 2.2 * cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TINTA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINHA),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    el.append(t)
    return el


# --------------------------------------------------------------------------
# issues do GitHub
# --------------------------------------------------------------------------
def markdown_issue(a):
    linhas = [
        f"**Título:** [Segurança] {a['titulo']}",
        "",
        f"**Labels:** `security`, `severity:{a['severidade']}`",
        "",
        "## Problema",
        "",
        a["porque"],
        "",
        "## Evidência",
        "",
    ]
    for rot, cod in a["codigo"]:
        linhas += [f"`{rot}`", "", "```ts", cod, "```", ""]
    for f, l in a["arquivos"]:
        linhas.append(f"- `{f}:{l}`")
    linhas += ["", "## Condição de explorabilidade", "", a.get("evidencia_extra", "Nenhuma condição prévia."), ""]
    linhas += ["## Impacto", "", a["impacto"], "", "## Correção sugerida", "", a["correcao"], ""]
    if a.get("situacao"):
        linhas += ["## Situação", "", a["situacao"], ""]
    linhas += ["## Critérios de aceite", ""]
    for c in D.CRITERIOS.get(a["id"], []):
        linhas.append(f"- [ ] {c}")
    return "\n".join(linhas)


def markdown_issue_agrupada(g):
    achados = [a for a in D.ACHADOS if a["id"] in g["achados"]]
    linhas = [
        f"**Título:** {g['titulo']}",
        "",
        f"**Labels:** `{g['labels'].replace(', ', '`, `')}`",
        "",
        "## Problema",
        "",
        "Três itens de endurecimento de baixo risco, agrupados por serem correções pequenas e independentes "
        "entre si — não justificam uma issue cada.",
        "",
    ]
    for a in achados:
        linhas += [f"### {a['id']} — {a['titulo']}", "", a["porque"], "", "**Evidência:**", ""]
        for rot, cod in a["codigo"]:
            linhas += [f"`{rot}`", "", "```ts", cod, "```", ""]
        linhas += [f"**Condição:** {a.get('evidencia_extra', '—')}", "",
                   f"**Impacto:** {a['impacto']}", "",
                   f"**Correção:** {a['correcao']}", ""]
    linhas += ["## Critérios de aceite", ""]
    for a in achados:
        for c in D.CRITERIOS.get(a["id"], []):
            linhas.append(f"- [ ] ({a['id']}) {c}")
    return "\n".join(linhas)


def secao_issues(e):
    el = [Paragraph("Issues para o GitHub", e["h1"])]
    el.append(Paragraph(
        "Texto completo de cada issue, em Markdown, pronto para copiar e colar. Os três achados de endurecimento "
        "(F-05, F-06 e F-07) foram agrupados numa issue só, para não gerar ruído no repositório.", e["corpo"]))

    issues = [("ISSUE " + str(i + 1), markdown_issue(a))
              for i, a in enumerate(a for a in D.ACHADOS if a["id"] not in D.AGRUPAR_EM_UMA_ISSUE["achados"])]
    issues.append((f"ISSUE {len(issues) + 1}", markdown_issue_agrupada(D.AGRUPAR_EM_UMA_ISSUE)))

    # Preformatted dentro de Table não quebra entre páginas, e uma issue
    # inteira passa da altura do quadro. Então o bloco é fatiado em pedaços
    # que cabem, cada um na sua caixa — os delimitadores de abertura e
    # fechamento continuam aparecendo uma vez só, nas pontas.
    LINHAS_POR_CAIXA = 62

    for rotulo, md in issues:
        linhas = []
        for linha in md.split("\n"):
            linhas.extend(textwrap.wrap(linha, 96, subsequent_indent="  ",
                                        break_long_words=False, break_on_hyphens=False) or [""])
        linhas = [f"--- {rotulo} ---", ""] + linhas + ["", f"--- FIM {rotulo} ---"]

        pedacos = [linhas[i:i + LINHAS_POR_CAIXA] for i in range(0, len(linhas), LINHAS_POR_CAIXA)]
        for indice, pedaco in enumerate(pedacos):
            if indice:
                el.append(Paragraph(
                    f"<font color='#475569'>{esc(rotulo)} (continuação {indice + 1}/{len(pedacos)})</font>",
                    e["legenda"]))
            t = Table([[Preformatted("\n".join(pedaco), e["codigo"])]], colWidths=[LARGURA])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), FUNDO_CODIGO),
                ("BOX", (0, 0), (-1, -1), 0.6, LINHA),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]))
            el.append(t)
            if indice < len(pedacos) - 1:
                el.append(PageBreak())
        el.append(Spacer(1, 0.45 * cm))
    return el


# --------------------------------------------------------------------------
def main():
    e = montar_estilos()
    p_rosca, p_barras, hist = gerar_graficos()

    doc = BaseDocTemplate(SAIDA, pagesize=A4,
                          leftMargin=2 * cm, rightMargin=2 * cm,
                          topMargin=2 * cm, bottomMargin=2 * cm,
                          title=TITULO_RELATORIO, author="Auditoria de segurança")
    quadro = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="corpo")
    doc.addPageTemplates([
        PageTemplate(id="capa", frames=[quadro], onPage=sem_decoracao),
        PageTemplate(id="miolo", frames=[quadro], onPage=decorar),
    ])

    el = []
    el += capa(e, hist)
    el.append(NextPageTemplate("miolo"))
    el.append(PageBreak())
    el += metodologia(e)
    el.append(PageBreak())
    el += resumo_executivo(e, p_rosca, p_barras, hist)
    el.append(PageBreak())
    el += fortes_fracos(e)
    el.append(PageBreak())
    el += achados_detalhados(e)
    el.append(PageBreak())
    el += recomendacoes(e)
    el.append(PageBreak())
    el += secao_issues(e)

    doc.build(el)
    print("PDF gerado em:", SAIDA)


if __name__ == "__main__":
    main()
