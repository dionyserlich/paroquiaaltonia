"use client"

import { Heart, Calendar, Users, Cross, Gift, Plus } from "lucide-react"

export default function IntencoesContent() {
  const tiposIntencoes = [
    {
      tipo: "Aniversário e Nascimento",
      icon: <Gift className="w-6 h-6" />,
      descricao: "Celebre datas especiais com uma missa de ação de graças",
      cor: "border-yellow-500",
    },
    {
      tipo: "Aniversário de Casamento",
      icon: <Heart className="w-6 h-6" />,
      descricao: "Renovação de votos e bênçãos matrimoniais",
      cor: "border-pink-500",
    },
    {
      tipo: "Ação de Graças",
      icon: <Calendar className="w-6 h-6" />,
      descricao: "Agradecimentos por graças alcançadas",
      cor: "border-green-500",
    },
    {
      tipo: "Enfermos",
      icon: <Cross className="w-6 h-6" />,
      descricao: "Orações pela saúde e recuperação",
      cor: "border-blue-500",
    },
    {
      tipo: "Falecimento",
      icon: <Users className="w-6 h-6" />,
      descricao: "Missas em sufrágio pelos entes queridos",
      cor: "border-purple-500",
    },
    {
      tipo: "Outros",
      icon: <Plus className="w-6 h-6" />,
      descricao: "Outras intenções especiais",
      cor: "border-gray-500",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0c2657] to-[#1a3a7a] text-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-500 p-4 rounded-full">
              <Heart className="w-8 h-8 text-[#0c2657]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Intenções de Missa</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Envie suas intenções para que sejam lembradas durante as celebrações eucarísticas
          </p>
        </div>

        {/* Tipos de Intenções */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiposIntencoes.map((intencao, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border-l-4 ${intencao.cor} hover:bg-white/20 transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-yellow-500">{intencao.icon}</div>
                <h3 className="font-semibold text-lg">{intencao.tipo}</h3>
              </div>
              <p className="text-gray-300 text-sm">{intencao.descricao}</p>
            </div>
          ))}
        </div>

        {/* Status de Construção */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-500 p-3 rounded-full">
              <Plus className="w-6 h-6 text-[#0c2657]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Em Construção</h2>
          <p className="text-gray-300 mb-6">
            Estamos desenvolvendo esta funcionalidade para facilitar o envio de suas intenções de missa. Em breve você
            poderá enviar suas intenções diretamente pelo aplicativo.
          </p>
          <div className="bg-[#0c2657]/50 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong>Por enquanto:</strong> Entre em contato conosco pelos canais tradicionais para enviar suas
              intenções.
            </p>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-500">Como Funciona</h3>
          <div className="space-y-3 text-gray-300">
            <p>• As intenções são lembradas durante a oração eucarística</p>
            <p>• Podem ser enviadas para missas específicas ou gerais</p>
            <p>• Todas as intenções são tratadas com carinho e respeito</p>
            <p>• O valor da oferta é livre e consciente</p>
          </div>
        </div>
      </div>
    </main>
  )
}
