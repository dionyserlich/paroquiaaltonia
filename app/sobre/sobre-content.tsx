"use client"

import { Church, Globe, Users, Calendar, Heart, Crown } from "lucide-react"

export default function SobreContent() {
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
        <p className="text-gray-300 text-lg leading-relaxed">
          A Paróquia São Sebastião de Altônia é um marco de fé, perseverança e compromisso comunitário no noroeste do
          Paraná. Desde sua fundação em 1º de maio de 1969, por Dom Elizeu Simões Mendes, então bispo de Campo Mourão, a
          paróquia tem sido um pilar espiritual para a população local, mesmo antes da criação da Diocese de Umuarama em
          1973.
        </p>
      </div>

      {/* Galeria Histórica */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Nossa Evolução</h2>
          <p className="text-gray-300">Veja como nossa paróquia cresceu ao longo dos anos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Igreja Antiga */}
          <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border border-yellow-500">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src="/images/igreja-antiga.jpg"
                  alt="Igreja antiga da Paróquia São Sebastião - Primeiros anos da comunidade"
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

          {/* Igreja Atual */}
          <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border border-yellow-500">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src="/images/igreja-atual.jpg"
                  alt="Igreja atual da Paróquia São Sebastião - Arquitetura moderna"
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
                  Nossa moderna igreja matriz, que reflete o crescimento e a vitalidade da comunidade paroquial nos dias
                  de hoje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Histórica */}
      <div className="space-y-6">
        {/* As raízes missionárias */}
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-500 p-2 rounded-full flex-shrink-0">
              <Globe className="w-5 h-5 text-[#0c2657]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <h2 className="text-xl font-bold text-white">As raízes missionárias</h2>
                <span className="bg-yellow-500 text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold">
                  1969-1977
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Nos primeiros anos, a paróquia foi confiada aos Padres de São Tiago, missionários franceses com
                experiência no Haiti. Eles desempenharam um papel crucial na organização das primeiras comunidades e na
                formação de líderes leigos. Com a criação da Diocese de Umuarama, muitos desses padres permaneceram na
                região até serem enviados para missões no norte do Brasil. Em 1977, a Congregação de São João Batista, o
                Precursor, assumiu a paróquia, introduzindo as Comunidades Neocatecumenais e fortalecendo diversas
                pastorais em sintonia com a pastoral diocesana.
              </p>
            </div>
          </div>
        </div>

        {/* Crescimento e evangelização */}
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-400 p-2 rounded-full flex-shrink-0">
              <Users className="w-5 h-5 text-[#0c2657]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <h2 className="text-xl font-bold text-white">Crescimento e evangelização</h2>
                <span className="bg-blue-400 text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold">Missão</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                A Paróquia São Sebastião sempre se destacou por seu trabalho missionário, especialmente com aqueles
                afastados da fé ou que nunca participaram da vida eclesial. Por meio de catequeses para jovens e
                adultos, muitos têm recebido os sacramentos da iniciação cristã, fortalecendo a comunidade e promovendo
                uma fé viva e atuante.
              </p>
            </div>
          </div>
        </div>

        {/* Celebrações e tradições */}
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border-l-4 border-green-400">
          <div className="flex items-start space-x-4">
            <div className="bg-green-400 p-2 rounded-full flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#0c2657]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <h2 className="text-xl font-bold text-white">Celebrações e tradições</h2>
                <span className="bg-green-400 text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold">
                  20 de Janeiro
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                A festa do padroeiro, São Sebastião, celebrada em 20 de janeiro, é um dos eventos mais aguardados do
                calendário religioso local. As comemorações incluem uma semana de bênçãos temáticas, como para
                gestantes, pescadores, agricultores e enfermos, culminando em uma grande celebração dominical com missa,
                almoço comunitário, show de prêmios e leilão de gado.
              </p>
            </div>
          </div>
        </div>

        {/* Compromisso com a comunidade */}
        <div className="bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border-l-4 border-purple-400">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-400 p-2 rounded-full flex-shrink-0">
              <Heart className="w-5 h-5 text-[#0c2657]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <h2 className="text-xl font-bold text-white">Compromisso com a comunidade</h2>
                <span className="bg-purple-400 text-[#0c2657] px-2 py-1 rounded-full text-xs font-semibold">
                  Pastoral
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Além das celebrações litúrgicas, a paróquia mantém uma presença ativa na comunidade por meio de diversas
                pastorais e movimentos, como o Apostolado da Oração, Renovação Carismática Católica e celebrações
                específicas para os enfermos. A paróquia também está atenta às questões sociais, como demonstrado em
                2021, quando alertou sobre golpes envolvendo cheques falsos em seu nome, reforçando que não realiza
                pagamentos por meio de cheques e orientando a população a denunciar tais práticas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Um legado que continua */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg text-[#0c2657]">
        <div className="flex items-start space-x-4">
          <div className="bg-[#0c2657] p-2 rounded-full flex-shrink-0">
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-3">Um legado que continua</h2>
            <p className="leading-relaxed">
              A Paróquia São Sebastião de Altônia é um símbolo de fé, esperança e amor ao próximo. Sua história é
              marcada por desafios superados, crescimento espiritual e um compromisso inabalável com a evangelização e o
              serviço à comunidade. Com uma liderança dedicada e uma comunidade engajada, a paróquia continua a ser um
              farol de luz e esperança para todos que buscam uma vida de fé e comunhão.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-[#0c2657] to-[#1a3a7a] p-6 rounded-lg border border-yellow-500">
        <h3 className="text-lg font-semibold text-white mb-2">Participe da nossa comunidade</h3>
        <p className="text-gray-300 mb-4">
          Para mais informações ou para participar das atividades paroquiais, entre em contato pelos meios disponíveis
          ou visite a igreja matriz.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/horarios"
            className="bg-yellow-500 text-[#0c2657] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Ver Horários
          </a>
          <a
            href="/whats"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors"
          >
            Falar Conosco
          </a>
        </div>
      </div>
    </div>
  )
}
