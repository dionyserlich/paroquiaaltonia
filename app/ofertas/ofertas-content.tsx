"use client"

import { Heart, Church, Users, Wrench, Book, Gift } from "lucide-react"

export default function OfertasContent() {
  const destinosOfertas = [
    {
      destino: "Manutenção da Igreja",
      icon: <Church className="w-6 h-6" />,
      descricao: "Conservação e melhorias do templo",
      cor: "border-blue-500",
    },
    {
      destino: "Obras Sociais",
      icon: <Users className="w-6 h-6" />,
      descricao: "Ajuda às famílias necessitadas",
      cor: "border-green-500",
    },
    {
      destino: "Pastoral",
      icon: <Book className="w-6 h-6" />,
      descricao: "Atividades e materiais pastorais",
      cor: "border-purple-500",
    },
    {
      destino: "Equipamentos",
      icon: <Wrench className="w-6 h-6" />,
      descricao: "Som, iluminação e equipamentos",
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
              <Gift className="w-8 h-8 text-[#0c2657]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Ofertas</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Sua contribuição ajuda a manter nossa comunidade e realizar obras de caridade
          </p>
        </div>

        {/* Destinos das Ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {destinosOfertas.map((item, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border-l-4 ${item.cor} hover:bg-white/20 transition-all duration-300`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-yellow-500">{item.icon}</div>
                <h3 className="font-semibold text-lg">{item.destino}</h3>
              </div>
              <p className="text-gray-300 text-sm">{item.descricao}</p>
            </div>
          ))}
        </div>

        {/* Status de Construção */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-500 p-3 rounded-full">
              <Heart className="w-6 h-6 text-[#0c2657]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Em Construção</h2>
          <p className="text-gray-300 mb-6">
            Estamos desenvolvendo um sistema seguro para receber ofertas online. Em breve você poderá contribuir
            diretamente pelo aplicativo.
          </p>
          <div className="bg-[#0c2657]/50 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong>Por enquanto:</strong> As ofertas podem ser feitas presencialmente durante as missas ou na
              secretaria paroquial.
            </p>
          </div>
        </div>

        {/* Informações sobre Ofertas */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-500">Sobre as Ofertas</h3>
          <div className="space-y-3 text-gray-300">
            <p>• Toda oferta é voluntária e feita com amor</p>
            <p>• Os recursos são aplicados com transparência</p>
            <p>• Ajudam a manter as atividades paroquiais</p>
            <p>• Contribuem para obras sociais da comunidade</p>
          </div>
        </div>

        {/* Versículo Bíblico */}
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] border border-yellow-500/30 rounded-lg p-6 text-center">
          <p className="text-lg italic text-gray-300 mb-2">
            "Cada um dê conforme decidiu em seu coração, não com tristeza ou por obrigação, pois Deus ama quem dá com
            alegria."
          </p>
          <p className="text-yellow-500 font-semibold">2 Coríntios 9:7</p>
        </div>
      </div>
    </main>
  )
}
