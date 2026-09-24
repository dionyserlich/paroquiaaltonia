# Auditoria de segurança

Relatório: [`relatorio-auditoria-seguranca.pdf`](relatorio-auditoria-seguranca.pdf) — 20 páginas, pt-BR.

## Arquivos

| Arquivo | O que é |
|---|---|
| `relatorio-auditoria-seguranca.pdf` | O relatório final |
| `dados_auditoria.py` | Os achados em si (arquivo, linha, trecho, impacto, correção, critérios de aceite) |
| `gerar_relatorio.py` | Diagramação e geração do PDF |

Os dois ficam separados de propósito: dá para corrigir um achado, marcar outro
como resolvido ou acrescentar um novo mexendo só em `dados_auditoria.py`, sem
tocar na diagramação.

## Como regerar

```sh
python3 -m venv docs/security-audit/.venv
docs/security-audit/.venv/bin/pip install reportlab matplotlib pymupdf
docs/security-audit/.venv/bin/python docs/security-audit/gerar_relatorio.py
```

O `pymupdf` não é necessário para gerar — serve para conferir o resultado
(contagem de páginas, vazamento de margem, rasterização das páginas).
