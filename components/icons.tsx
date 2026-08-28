import type { SVGProps } from "react"

// Ícones customizados usados em mais de uma superfície de navegação
// (quick-links.tsx, side-menu.tsx) — centralizados aqui pra garantir que o
// mesmo destino sempre tenha o mesmo ícone, não importa por qual caminho a
// pessoa chega até ele. Aceitam `size` como os ícones do lucide-react (que
// não é um atributo SVG nativo — precisa ser aplicado manualmente a
// width/height) pra funcionar como substituto direto deles nos dois
// contextos de uso (className="h-7 w-7" e size={20}).
type IconProps = SVGProps<SVGSVGElement> & { size?: number | string }

export function PrayingHandsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4c.5 0 1 .2 1.3.5.4.3.7.8.7 1.5 0 .8-.3 1.6-1 2.5-.7.8-1 1.7-1 2.5M12 4c-.5 0-1 .2-1.3.5-.4.3-.7.8-.7 1.5 0 .8.3 1.6 1 2.5.7.8 1 1.7 1 2.5" />
      <path d="M17 18.5a9 9 0 0 0-10 0" />
      <path d="M12 11v4" />
      <path d="M10 13h4" />
    </svg>
  )
}

export function HeartIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}
