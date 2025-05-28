"use client"

import { Users, Heart, Shield, MessageCircle, Plus, Church } from "lucide-react"

export default function PastoraisContent() {
  const pastorais = [
    {
      nome: "Pastoral da Comunicação",
      icon: <MessageCircle className="w-8 h-8" />,
      descricao:
        "Responsável pela comunicação interna e externa da paróquia, redes sociais, boletins e divulgação de eventos.",
      atividades: ["Redes sociais", "Boletim paroquial", "Site da paróquia", "Comunicados"],
      cor: "border-blue-500",
      bgColor: "from-blue-500/20 to-blue-600/20",
    },
    {
      nome: "Pastoral da Família",
      icon: <Heart className="w-8 h-8" />,
      descricao:
        "Acompanha e orienta as famílias da comunidade, promovendo valores cristãos e fortalecendo os laços familiares.",
      atividades: ["Preparação matrimonial", "Encontros familiares", "Orientação conjugal", "Batismo"],
      cor: "border-pink-500",
      bgColor: "from-pink-500/20 to-pink-600/20",
    },
    {
      nome: "Pastoral da Sobriedade",
      icon: <Shield className="w-8 h-8" />,
      descricao:
        "Trabalha na prevenção e recuperação de dependências químicas, oferecendo apoio espiritual e emocional.",
      atividades: ["Grupos de apoio", "Palestras preventivas", "Acompanhamento familiar", "Oração"],
      cor: "border-green-500",
      bgColor: "from-green-500/20 to-green-600/20",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0c2657] to-[#1a3a7a] text-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
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
          {pastorais.map((pastoral, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${pastoral.bgColor} backdrop-blur-sm rounded-lg p-6 border-l-4 ${pastoral.cor} hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-yellow-500 mt-1">{pastoral.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{pastoral.nome}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{pastoral.descricao}</p>

                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-yellow-500">Principais Atividades:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {pastoral.atividades.map((atividade, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-300">{atividade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
              Cada pastoral é uma oportunidade de servir a Deus e à comunidade. Descubra onde seus dons podem ser melhor
              utilizados.
            </p>
            <div className="flex justify-center space-x-4">
              <Users className="w-6 h-6 text-yellow-500" />
              <Heart className="w-6 h-6 text-yellow-500" />
              <Church className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
