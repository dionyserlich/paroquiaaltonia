import { Users, Heart, Shield, MessageCircle, Plus, Church, type LucideIcon } from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  "message-circle": MessageCircle,
  heart: Heart,
  shield: Shield,
  users: Users,
  church: Church,
}

const TEMAS: Record<string, { cor: string; bgColor: string }> = {
  blue: { cor: "border-blue-500", bgColor: "from-blue-500/20 to-blue-600/20" },
  pink: { cor: "border-pink-500", bgColor: "from-pink-500/20 to-pink-600/20" },
  green: { cor: "border-green-500", bgColor: "from-green-500/20 to-green-600/20" },
  yellow: { cor: "border-yellow-500", bgColor: "from-yellow-500/20 to-yellow-600/20" },
  purple: { cor: "border-purple-500", bgColor: "from-purple-500/20 to-purple-600/20" },
}

export type Pastoral = {
  id: number
  nome: string
  descricao: string
  atividades?: { atividade: string }[] | null
  icone: string
  tema: string
}

export default function PastoraisContent({ pastorais }: { pastorais: Pastoral[] }) {
  return (
    <div className="container mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500 p-4 rounded-full">
            <Church className="w-8 h-8 text-[#0c2657]" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Pastorais</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Conheça os grupos pastorais que atuam em nossa comunidade, cada um com sua missão específica de
          evangelização e serviço
        </p>
      </div>

      {/* Lista de Pastorais */}
      <div className="space-y-6">
        {pastorais.map((pastoral) => {
          const Icon = ICONS[pastoral.icone] || Church
          const tema = TEMAS[pastoral.tema] || TEMAS.blue
          return (
            <div
              key={pastoral.id}
              className={`bg-gradient-to-r ${tema.bgColor} backdrop-blur-sm rounded-lg p-6 border-l-4 ${tema.cor} hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-yellow-500 mt-1">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{pastoral.nome}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{pastoral.descricao}</p>

                  {pastoral.atividades && pastoral.atividades.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-yellow-500">Principais Atividades:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pastoral.atividades.map((a, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-gray-300">{a.atividade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Seção para Novas Pastorais */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500 p-3 rounded-full">
            <Plus className="w-6 h-6 text-[#0c2657]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Mais Pastorais em Breve</h2>
        <p className="text-gray-300 mb-6">
          Nossa comunidade está sempre crescendo e novas pastorais estão sendo organizadas para atender melhor às
          necessidades da nossa paróquia.
        </p>
        <div className="bg-[#0c2657]/50 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            <strong>Quer participar?</strong> Entre em contato conosco para saber como se envolver nas atividades
            pastorais.
          </p>
        </div>
      </div>

      {/* Como Participar */}
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-yellow-500">Como Participar</h3>
        <div className="space-y-3 text-gray-300">
          <p>• Procure a secretaria paroquial para mais informações</p>
          <p>• Participe das reuniões e encontros de formação</p>
          <p>• Contribua com seus talentos e disponibilidade</p>
          <p>• Mantenha-se em oração e comunhão com a comunidade</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] border border-yellow-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">Venha Fazer Parte!</h3>
          <p className="text-gray-300 mb-4">
            Cada pastoral é uma oportunidade de servir a Deus e à comunidade. Descubra onde seus dons podem ser
            melhor utilizados.
          </p>
          <div className="flex justify-center space-x-4">
            <Users className="w-6 h-6 text-yellow-500" />
            <Heart className="w-6 h-6 text-yellow-500" />
            <Church className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
