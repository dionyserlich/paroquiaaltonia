"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, BellOff, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePushSubscription } from "@/hooks/use-push-subscription"
import { getDeviceId } from "@/lib/device-id"
import { getLidasAte, marcarTodasComoLidas } from "@/lib/notificacoes-lidas"

type Notificacao = {
  id: number
  title: string
  body: string
  url: string
  createdAt: string
  pessoal: boolean
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutos = Math.floor(diff / 60000)
  if (minutos < 1) return "agora"
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return "ontem"
  if (dias < 7) return `há ${dias} dias`
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(iso))
}

// Busca separada da atualização de estado de propósito: deixa o efeito
// abaixo poder descartar uma resposta que chegue depois da desmontagem, e
// permite reaproveitar a mesma chamada no clique de abrir o painel.
async function buscarNotificacoes(endpoint: string | null): Promise<Notificacao[] | null> {
  try {
    const params = new URLSearchParams()
    const deviceId = getDeviceId()
    if (deviceId) params.set("deviceId", deviceId)
    if (endpoint) params.set("endpoint", endpoint)
    const res = await fetch(`/api/notificacoes?${params.toString()}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.notificacoes) ? data.notificacoes : []
  } catch {
    // Falha silenciosa: o histórico é complementar, não pode quebrar o
    // cabeçalho se a rede oscilar.
    return null
  }
}

// Fecha as notificações que ainda estão paradas na bandeja do sistema
// (central de notificações do Android/macOS). Sem isso elas ficavam lá
// depois de já terem sido lidas aqui dentro, obrigando a dispensar tudo de
// novo na mão — o estado no site e o do sistema operacional ficavam
// divergindo.
//
// getNotifications() é a única leitura que a Web Notifications API oferece,
// e devolve só o que está exibido no momento (não serve como histórico —
// por isso o histórico vem do servidor).
async function limparBandejaDoSistema() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const abertas = await registration.getNotifications()
    abertas.forEach((n) => n.close())
  } catch {
    // Navegador sem suporte ou sem permissão — a bandeja só não é limpa.
  }
}

export default function NotificationsPanel() {
  const { isSupported, isSubscribed, isLoading, iosNeedsInstall, endpoint, activate, deactivate } =
    usePushSubscription()

  const [aberto, setAberto] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [carregando, setCarregando] = useState(true)
  // Congelado no momento em que o painel abre: as marcações de "novo"
  // precisam continuar visíveis enquanto a pessoa lê, mesmo depois de já
  // terem sido marcadas como lidas.
  const [lidasAteNaAbertura, setLidasAteNaAbertura] = useState(0)

  // O sino vive no cabeçalho, que fica montado o tempo todo — então buscar
  // só na montagem significava buscar praticamente uma vez só. Numa PWA
  // isso é pior ainda: o app é retomado, não recarregado, e o contador
  // ficava congelado até a pessoa forçar um recarregamento na mão.
  //
  // Daí as três formas de atualizar abaixo: ao montar, ao voltar pro app, e
  // na hora em que o push chega (o service worker avisa as janelas abertas).
  useEffect(() => {
    let ativo = true

    const atualizar = () => {
      buscarNotificacoes(endpoint).then((lista) => {
        if (!ativo) return
        if (lista) setNotificacoes(lista)
        setCarregando(false)
      })
    }

    atualizar()

    const aoVoltarPraTela = () => {
      if (document.visibilityState === "visible") atualizar()
    }
    document.addEventListener("visibilitychange", aoVoltarPraTela)

    const aoChegarPush = (evento: MessageEvent) => {
      if (evento.data?.type === "push-recebido") atualizar()
    }
    navigator.serviceWorker?.addEventListener("message", aoChegarPush)

    return () => {
      ativo = false
      document.removeEventListener("visibilitychange", aoVoltarPraTela)
      navigator.serviceWorker?.removeEventListener("message", aoChegarPush)
    }
  }, [endpoint])

  const naoLidas = notificacoes.filter((n) => new Date(n.createdAt).getTime() > getLidasAte()).length

  async function abrir() {
    setLidasAteNaAbertura(getLidasAte())
    setAberto(true)
    // Ler aqui dentro conta como ler: marca como lidas e tira da bandeja do
    // sistema, pros dois lados ficarem consistentes.
    marcarTodasComoLidas()
    limparBandejaDoSistema()
    const lista = await buscarNotificacoes(endpoint)
    if (lista) setNotificacoes(lista)
  }

  // O sino aparece SEMPRE, inclusive onde push não funciona (iPhone sem a
  // PWA instalada, navegador sem suporte) — nesses casos o histórico é
  // justamente o único jeito de a pessoa ficar sabendo dos avisos.
  return (
    <>
      <button onClick={abrir} className="relative text-white p-2" aria-label="Notificações">
        {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold leading-none">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md w-[95vw] p-0 gap-0 bg-parish-navy border-white/10 text-white max-h-[80vh] grid-rows-[auto_auto_1fr]">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle className="text-white">Notificações</DialogTitle>
            <DialogDescription className="sr-only">
              Histórico de avisos da paróquia e avisos dirigidos a este aparelho.
            </DialogDescription>
          </DialogHeader>

          {/* O interruptor de push mora aqui dentro agora: o sino virou a
              porta do histórico, então ligar/desligar precisava de um lugar
              próprio — padrão usual desses painéis. */}
          <div className="px-4 pb-3 border-b border-white/10">
            {iosNeedsInstall ? (
              <p className="text-xs text-gray-400">
                Para receber avisos no iPhone, adicione o site à Tela de Início.
              </p>
            ) : !isSupported ? (
              <p className="text-xs text-gray-400">Este navegador não permite avisos automáticos.</p>
            ) : (
              <button
                onClick={() => (isSubscribed ? deactivate() : activate())}
                disabled={isLoading}
                className="w-full flex items-center justify-between gap-3 text-left disabled:opacity-60"
              >
                <span className="text-sm">
                  {isSubscribed ? "Avisos ativados" : "Ativar avisos no aparelho"}
                </span>
                <span
                  className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${
                    isSubscribed ? "bg-yellow-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      isSubscribed ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            )}
          </div>

          <div className="overflow-y-auto">
            {carregando ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : notificacoes.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                Nenhuma notificação por enquanto.
              </p>
            ) : (
              <ul className="divide-y divide-white/10">
                {notificacoes.map((n) => {
                  const nova = new Date(n.createdAt).getTime() > lidasAteNaAbertura
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.url}
                        onClick={() => setAberto(false)}
                        className={`block px-4 py-3 hover:bg-white/5 ${nova ? "bg-white/[0.04]" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          {nova && <span className="mt-1.5 w-2 h-2 rounded-full bg-yellow-500 shrink-0" />}
                          <div className={`min-w-0 flex-1 ${nova ? "" : "pl-4"}`}>
                            <p className="font-medium text-sm leading-snug">{n.title}</p>
                            <p className="text-sm text-gray-300 leading-snug mt-0.5">{n.body}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {tempoRelativo(n.createdAt)}
                              {n.pessoal && " · só para você"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
