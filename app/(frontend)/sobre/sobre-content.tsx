import Image from "next/image"
import { Church, Globe, Users, Calendar, Heart, Crown } from "lucide-react"

// Ícone e cor de cada item da timeline ficam fixos aqui, por posição —
// só o texto vem do CMS (ver globals/Sobre.ts).
const TIMELINE_STYLE = [
  { icon: Globe, cor: "border-yellow-500", bgIcone: "bg-yellow-500" },
  { icon: Users, cor: "border-blue-400", bgIcone: "bg-blue-400" },
  { icon: Calendar, cor: "border-green-400", bgIcone: "bg-green-400" },
  { icon: Heart, cor: "border-purple-400", bgIcone: "bg-purple-400" },
]

type Props = {
  introducao?: string | null
  timeline: { titulo: string; badge: string; texto: string }[]
  legado?: string | null
  whatsapp?: string | null
}

export default function SobreContent({ introducao, timeline, legado, whatsapp }: Props) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre a paróquia.")}`
    : "/horarios"

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-yellow-500 p-4 rounded-full">
            <Church className="w-8 h-8 text-[#0c2657]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Sobre a Paróquia</h1>
        {introducao && <p className="text-gray-300 text-lg leading-relaxed">{introducao}</p>}
      </div>

      {/* Galeria Histórica */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Nossa Evolução</h2>
          <p className="text-gray-300">Veja como nossa paróquia cresceu ao longo dos anos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border border-yellow-500">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="/images/igreja-antiga.jpg"
                  alt="Igreja antiga da Paróquia São Sebastião - Primeiros anos da comunidade"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-yellow-500 text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold">
                    Anos 1970-1980
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Igreja Antiga</h3>
                <p className="text-gray-300 text-sm">
                  A primeira construção da paróquia, que serviu fielmente à comunidade durante os primeiros anos de
                  evangelização e crescimento espiritual.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border border-yellow-500">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="/images/igreja-atual.jpg"
                  alt="Igreja atual da Paróquia São Sebastião - Arquitetura moderna"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-green-400 text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold">
                    Atual
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Igreja Atual</h3>
                <p className="text-gray-300 text-sm">
                  Nossa moderna igreja matriz, que reflete o crescimento e a vitalidade da comunidade paroquial nos
                  dias de hoje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Histórica */}
      <div className="space-y-6">
        {timeline.map((item, index) => {
          const style = TIMELINE_STYLE[index % TIMELINE_STYLE.length]
          const Icon = style.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border-l-4 ${style.cor}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`${style.bgIcone} p-2 rounded-full flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-[#0c2657]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <h2 className="text-xl font-bold text-white">{item.titulo}</h2>
                    <span className={`${style.bgIcone} text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{item.texto}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Um legado que continua */}
      {legado && (
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg text-[#0c2657]">
          <div className="flex items-start space-x-4">
            <div className="bg-[#0c2657] p-2 rounded-full flex-shrink-0">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">Um legado que continua</h2>
              <p className="leading-relaxed">{legado}</p>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border border-yellow-500">
        <h3 className="text-lg font-semibold text-white mb-2">Participe da nossa comunidade</h3>
        <p className="text-gray-300 mb-4">
          Para mais informações ou para participar das atividades paroquiais, entre em contato pelos meios
          disponíveis ou visite a igreja matriz.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/horarios"
            className="bg-yellow-500 text-[#0c2657] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Ver Horários
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors"
          >
            Falar Conosco
          </a>
        </div>
      </div>
    </div>
  )
}
