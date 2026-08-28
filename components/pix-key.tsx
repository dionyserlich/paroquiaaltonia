"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

// Copiar uma chave PIX alfanumérica longa manualmente no celular é fricção
// desnecessária — botão de copiar ao lado do texto, mesmo estilo dos botões
// já usados no site.
export default function PixKey({ chave }: { chave: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar chave PIX:", err)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <p className="text-gray-300 text-lg font-mono break-all">{chave}</p>
      <button
        onClick={copiar}
        className="shrink-0 flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-parish-accent-text text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
      >
        {copiado ? (
          <>
            <Check className="h-4 w-4" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copiar
          </>
        )}
      </button>
    </div>
  )
}
