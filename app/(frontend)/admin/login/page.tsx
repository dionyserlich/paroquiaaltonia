"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "@/app/admin/admin.css"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // Senha correta, redirecionar para o painel
        router.push("/admin")
      } else {
        setError("Senha incorreta")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page flex items-center justify-center p-4">
      <div className="admin-card w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-icone.png" alt="Paróquia São Sebastião" width={80} height={80} />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Área Administrativa</h1>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="admin-label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="admin-btn admin-btn-primary w-full disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
