"use client"

import { useState, useEffect } from "react"
import { Calendar, Book, RefreshCw, Heart, Palette } from "lucide-react"
import ExplicacaoLeitura from "@/components/explicacao-leitura"

interface Leitura {
  referencia: string
  titulo: string
  texto: string
  tipo?: string
}

interface Salmo {
  referencia: string
  refrao: string
  texto: string
}

interface OracaoExtra {
  titulo: string
  texto: string
}

interface LiturgiaData {
  data: string
  liturgia: string
  cor: string
  oracoes: {
    coleta: string
    oferendas: string
    comunhao: string
    extras: OracaoExtra[]
  }
  leituras: {
    primeiraLeitura: Leitura[]
    salmo: Salmo[]
    segundaLeitura: Leitura[]
    evangelho: Leitura[]
    extras: Leitura[]
  }
  antifonas: {
    entrada: string
    comunhao: string
  }
}

export default function LiturgiaContent() {
  const [liturgia, setLiturgia] = useState<LiturgiaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiturgia = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("https://liturgia.up.railway.app/v2/")

      if (!response.ok) {
        throw new Error(`Erro ao carregar liturgia: ${response.status}`)
      }

      const data = await response.json()
      setLiturgia(data)
    } catch (err: any) {
      console.error("Erro ao carregar liturgia:", err)
      setError(err.message || "Não foi possível carregar a liturgia")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiturgia()
  }, [])

  const formatarData = (dataString: string) => {
    try {
      const [dia, mes, ano] = dataString.split("/")
      const data = new Date(Number.parseInt(ano), Number.parseInt(mes) - 1, Number.parseInt(dia))
      return data.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return dataString
    }
  }

  const formatarTextoComSobrescrito = (texto: string) => {
    // Converte TODOS os números para sobrescrito
    const textoFormatado = texto.replace(/\d+/g, (numero) => {
      return numero
        .split("")
        .map((digit) => {
          const sobrescritos: { [key: string]: string } = {
            "0": "⁰",
            "1": "¹",
            "2": "²",
            "3": "³",
            "4": "⁴",
            "5": "⁵",
            "6": "⁶",
            "7": "⁷",
            "8": "⁸",
            "9": "⁹",
          }
          return sobrescritos[digit] || digit
        })
        .join("")
    })

    return textoFormatado.replace(/\n/g, "<br>").replace(/— /g, "<br><strong>— ").replace(/ —/g, " —</strong>")
  }

  const getCorColor = (cor: string) => {
    const colors: { [key: string]: string } = {
      Branco: "border-white/30",
      Vermelho: "border-red-400/50",
      Verde: "border-green-400/50",
      Roxo: "border-purple-400/50",
      Rosa: "border-pink-400/50",
    }
    return colors[cor] || "border-yellow-500/30"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0c2657] p-6 rounded-lg">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="animate-spin text-yellow-500 mr-2" size={24} />
            <span className="text-white">Carregando liturgia...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-6 rounded-lg text-center">
        <h2 className="text-xl text-red-400 mb-4">Erro ao carregar liturgia</h2>
        <p className="text-white mb-4">{error}</p>
        <button
          onClick={fetchLiturgia}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!liturgia) {
    return (
      <div className="bg-[#0c2657] p-6 rounded-lg text-center">
        <h2 className="text-xl text-white mb-4">Liturgia não disponível</h2>
        <p className="text-gray-300">Não foi possível carregar a liturgia do dia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da liturgia */}
      <div className={`bg-[#0c2657] p-6 rounded-lg border-2 ${getCorColor(liturgia.cor)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-yellow-500">
            <Calendar className="mr-2" size={20} />
            <span className="capitalize">{formatarData(liturgia.data)}</span>
          </div>
          <button
            onClick={fetchLiturgia}
            disabled={loading}
            className="bg-yellow-500 text-[#4d3600] px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`inline mr-1 ${loading ? "animate-spin" : ""}`} size={14} />
            Atualizar
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{liturgia.liturgia}</h2>

        <div className="flex items-center">
          <Palette className="mr-2 text-yellow-500" size={16} />
          <span className="text-gray-300 mr-2">Cor litúrgica:</span>
          <span className="text-yellow-500 font-medium">{liturgia.cor}</span>
        </div>
      </div>

      {/* Antífonas */}
      {(liturgia.antifonas.entrada || liturgia.antifonas.comunhao) && (
        <div className="bg-[#0c2657] p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Heart className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Antífonas</h3>
          </div>

          {liturgia.antifonas.entrada && (
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Entrada:</h4>
              <div
                className="text-gray-300 italic leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(liturgia.antifonas.entrada) }}
              />
            </div>
          )}

          {liturgia.antifonas.comunhao && (
            <div>
              <h4 className="text-white font-medium mb-2">Comunhão:</h4>
              <div
                className="text-gray-300 italic leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(liturgia.antifonas.comunhao) }}
              />
            </div>
          )}
        </div>
      )}

      {/* Primeira Leitura */}
      {liturgia.leituras.primeiraLeitura.map((leitura, index) => (
        <div key={index} className="bg-[#0c2657] p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Book className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Primeira Leitura</h3>
          </div>

          <p className="text-yellow-500 font-medium mb-2">{leitura.referencia}</p>
          <p className="text-white font-medium mb-4">{leitura.titulo}</p>

          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(leitura.texto) }}
          />
          <ExplicacaoLeitura
            tipo="Primeira Leitura"
            referencia={leitura.referencia}
            titulo={leitura.titulo}
            texto={leitura.texto}
          />
        </div>
      ))}

      {/* Salmos */}
      {liturgia.leituras.salmo.map((salmo, index) => (
        <div key={index} className="bg-[#0c2657] p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Book className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Salmo Responsorial</h3>
          </div>

          <p className="text-yellow-500 font-medium mb-2">{salmo.referencia}</p>

          {salmo.refrao && (
            <div className="bg-yellow-500/10 p-3 rounded mb-4">
              <p className="text-yellow-500 font-medium text-sm mb-1">Refrão:</p>
              <p className="text-white font-medium">{salmo.refrao}</p>
            </div>
          )}

          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(salmo.texto) }}
          />
        </div>
      ))}

      {/* Segunda Leitura */}
      {liturgia.leituras.segundaLeitura.map((leitura, index) => (
        <div key={index} className="bg-[#0c2657] p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Book className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Segunda Leitura</h3>
          </div>

          <p className="text-yellow-500 font-medium mb-2">{leitura.referencia}</p>
          <p className="text-white font-medium mb-4">{leitura.titulo}</p>

          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(leitura.texto) }}
          />
          <ExplicacaoLeitura
            tipo="Segunda Leitura"
            referencia={leitura.referencia}
            titulo={leitura.titulo}
            texto={leitura.texto}
          />
        </div>
      ))}

      {/* Leituras Extras */}
      {liturgia.leituras.extras.map((leitura, index) => (
        <div key={index} className="bg-[#0c2657] p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Book className="mr-2" size={20} />
            <h3 className="text-lg font-bold">{leitura.tipo || "Leitura Adicional"}</h3>
          </div>

          <p className="text-yellow-500 font-medium mb-2">{leitura.referencia}</p>
          <p className="text-white font-medium mb-4">{leitura.titulo}</p>

          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(leitura.texto) }}
          />
          <ExplicacaoLeitura
            tipo={leitura.tipo || "Leitura Adicional"}
            referencia={leitura.referencia}
            titulo={leitura.titulo}
            texto={leitura.texto}
          />
        </div>
      ))}

      {/* Evangelho */}
      {liturgia.leituras.evangelho.map((evangelho, index) => (
        <div key={index} className="bg-[#0c2657] p-6 rounded-lg border-2 border-yellow-500/30">
          <div className="flex items-center mb-4 text-yellow-500">
            <Book className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Evangelho</h3>
          </div>

          <p className="text-yellow-500 font-medium mb-2">{evangelho.referencia}</p>
          <p className="text-white font-medium mb-4">{evangelho.titulo}</p>

          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(evangelho.texto) }}
          />
          <ExplicacaoLeitura
            tipo="Evangelho"
            referencia={evangelho.referencia}
            titulo={evangelho.titulo}
            texto={evangelho.texto}
          />
        </div>
      ))}

      {/* Orações */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Heart className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Orações</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-2">Oração da Coleta:</h4>
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(liturgia.oracoes.coleta) }}
            />
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Oração sobre as Oferendas:</h4>
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(liturgia.oracoes.oferendas) }}
            />
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Oração da Comunhão:</h4>
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(liturgia.oracoes.comunhao) }}
            />
          </div>

          {/* Orações Extras */}
          {liturgia.oracoes.extras.map((oracao, index) => (
            <div key={index}>
              <h4 className="text-white font-medium mb-2">{oracao.titulo}:</h4>
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatarTextoComSobrescrito(oracao.texto) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
