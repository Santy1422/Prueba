"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Calculator } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

export default function CalculatorPage() {
  const [phone, setPhone] = useState("")
  const [mainBirthDate, setMainBirthDate] = useState("")
  const [hasCopay, setHasCopay] = useState(false)
  const [additionalInsured, setAdditionalInsured] = useState<{ id: string; birthDate: string }[]>([])
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [error, setError] = useState("")
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
  }, [user, router])

  const addAdditionalInsured = () => {
    if (additionalInsured.length < 2) {
      setAdditionalInsured([...additionalInsured, { id: Date.now().toString(), birthDate: "" }])
    }
  }

  const removeAdditionalInsured = (id: string) => {
    setAdditionalInsured(additionalInsured.filter((insured) => insured.id !== id))
  }

  const updateAdditionalInsured = (id: string, birthDate: string) => {
    setAdditionalInsured(additionalInsured.map((insured) => (insured.id === id ? { ...insured, birthDate } : insured)))
  }

  const calculatePrice = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.calculatePrice({
        phone,
        mainBirthDate,
        hasCopay,
        additionalInsured,
      })

      if (response.data) {
        setCalculatedPrice(response.data.totalPrice)
      } else {
        setError(response.error || "Error al calcular el precio")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const proceedToSubscription = async () => {
    await refreshUser()
    router.push("/subscription")
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Calculadora de Seguros de Salud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Datos obligatorios */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainBirthDate">Fecha de nacimiento del asegurado principal *</Label>
                <Input
                  id="mainBirthDate"
                  type="date"
                  value={mainBirthDate}
                  onChange={(e) => setMainBirthDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="copay" checked={hasCopay} onCheckedChange={setHasCopay} />
                <Label htmlFor="copay">¿Desea copago?</Label>
              </div>
            </div>

            {/* Asegurados adicionales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Asegurados adicionales</Label>
                {additionalInsured.length < 2 && (
                  <Button type="button" variant="outline" size="sm" onClick={addAdditionalInsured}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir asegurado
                  </Button>
                )}
              </div>

              {additionalInsured.map((insured, index) => (
                <div key={insured.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`additional-${insured.id}`}>Fecha de nacimiento - Asegurado {index + 2}</Label>
                    <Input
                      id={`additional-${insured.id}`}
                      type="date"
                      value={insured.birthDate}
                      onChange={(e) => updateAdditionalInsured(insured.id, e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeAdditionalInsured(insured.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <Button onClick={calculatePrice} className="w-full" disabled={loading}>
              {loading ? "Calculando..." : "Calcular Precio"}
            </Button>

            {calculatedPrice && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-700 mb-2">{calculatedPrice}€/año</div>
                    <p className="text-green-600 mb-4">
                      Precio calculado para {1 + additionalInsured.filter((i) => i.birthDate).length} asegurado(s)
                    </p>
                    <Button onClick={proceedToSubscription} className="w-full">
                      Continuar con la suscripción
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
