#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auditoria de performance com Lighthouse — o mesmo motor que o PageSpeed
Insights usa.

Roda LOCALMENTE, via `npx lighthouse` no Chrome instalado, contra o site
publicado. A primeira versão deste script chamava a API do PageSpeed, mas ela
devolve 429 (Too Many Requests) sem chave depois de poucas chamadas, e dez
combinações de página × estratégia estouram a cota na hora. Localmente não há
cota, e o resultado é o mesmo relatório do Lighthouse.

O que se perde rodando local: os dados de CAMPO (CrUX, usuários reais), que só
a API do PageSpeed entrega. Para este site eles provavelmente nem existem, por
falta de volume de tráfego.

Importante ao ler os números: o Lighthouse aplica estrangulamento SIMULADO
(4G lento, CPU 4x mais lenta) sobre uma medição real. Então cada métrica tem
duas faces — o valor observado nesta máquina e o valor simulado, que é o
reportado. O simulado é o que se compara com o PageSpeed; o observado ajuda a
separar problema de rede de problema de servidor.

Uso (a partir da raiz do projeto):
    python3 docs/pagespeed/auditar.py
    python3 docs/pagespeed/auditar.py --so-celular

Cada execução leva de 30 a 60 segundos, então a auditoria completa demora
alguns minutos.
"""
import argparse
import json
import os
import sys
import time
import subprocess
import tempfile
from datetime import datetime

BASE = "https://www.paroquiaaltonia.com.br"

# As páginas que importam: a home, as três mais buscadas e uma de conteúdo
# dinâmico, que é onde o custo de renderização aparece.
PAGINAS = [
    ("/", "Home"),
    ("/missas", "Missas"),
    ("/liturgia", "Liturgia do dia"),
    ("/noticias", "Notícias"),
    ("/eventos", "Eventos"),
]

CATEGORIAS = ["performance", "accessibility", "best-practices", "seo"]
NOME_CATEGORIA = {
    "performance": "Desempenho",
    "accessibility": "Acessibilidade",
    "best-practices": "Boas práticas",
    "seo": "SEO",
}

# Métricas de laboratório, com os limites que o próprio Lighthouse usa para
# classificar. (bom, precisa melhorar) — acima do segundo é ruim.
METRICAS = [
    ("largest-contentful-paint", "LCP", 2500, 4000, "ms"),
    ("first-contentful-paint", "FCP", 1800, 3000, "ms"),
    ("cumulative-layout-shift", "CLS", 0.1, 0.25, ""),
    ("total-blocking-time", "TBT", 200, 600, "ms"),
    ("speed-index", "Speed Index", 3400, 5800, "ms"),
]

def consultar(url, estrategia):
    """Roda o Lighthouse e devolve o JSON, no mesmo formato que a API do
    PageSpeed embrulha em `lighthouseResult` — daí o envelope abaixo, que
    mantém o resto do script igual."""
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        caminho = tmp.name
    try:
        comando = [
            "npx", "--yes", "lighthouse@latest", url,
            "--output=json", f"--output-path={caminho}",
            "--chrome-flags=--headless=new --no-sandbox",
            "--quiet", "--locale=pt-BR",
            f"--form-factor={'mobile' if estrategia == 'mobile' else 'desktop'}",
        ]
        comando += [f"--only-categories={','.join(CATEGORIAS)}"]
        if estrategia == "mobile":
            comando.append("--screenEmulation.mobile")
        else:
            comando.append("--screenEmulation.disabled")
            comando.append("--throttling.cpuSlowdownMultiplier=1")

        proc = subprocess.run(comando, capture_output=True, text=True, timeout=300)
        if proc.returncode != 0 and not os.path.getsize(caminho):
            raise RuntimeError((proc.stderr or proc.stdout)[-300:])
        with open(caminho, encoding="utf-8") as f:
            return {"lighthouseResult": json.load(f)}
    finally:
        if os.path.exists(caminho):
            os.unlink(caminho)


def classificar(valor, bom, ruim):
    if valor is None:
        return "—"
    return "bom" if valor <= bom else ("atenção" if valor <= ruim else "ruim")


def extrair(dados):
    lh = dados["lighthouseResult"]
    auditorias = lh["audits"]

    notas = {}
    for chave, cat in lh.get("categories", {}).items():
        nota = cat.get("score")
        notas[chave] = round(nota * 100) if nota is not None else None

    metricas = []
    for id_, rotulo, bom, ruim, unidade in METRICAS:
        a = auditorias.get(id_, {})
        bruto = a.get("numericValue")
        metricas.append({
            "rotulo": rotulo,
            "exibicao": a.get("displayValue", "—"),
            "bruto": bruto,
            "estado": classificar(bruto, bom, ruim),
        })

    # Oportunidades: auditorias que falharam e trazem economia estimada.
    oportunidades = []
    for id_, a in auditorias.items():
        detalhes = a.get("details") or {}
        economia = detalhes.get("overallSavingsMs") or 0
        bytes_ = detalhes.get("overallSavingsBytes") or 0
        nota = a.get("score")
        if nota is not None and nota < 0.9 and (economia > 0 or bytes_ > 0):
            oportunidades.append({
                "titulo": a.get("title", id_),
                "ms": round(economia),
                "kb": round(bytes_ / 1024),
            })
    oportunidades.sort(key=lambda o: (-o["ms"], -o["kb"]))

    # Diagnósticos reprovados sem economia estimada (acessibilidade, SEO etc.)
    reprovados = []
    for id_, a in auditorias.items():
        nota = a.get("score")
        if nota is not None and nota < 1 and a.get("scoreDisplayMode") in ("binary", "metricSavings"):
            if not any(o["titulo"] == a.get("title") for o in oportunidades):
                reprovados.append({"id": id_, "titulo": a.get("title", id_), "nota": nota})

    # Dados de campo só existem na API do PageSpeed; localmente não vêm.
    campo = None
    if "loadingExperience" in dados:
        metricas_campo = dados["loadingExperience"].get("metrics", {})
        if metricas_campo:
            campo = {k: v.get("category") for k, v in metricas_campo.items()}

    # O par observado/simulado: o segundo é o reportado, o primeiro ajuda a
    # distinguir rede lenta simulada de lentidão de verdade.
    observado = {}
    itens = (auditorias.get("metrics", {}).get("details") or {}).get("items") or [{}]
    for chave, rotulo in (("observedLargestContentfulPaint", "LCP"),
                          ("observedFirstContentfulPaint", "FCP")):
        if itens[0].get(chave) is not None:
            observado[rotulo] = itens[0][chave]

    return {
        "notas": notas,
        "metricas": metricas,
        "oportunidades": oportunidades[:8],
        "reprovados": sorted(reprovados, key=lambda r: r["nota"])[:10],
        "campo": campo,
        "observado": observado,
        "ttfb": auditorias.get("server-response-time", {}).get("displayValue"),
        "versao": lh.get("lighthouseVersion"),
    }


def barra(nota):
    if nota is None:
        return "—"
    marca = "🟢" if nota >= 90 else ("🟡" if nota >= 50 else "🔴")
    return f"{marca} {nota}"


def montar_markdown(resultados, estrategias):
    agora = datetime.now().strftime("%d/%m/%Y às %H:%M")
    L = [f"# Auditoria PageSpeed Insights — {BASE}", "",
         f"Executada em {agora}. Lighthouse {resultados[next(iter(resultados))]['versao']} "
         "rodando localmente no Chrome, com o estrangulamento simulado padrão "
         "(4G lento, CPU 4x mais lenta). É o mesmo motor do PageSpeed Insights.", "",
         "> Os valores das métricas são os **simulados**, que é o que o PageSpeed "
         "reporta. Onde houver, a linha de observado mostra o tempo real medido "
         "sem estrangulamento — útil para separar problema de rede de problema "
         "de servidor.", ""]

    L += ["## Notas por página", ""]
    cabecalho = "| Página | Estratégia | " + " | ".join(NOME_CATEGORIA[c] for c in CATEGORIAS) + " |"
    L += [cabecalho, "|" + "---|" * (len(CATEGORIAS) + 2)]
    for caminho, nome in PAGINAS:
        for estrategia in estrategias:
            r = resultados.get((caminho, estrategia))
            if not r:
                L.append(f"| {nome} | {estrategia} | falhou | | | |")
                continue
            notas = [barra(r["notas"].get(c.replace("best-practices", "best-practices"))) for c in CATEGORIAS]
            L.append(f"| {nome} | {estrategia} | " + " | ".join(notas) + " |")
    L.append("")

    L += ["## Métricas essenciais", ""]
    for caminho, nome in PAGINAS:
        for estrategia in estrategias:
            r = resultados.get((caminho, estrategia))
            if not r:
                continue
            L += [f"### {nome} — {estrategia}", ""]
            L += ["| Métrica | Valor | Estado |", "|---|---|---|"]
            for m in r["metricas"]:
                L.append(f"| {m['rotulo']} | {m['exibicao']} | {m['estado']} |")
            if r.get("observado"):
                L += ["", "Observado nesta máquina, sem o estrangulamento simulado: "
                      + ", ".join(f"{k} {round(v)} ms" for k, v in r["observado"].items())
                      + (f" · TTFB: {r['ttfb']}" if r.get("ttfb") else "")]
            if r["campo"]:
                L += ["", "Dados de campo (usuários reais): "
                          + ", ".join(f"{k} {v}" for k, v in r["campo"].items())]
            L.append("")

    L += ["## Oportunidades, por página", ""]
    for caminho, nome in PAGINAS:
        for estrategia in estrategias:
            r = resultados.get((caminho, estrategia))
            if not r or not r["oportunidades"]:
                continue
            L += [f"**{nome} — {estrategia}**", ""]
            for o in r["oportunidades"]:
                ganho = []
                if o["ms"]:
                    ganho.append(f"{o['ms']} ms")
                if o["kb"]:
                    ganho.append(f"{o['kb']} KB")
                L.append(f"- {o['titulo']} — economia estimada: {' / '.join(ganho)}")
            L.append("")

    L += ["## Auditorias reprovadas (sem economia estimada)", ""]
    vistos = set()
    for caminho, nome in PAGINAS:
        for estrategia in estrategias:
            r = resultados.get((caminho, estrategia))
            if not r:
                continue
            for d in r["reprovados"]:
                chave = (nome, d["titulo"])
                if chave in vistos:
                    continue
                vistos.add(chave)
                L.append(f"- **{nome}**: {d['titulo']}")
    L.append("")
    return "\n".join(L)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--so-celular", action="store_true", help="pula a estratégia desktop")
    p.add_argument("--saida", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "relatorio.md"))
    args = p.parse_args()

    estrategias = ["mobile"] if args.so_celular else ["mobile", "desktop"]
    resultados = {}
    brutos = {}

    total = len(PAGINAS) * len(estrategias)
    feito = 0
    for caminho, nome in PAGINAS:
        for estrategia in estrategias:
            feito += 1
            print(f"[{feito}/{total}] {nome} ({estrategia})…", flush=True)
            try:
                dados = consultar(BASE + caminho, estrategia)
                resultados[(caminho, estrategia)] = extrair(dados)
                brutos[f"{caminho}|{estrategia}"] = dados
                notas = resultados[(caminho, estrategia)]["notas"]
                print(f"    desempenho {notas.get('performance')} · "
                      f"acessibilidade {notas.get('accessibility')} · "
                      f"boas práticas {notas.get('best-practices')} · seo {notas.get('seo')}", flush=True)
            except Exception as erro:  # noqa: BLE001
                print(f"    FALHOU: {erro}", flush=True)

    if not resultados:
        print("Nenhuma página auditada com sucesso.", file=sys.stderr)
        return 1

    with open(args.saida, "w", encoding="utf-8") as f:
        f.write(montar_markdown(resultados, estrategias))
    bruto = os.path.join(os.path.dirname(args.saida), "resultado-bruto.json")
    with open(bruto, "w", encoding="utf-8") as f:
        json.dump(brutos, f, ensure_ascii=False)

    print("\nRelatório:", args.saida)
    print("JSON bruto:", bruto)
    return 0


if __name__ == "__main__":
    sys.exit(main())
