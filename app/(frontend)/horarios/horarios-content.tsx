import { Clock, Calendar, Users, Phone, Mail, MapPin, MessageCircle } from "lucide-react"
import { groupMassScheduleForDisplay } from "@/app/lib/mass-schedule-display"

type Props = {
  horariosMissas: { diaSemana: string; hora: number; minuto: number; label?: string | null }[]
  missasEspeciais: { descricao: string; horario: string }[]
  horarioSecretaria?: string | null
  atendimentoPadres?: string | null
  confissoes?: string | null
  observacao?: string | null
  contato: { telefone?: string | null; whatsapp?: string | null; email?: string | null; endereco?: string | null }
}

export default function HorariosContent({
  horariosMissas,
  missasEspeciais,
  horarioSecretaria,
  atendimentoPadres,
  confissoes,
  observacao,
  contato,
}: Props) {
  const linhasMissas = groupMassScheduleForDisplay(horariosMissas)
  const whatsappUrl = contato.whatsapp
    ? `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre a paróquia.")}`
    : null
  const mapsUrl = contato.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contato.endereco)}`
    : null

  return (
    <div className="space-y-6">
      {/* Horário das Missas */}
      <div className="bg-parish-card p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Clock className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Horário das Missas</h3>
        </div>

        <div className="space-y-3">
          {linhasMissas.map((linha) => (
            <div key={linha.label} className="flex justify-between items-center py-2 border-b border-blue-800/30">
              <span className="text-white font-medium">{linha.label}:</span>
              <span className="text-yellow-500">{linha.horarios}</span>
            </div>
          ))}
        </div>

        {missasEspeciais.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Missas Especiais:</h4>
            <div className="space-y-2">
              {missasEspeciais.map((m, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-gray-300 text-sm">{m.descricao}:</span>
                  <span className="text-yellow-500 text-sm">{m.horario}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Horário da Secretaria */}
      {horarioSecretaria && (
        <div className="bg-parish-card p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Calendar className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Horário da Secretaria</h3>
          </div>
          <p className="text-yellow-500 whitespace-pre-line">{horarioSecretaria}</p>
        </div>
      )}

      {/* Atendimento dos Padres */}
      {atendimentoPadres && (
        <div className="bg-parish-card p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Users className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Atendimento dos Padres</h3>
          </div>
          <p className="text-yellow-500 whitespace-pre-line">{atendimentoPadres}</p>
        </div>
      )}

      {/* Confissões */}
      {confissoes && (
        <div className="bg-parish-card p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <Users className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Confissões</h3>
          </div>
          <p className="text-yellow-500 whitespace-pre-line">{confissoes}</p>
        </div>
      )}

      {/* Contatos */}
      <div className="bg-parish-card p-6 rounded-lg">
        <div className="flex items-center mb-4 text-yellow-500">
          <Phone className="mr-2" size={20} />
          <h3 className="text-lg font-bold">Contatos</h3>
        </div>

        <div className="space-y-4">
          {contato.email && (
            <a
              href={`mailto:${contato.email}`}
              className="flex items-center w-full p-3 bg-blue-800/30 rounded-lg hover:bg-blue-700/30 transition-colors"
            >
              <Mail className="mr-3 text-yellow-500" size={20} />
              <div className="text-left">
                <div className="text-white font-medium">E-mail</div>
                <div className="text-gray-300 text-sm">{contato.email}</div>
              </div>
            </a>
          )}

          {contato.telefone && (
            <a
              href={`tel:${contato.telefone}`}
              className="flex items-center w-full p-3 bg-blue-800/30 rounded-lg hover:bg-blue-700/30 transition-colors"
            >
              <Phone className="mr-3 text-yellow-500" size={20} />
              <div className="text-left">
                <div className="text-white font-medium">Telefone</div>
                <div className="text-gray-300 text-sm">{contato.telefone}</div>
              </div>
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full p-3 bg-green-800/30 rounded-lg hover:bg-green-700/30 transition-colors"
            >
              <MessageCircle className="mr-3 text-green-400" size={20} />
              <div className="text-left">
                <div className="text-white font-medium">WhatsApp</div>
                <div className="text-gray-300 text-sm">{contato.whatsapp}</div>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Endereço */}
      {contato.endereco && (
        <div className="bg-parish-card p-6 rounded-lg">
          <div className="flex items-center mb-4 text-yellow-500">
            <MapPin className="mr-2" size={20} />
            <h3 className="text-lg font-bold">Endereço</h3>
          </div>

          <a
            href={mapsUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full p-3 bg-blue-800/30 rounded-lg hover:bg-blue-700/30 transition-colors text-left"
          >
            <div className="text-white">{contato.endereco}</div>
          </a>
        </div>
      )}

      {/* Observação */}
      {observacao && (
        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-500 text-sm text-center">
            <strong>Observação:</strong> {observacao}
          </p>
        </div>
      )}
    </div>
  )
}
