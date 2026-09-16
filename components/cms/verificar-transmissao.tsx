"use client"

import { useState } from "react"
import { Button, useForm } from "@payloadcms/ui"

type Resposta =
  | { encontrada: true; titulo: string; linkEmbed: string; videoId: string }
  | { encontrada: false }
  | { error: string }

// Botão ao lado do campo de link, no formulário de Missas: consulta o canal
// no YouTube e preenche título e link da transmissão que está no ar agora.
//
// É conveniência de preenchimento, não automação: o que vale é o que a
// pessoa confere e salva. Por isso ele nunca salva sozinho — só preenche os
// campos e deixa a decisão com quem está cadastrando.
export function VerificarTransmissao() {
  const { setModified, getFields, dispatchFields } = useForm()
  const [estado, setEstado] = useState<"parado" | "buscando">("parado")
  const [aviso, setAviso] = useState<string | null>(null)

  async function verificar() {
    setEstado("buscando")
    setAviso(null)
    try {
      const res = await fetch("/api/admin/transmissao-ao-vivo", { credentials: "include" })
      const dados: Resposta = await res.json()

      if ("error" in dados) {
        setAviso("Não foi possível consultar o YouTube agora.")
        return
      }
      if (!dados.encontrada) {
        setAviso("Nenhuma transmissão ao vivo no canal neste momento.")
        return
      }

      dispatchFields({ type: "UPDATE", path: "linkEmbed", value: dados.linkEmbed })
      // Só preenche o título se estiver vazio, pra não sobrescrever um nome
      // que a pessoa já tenha escrito à mão.
      const tituloAtual = getFields()?.titulo?.value
      if (!tituloAtual) {
        dispatchFields({ type: "UPDATE", path: "titulo", value: dados.titulo })
      }
      setModified(true)
      setAviso(`Encontrada: ${dados.titulo}`)
    } catch {
      setAviso("Não foi possível consultar o YouTube agora.")
    } finally {
      setEstado("parado")
    }
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <Button buttonStyle="secondary" onClick={verificar} disabled={estado === "buscando"}>
        {estado === "buscando" ? "Procurando…" : "Verificar transmissão agora"}
      </Button>
      <p style={{ marginTop: ".5rem", fontSize: ".85rem", opacity: 0.75 }}>
        {aviso ?? "Busca a transmissão que está no ar no canal e preenche o link abaixo."}
      </p>
    </div>
  )
}
