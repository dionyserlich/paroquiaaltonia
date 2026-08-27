"use client"

import { Clock, Calendar, Users, Phone, Mail, MapPin, MessageCircle } from "lucide-react"

export default function HorariosContent() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5544998680244"
    const message = "Olá! Gostaria de mais informações sobre a paróquia."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handlePhoneClick = () => {
    window.open("tel:+554436591110", "_self")
  }

  const handleEmailClick = () => {
    window.open("mailto:paroquia_altonia@hotmail.com", "_self")
  }

  const handleAddressClick = () => {
    const address = "Rua da Bandeira, 426 – Centro, Altônia – PR, CEP: 87550-000"
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(mapsUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Horário das Missas */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Clock className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Horário das Missas</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-blue-800/30">
            <span className="text-white font-medium">Segunda à sexta-feira:</span>
            <span className="text-yellow-500">07h30 | 20h00</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-blue-800/30">
            <span className="text-white font-medium">Sábado:</span>
            <span className="text-yellow-500">20h00</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-blue-800/30">
            <span className="text-white font-medium">Domingo:</span>
            <span className="text-yellow-500">08h30 | 10h30 | 18h00</span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-white font-medium mb-3">Missas Especiais:</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-300 text-sm">1ª Sexta-feira do mês (Apostolado da Oração):</span>
              <span className="text-yellow-500 text-sm">20h00</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-300 text-sm">3ª Quarta-feira do mês (RCC):</span>
              <span className="text-yellow-500 text-sm">20h00</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-300 text-sm">4ª Sexta-feira do mês (Enfermos):</span>
              <span className="text-yellow-500 text-sm">15h00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horário da Secretaria */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Calendar className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Horário da Secretaria</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-white font-medium">Segunda à sexta-feira:</span>
            <div className="text-right">
              <div className="text-yellow-500">08h00 às 12h00</div>
              <div className="text-yellow-500">13h30 às 18h00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Atendimento dos Padres */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Users className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Atendimento dos Padres</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-blue-800/30">
            <span className="text-white font-medium">Segunda, quarta e sexta-feira:</span>
            <span className="text-yellow-500">08h30 às 12h00</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-white font-medium">Quinta-feira:</span>
            <div className="text-right">
              <div className="text-yellow-500">08h30 às 12h00</div>
              <div className="text-yellow-500">19h30 às 21h00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Confissões */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Users className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Confissões</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-white font-medium">Segunda-feira:</span>
            <span className="text-yellow-500">15h00 às 18h00</span>
          </div>
          <p className="text-gray-300 text-sm italic">Local: Igreja Matriz</p>
        </div>
      </div>

      {/* Contatos */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Phone className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Contatos</h3>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleEmailClick}
            className="flex items-center w-full p-3 bg-blue-800/30 rounded-lg hover:bg-blue-700/30 transition-colors"
          >
            <Mail className="mr-3 text-yellow-500" size={20} />
            <div className="text-left">
              <div className="text-white font-medium">E-mail</div>
              <div className="text-gray-300 text-sm">paroquia_altonia@hotmail.com</div>
            </div>
          </button>

          <button
            onClick={handlePhoneClick}
            className="flex items-center w-full p-3 bg-blue-800/30 rounded-lg hover:bg-blue-700/30 transition-colors"
          >
            <Phone className="mr-3 text-yellow-500" size={20} />
            <div className="text-left">
              <div className="text-white font-medium">Telefone</div>
              <div className="text-gray-300 text-sm">(44) 3659-1110</div>
            </div>
          </button>

          <button
            onClick={handleWhatsAppClick}
            className="flex items-center w-full p-3 bg-green-800/30 rounded-lg hover:bg-green-700/30 transition-colors"
          >
            <MessageCircle className="mr-3 text-green-400" size={20} />
            <div className="text-left">
              <div className="text-white font-medium">WhatsApp</div>
              <div className="text-gray-300 text-sm">(44) 99868-0244</div>
            </div>
          </button>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-[#0c2657] p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <MapPin className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Endereço</h3>
        </div>

        <button
          onClick={handleAddressClick}
          className="w-full p-3 bg-blue-800/30 rounded-lg hover:bg-blue-700/30 transition-colors text-left"
        >
          <div className="text-white">
            <div className="font-medium">Rua da Bandeira, 426 – Centro</div>
            <div className="text-gray-300 text-sm mt-1">Caixa Postal 42</div>
            <div className="text-gray-300 text-sm">CEP: 87550-000 – Altônia – PR</div>
            <div className="text-yellow-500 text-sm mt-2">Decanato de Pérola</div>
          </div>
        </button>
      </div>

      {/* Observação */}
      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
        <p className="text-yellow-500 text-sm text-center">
          <strong>Observação:</strong> Os horários podem sofrer alterações em datas especiais. Consulte nossos canais de
          comunicação para confirmações.
        </p>
      </div>
    </div>
  )
}
