"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"

interface Lead {
  id: string
  userId: string
  totalPrice: number
  status: string
}

export default function PaymentPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [paymentFrequency, setPaymentFrequency] = useState<"monthly" | "annual">("monthly")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "sepa">("card")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [iban, setIban] = useState("")
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

    // Cargar datos del usuario y lead
    const loadUserData = async () => {
      try {
        const response = await apiClient.getUserProfile()
        if (response.data && response.data.currentLead) {
          setLead(response.data.currentLead)
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
      }
    }

    loadUserData()
  }, [user, router])

  const getFinalPrice = () => {
    if (!lead) return 0
    return paymentFrequency === "monthly" ? Math.round(lead.totalPrice / 12) : lead.totalPrice
  }

  const validateCard = () => {
    if (cardNumber.length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos")
      return false
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      alert("La fecha de caducidad debe tener formato MM/YY")
      return false
    }
    if (cvv.length !== 3) {
      alert("El CVV debe tener 3 dígitos")
      return false
    }
    return true
  }

  const validateSepa = () => {
    if (iban.length < 15 || iban.length > 34) {
      alert("El IBAN debe tener entre 15 y 34 caracteres")
      return false
    }
    return true
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (paymentMethod === "card" && !validateCard()) {
        return
      }
      if (paymentMethod === "sepa" && !validateSepa()) {
        return
      }

      const paymentData = {
        paymentFrequency,
        paymentMethod,
        ...(paymentMethod === "card"
          ? {
              cardData: {
                cardNumber,
                expiryDate,
                cvv,
              },
            }
          : {
              sepaData: {
                iban,
              },
            }),
      }

      const response = await apiClient.processPayment(paymentData)

      if (response.data) {
        await refreshUser()
        alert("Pago procesado correctamente")
        router.push("/signature")
      } else {
        alert(response.error || "Error procesando el pago")
      }
    } catch (error) {
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (!user || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Página de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumen del precio */}
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-2">Precio: {lead.totalPrice}€/año</div>
                  <div className="text-lg text-blue-600">
                    Precio final: {getFinalPrice()}€/{paymentFrequency === "monthly" ? "mes" : "año"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Periodicidad de pago */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Periodicidad de pago</Label>
                <RadioGroup
                  value={paymentFrequency}
                  onValueChange={(value: "monthly" | "annual") => setPaymentFrequency(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Mensual ({Math.round(lead.totalPrice / 12)}€/mes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="annual" id="annual" />
                    <Label htmlFor="annual">Anual ({lead.totalPrice}€/año)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Método de pago */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Método de pago</Label>
                <Tabs value={paymentMethod} onValueChange={(value: "card" | "sepa") => setPaymentMethod(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card">Tarjeta</TabsTrigger>
                    <TabsTrigger value="sepa">SEPA</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número de tarjeta</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Fecha de caducidad</Label>
                        <Input
                          id="expiryDate"
                          value={expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "")
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2, 4)
                            }
                            setExpiryDate(value)
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sepa" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={iban}
                        onChange={(e) => setIban(e.target.value.toUpperCase())}
                        placeholder="ES91 2100 0418 4502 0005 1332"
                        required
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Procesando..." : "Realizar Pago"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
