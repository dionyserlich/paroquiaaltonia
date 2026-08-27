import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      // Script de ETL de uso único (já rodou, migração concluída) — não faz
      // parte do app em produção.
      "scripts/migrate-to-payload.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Regras novas de "React Compiler readiness" (eslint-plugin-react-hooks
      // v6, vindas do preset core-web-vitals do Next 16). Boa parte dos casos
      // que elas pegam aqui são padrões legítimos e SSR-safe — ex.: setState
      // num efeito só pra ler window.scrollY/innerWidth depois de montar
      // (ler window durante o render quebraria no servidor), ou Date.now()
      // num Server Component filtrando por data atual. "Corrigir" essas
      // ocorrências de forma mecânica arriscaria introduzir bug de hidratação.
      // Mantidas como warning — não bloqueiam o build, mas continuam visíveis
      // pra revisão caso a caso.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
    },
  },
]

export default eslintConfig
