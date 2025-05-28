"use client"

import { Heart, Calendar, Shield, Users, Gift, Repeat } from "lucide-react"

export default function DizimoContent() {
  const beneficios = [
    {
      titulo: "Contribuição Regular",
      icon: <Calendar className="w-6 h-6" />,
      descricao: "Pagamento automático mensal",
      cor: "border-blue-500",
    },
    {
      titulo: "Transparência",
      icon: <Shield className="w-6 h-6" />,
      descricao: "Relatórios de aplicação dos recursos",
      cor: "border-green-500",
    },
    {
      titulo: "Comunidade",
      icon: <Users className="w-6 h-6" />,
      descricao: "Fortalecimento da vida paroquial",
      cor: "border-purple-500",
    },
    {
      titulo: "Flexibilidade",
      icon: <Repeat className="w-6 h-6" />,
      descricao: "Valor ajustável conforme possibilidade",
      cor: "border-orange-500",
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
          <h1 className="text-3xl md:text-4xl font-bold">Dízimo</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Seja um dizimista e contribua mensalmente para o crescimento da nossa comunidade paroquial
          </p>
        </div>

        {/* O que é o Dízimo */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-yellow-500">O que é o Dízimo?</h2>
          <p className="text-gray-300 leading-relaxed">
            O dízimo é uma contribuição mensal voluntária que representa nossa gratidão a Deus e nosso compromisso com a
            comunidade paroquial. Tradicionalmente corresponde a 10% da renda, mas o valor pode ser ajustado conforme a
            possibilidade de cada família.
          </p>
        </div>

        {/* Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beneficios.map((beneficio, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border-l-4 ${beneficio.cor} hover:bg-white/20 transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-yellow-500">{beneficio.icon}</div>
                <h3 className="font-semibold text-lg">{beneficio.titulo}</h3>
              </div>
              <p className="text-gray-300 text-sm">{beneficio.descricao}</p>
            </div>
          ))}
        </div>

        {/* Status de Construção */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-500 p-3 rounded-full">
              <Gift className="w-6 h-6 text-[#0c2657]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Em Construção</h2>
          <p className="text-gray-300 mb-6">
            Estamos desenvolvendo um sistema de cobrança recorrente para facilitar sua contribuição mensal. Em breve
            você poderá aderir ao dízimo diretamente pelo aplicativo.
          </p>
          <div className="bg-[#0c2657]/50 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong>Por enquanto:</strong> Procure a secretaria paroquial para se tornar um dizimista.
            </p>
          </div>
        </div>

        {/* Como o Dízimo é Aplicado */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-500">Como o Dízimo é Aplicado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="font-semibold mb-2">Manutenção da Igreja</h4>
              <p className="text-sm">Conservação do templo, equipamentos e instalações</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Atividades Pastorais</h4>
              <p className="text-sm">Catequese, grupos de oração e formação</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Obras Sociais</h4>
              <p className="text-sm">Ajuda às famílias necessitadas da comunidade</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Evangelização</h4>
              <p className="text-sm">Materiais e atividades missionárias</p>
            </div>
          </div>
        </div>

        {/* Versículo Bíblico */}
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] border border-yellow-500/30 rounded-lg p-6 text-center">
          <p className="text-lg italic text-gray-300 mb-2">
            "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa; e provai-me nisto, diz o
            Senhor dos Exércitos, se eu não vos abrir as janelas do céu e não derramar sobre vós bênção sem medida."
          </p>
          <p className="text-yellow-500 font-semibold">Malaquias 3:10</p>
        </div>
      </div>
    </main>
  )
}
