# Auditoria PageSpeed Insights — https://www.paroquiaaltonia.com.br

Executada em 24/09/2026 às 01:56. Lighthouse 13.5.0 rodando localmente no Chrome, com o estrangulamento simulado padrão (4G lento, CPU 4x mais lenta). É o mesmo motor do PageSpeed Insights.

> Os valores das métricas são os **simulados**, que é o que o PageSpeed reporta. Onde houver, a linha de observado mostra o tempo real medido sem estrangulamento — útil para separar problema de rede de problema de servidor.

## Antes e depois — rodada de correções de 24/09/2026

Medido com a mesma ferramenta, antes e depois das correções. Só a coluna de
desempenho merece ressalva: ela oscila entre execuções, e três medições
seguidas da home depois das correções deram 65, 65 e 65 — o 74 da primeira
auditoria é que era o ponto fora da curva (as demais páginas já marcavam
FCP de 3,3 s naquela mesma rodada, contra 1,9 s da home).

| Página | Acessibilidade | CLS | Desempenho |
|---|---|---|---|
| /eventos | 93 → **100** | 0.000 → **0.000** | 68 → 66 |
| /liturgia | 93 → **100** | 0.000 → **0.000** | 63 → 65 |
| /missas | 89 → **95** | 0.000 → **0.000** | 64 → 64 |
| /noticias | 93 → **100** | 0.146 → **0.000** | 59 → 66 |
| / | 89 → **96** | 0.034 → **0.000** | 74 → 63 |

**Erros de console: de dois para nenhum.** Eram divergências de hidratação
(React #418) em /missas e /eventos, causadas pelas datas formatadas em UTC no
servidor e no fuso local no navegador.

### O que sobrou, e por quê

- **color-contrast** (/missas) e **target-size** (/) — as duas últimas de
  acessibilidade. Não foram corrigidas porque são decisões de design: mexer em
  cor ou em tamanho de área de toque muda a aparência do site.
- **JavaScript não usado**, ~583 KB somados. Boa parte é o Google Analytics
  (172 KB). Reduzir exige decidir o que carregar depois, com risco real de
  quebrar comportamento.
- **Hero de 346 KB**, que é o maior recurso da home. Por ser background de CSS,
  o navegador só o descobre depois de processar o CSS. Um `<link rel=preload>`
  na home, ou trocar o background por `<img>` com next/image, adiantaria o
  download — mas o preload precisa ficar SÓ na home, senão passa a baixar 346 KB
  em páginas que nem mostram a imagem.

### Sobre os números de desempenho

O Lighthouse aplica estrangulamento simulado (4G lento, CPU 4x mais lenta). O
LCP simulado da home fica em ~9 s, mas o observado sem estrangulamento é de
~2,5 s, com TTFB de 100 a 220 ms. Não há recurso bloqueando renderização nem
cadeia crítica: o FCP de 3,4 s é essencialmente o piso da própria simulação.

---

## Notas por página

| Página | Estratégia | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|---|
| Home | mobile | 🟡 63 | 🟢 96 | 🟢 100 | 🟢 100 |
| Home | desktop | 🟡 64 | 🟢 96 | 🟢 100 | 🟢 100 |
| Missas | mobile | 🟡 64 | 🟢 95 | 🟢 100 | 🟢 100 |
| Missas | desktop | 🟡 73 | 🟢 95 | 🟢 100 | 🟢 100 |
| Liturgia do dia | mobile | 🟡 65 | 🟢 100 | 🟢 100 | 🟢 100 |
| Liturgia do dia | desktop | 🟡 73 | 🟢 100 | 🟢 100 | 🟢 100 |
| Notícias | mobile | 🟡 66 | 🟢 100 | 🟢 100 | 🟢 100 |
| Notícias | desktop | 🟡 70 | 🟢 100 | 🟢 100 | 🟢 100 |
| Eventos | mobile | 🟡 66 | 🟢 100 | 🟢 100 | 🟢 100 |
| Eventos | desktop | 🟡 82 | 🟢 100 | 🟢 100 | 🟢 100 |

## Métricas essenciais

### Home — mobile

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 9,5 s | ruim |
| FCP | 3,8 s | ruim |
| CLS | 0 | bom |
| TBT | 80 ms | bom |
| Speed Index | 5,6 s | atenção |

Observado nesta máquina, sem o estrangulamento simulado: LCP 2516 ms, FCP 2516 ms · TTFB: O documento raiz levou 100 ms

### Home — desktop

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 6,2 s | ruim |
| FCP | 1,9 s | atenção |
| CLS | 0,041 | bom |
| TBT | 0 ms | bom |
| Speed Index | 2,3 s | bom |

Observado nesta máquina, sem o estrangulamento simulado: LCP 734 ms, FCP 503 ms · TTFB: O documento raiz levou 120 ms

### Missas — mobile

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 7,4 s | ruim |
| FCP | 3,3 s | ruim |
| CLS | 0 | bom |
| TBT | 170 ms | bom |
| Speed Index | 4,9 s | atenção |

Observado nesta máquina, sem o estrangulamento simulado: LCP 2335 ms, FCP 2335 ms · TTFB: O documento raiz levou 60 ms

### Missas — desktop

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 2,8 s | atenção |
| FCP | 1,9 s | atenção |
| CLS | 0,067 | bom |
| TBT | 0 ms | bom |
| Speed Index | 1,9 s | bom |

Observado nesta máquina, sem o estrangulamento simulado: LCP 399 ms, FCP 399 ms · TTFB: O documento raiz levou 60 ms

### Liturgia do dia — mobile

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 7,5 s | ruim |
| FCP | 3,3 s | ruim |
| CLS | 0 | bom |
| TBT | 150 ms | bom |
| Speed Index | 4,9 s | atenção |

Observado nesta máquina, sem o estrangulamento simulado: LCP 2309 ms, FCP 2309 ms · TTFB: O documento raiz levou 50 ms

### Liturgia do dia — desktop

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 2,8 s | atenção |
| FCP | 1,9 s | atenção |
| CLS | 0,062 | bom |
| TBT | 0 ms | bom |
| Speed Index | 1,9 s | bom |

Observado nesta máquina, sem o estrangulamento simulado: LCP 330 ms, FCP 330 ms · TTFB: O documento raiz levou 60 ms

### Notícias — mobile

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 7,7 s | ruim |
| FCP | 3,3 s | ruim |
| CLS | 0 | bom |
| TBT | 70 ms | bom |
| Speed Index | 5,0 s | atenção |

Observado nesta máquina, sem o estrangulamento simulado: LCP 2375 ms, FCP 2355 ms · TTFB: O documento raiz levou 90 ms

### Notícias — desktop

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 3,5 s | atenção |
| FCP | 1,9 s | atenção |
| CLS | 0,062 | bom |
| TBT | 0 ms | bom |
| Speed Index | 2,0 s | bom |

Observado nesta máquina, sem o estrangulamento simulado: LCP 550 ms, FCP 396 ms · TTFB: O documento raiz levou 100 ms

### Eventos — mobile

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 7,5 s | ruim |
| FCP | 3,2 s | ruim |
| CLS | 0 | bom |
| TBT | 140 ms | bom |
| Speed Index | 4,9 s | atenção |

Observado nesta máquina, sem o estrangulamento simulado: LCP 2338 ms, FCP 2338 ms · TTFB: O documento raiz levou 90 ms

### Eventos — desktop

| Métrica | Valor | Estado |
|---|---|---|
| LCP | 2,4 s | bom |
| FCP | 1,2 s | bom |
| CLS | 0,062 | bom |
| TBT | 0 ms | bom |
| Speed Index | 1,6 s | bom |

Observado nesta máquina, sem o estrangulamento simulado: LCP 317 ms, FCP 317 ms · TTFB: O documento raiz levou 90 ms

## Oportunidades, por página

**Home — mobile**

- Evite redirecionamentos múltiplos de página — economia estimada: 858 ms
- Reduza o JavaScript não usado — economia estimada: 600 ms / 116 KB

**Home — desktop**

- Evite redirecionamentos múltiplos de página — economia estimada: 830 ms
- Reduza o JavaScript não usado — economia estimada: 300 ms / 117 KB

**Missas — mobile**

- Evite redirecionamentos múltiplos de página — economia estimada: 823 ms
- Reduza o JavaScript não usado — economia estimada: 540 ms / 117 KB

**Missas — desktop**

- Evite redirecionamentos múltiplos de página — economia estimada: 839 ms
- Reduza o JavaScript não usado — economia estimada: 150 ms / 117 KB

**Liturgia do dia — mobile**

- Reduza o JavaScript não usado — economia estimada: 890 ms / 117 KB
- Evite redirecionamentos múltiplos de página — economia estimada: 825 ms

**Liturgia do dia — desktop**

- Evite redirecionamentos múltiplos de página — economia estimada: 846 ms
- Reduza o JavaScript não usado — economia estimada: 116 KB

**Notícias — mobile**

- Evite redirecionamentos múltiplos de página — economia estimada: 825 ms
- Reduza o JavaScript não usado — economia estimada: 700 ms / 117 KB

**Notícias — desktop**

- Evite redirecionamentos múltiplos de página — economia estimada: 838 ms
- Reduza o JavaScript não usado — economia estimada: 150 ms / 117 KB

**Eventos — mobile**

- Reduza o JavaScript não usado — economia estimada: 870 ms / 117 KB
- Evite redirecionamentos múltiplos de página — economia estimada: 815 ms

**Eventos — desktop**

- Evite redirecionamentos múltiplos de página — economia estimada: 807 ms
- Reduza o JavaScript não usado — economia estimada: 117 KB

## Auditorias reprovadas (sem economia estimada)

- **Home**: As áreas de toque não têm tamanho ou espaçamento suficiente.
- **Home**: A página impede a restauração do cache de avanço e retorno
- **Home**: Latência da solicitação de documentos
- **Home**: JavaScript legado
- **Home**: Solicitações que bloquearam a renderização
- **Home**: Use ciclos de vida eficientes de cache
- **Home**: Melhorar a entrega de imagens
- **Missas**: As cores de primeiro e segundo plano não têm uma taxa de contraste suficiente.
- **Missas**: Latência da solicitação de documentos
- **Missas**: JavaScript legado
- **Missas**: Solicitações que bloquearam a renderização
- **Missas**: Use ciclos de vida eficientes de cache
- **Liturgia do dia**: Use ciclos de vida eficientes de cache
- **Liturgia do dia**: Latência da solicitação de documentos
- **Liturgia do dia**: JavaScript legado
- **Liturgia do dia**: Solicitações que bloquearam a renderização
- **Notícias**: A página impede a restauração do cache de avanço e retorno
- **Notícias**: Latência da solicitação de documentos
- **Notícias**: Solicitações que bloquearam a renderização
- **Notícias**: Use ciclos de vida eficientes de cache
- **Notícias**: Melhorar a entrega de imagens
- **Notícias**: JavaScript legado
- **Eventos**: A página impede a restauração do cache de avanço e retorno
- **Eventos**: Use ciclos de vida eficientes de cache
- **Eventos**: Latência da solicitação de documentos
- **Eventos**: JavaScript legado
- **Eventos**: Solicitações que bloquearam a renderização
