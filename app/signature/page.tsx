"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

export default function SignaturePage() {
  const [signatureCode, setSignatureCode] = useState("")
  const [documentSigned, setDocumentSigned] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (user.isKO) {
      router.push("/ko")
      return
    }
    if (user.hasActivePolicy) {
      router.push("/portal")
      return
    }
    if (!user.hasActiveLead) {
      router.push("/calculator")
      return
    }
  }, [user, router])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSignature = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (signatureCode !== "1234") {
        alert("Código de firma incorrecto. Use: 1234")
        return
      }

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Verificar que hay algo dibujado
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasDrawing = imageData.data.some((pixel, index) => index % 4 === 3 && pixel > 0)

      if (!hasDrawing) {
        alert("Por favor, realice su firma en el recuadro")
        return
      }

      const signatureData = canvas.toDataURL()
      const response = await apiClient.signContract(signatureCode, signatureData)

      if (response.data) {
        await refreshUser()
        setDocumentSigned(true)
        setTimeout(() => {
          router.push("/portal")
        }, 2000)
      } else {
        alert(response.error || "Error al firmar el contrato")
      }
    } catch (error) {
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  if (documentSigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Documento Firmado!</h2>
            <p className="text-green-600">Redirigiendo al portal de cliente...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Firma del Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Documento dummy */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold mb-4">CONTRATO DE SEGURO DE SALUD</h3>
                  <p className="mb-4">
                    Por el presente contrato, la compañía aseguradora se compromete a proporcionar cobertura médica al
                    asegurado según los términos y condiciones establecidos.
                  </p>
                  <div className="bg-gray-100 p-4 rounded mb-4">
                    <h4 className="font-semibold mb-2">CONDICIONES PRINCIPALES:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Cobertura médica completa</li>
                      <li>Atención hospitalaria</li>
                      <li>Consultas médicas</li>
                      <li>Medicamentos incluidos</li>
                      <li>Urgencias 24/7</li>
                    </ul>
                  </div>
                  <p className="mb-4">
                    El asegurado acepta las condiciones generales y particulares de la póliza, así como el pago de las
                    primas correspondientes según la periodicidad acordada.
                  </p>
                  <p className="text-sm text-gray-600">
                    Este es un documento de ejemplo para la prueba técnica. En un entorno real, aquí se mostraría el
                    contrato completo.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Área de firma */}
            <form onSubmit={handleSignature} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Área de Firma</Label>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="border border-gray-300 cursor-crosshair w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm text-gray-600">Dibuje su firma arriba</p>
                    <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                      Limpiar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureCode">Código de firma</Label>
                <Input
                  id="signatureCode"
                  value={signatureCode}
                  onChange={(e) => setSignatureCode(e.target.value)}
                  placeholder="Ingrese el código: 1234"
                  required
                />
                <p className="text-sm text-gray-600">Para esta demo, use el código: 1234</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Firmando..." : "Firmar Contrato"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
