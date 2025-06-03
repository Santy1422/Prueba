import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const { paymentFrequency, paymentMethod, cardData, sepaData } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.leadId) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: user.leadId },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    // Calcular precio final
    const finalPrice = paymentFrequency === "monthly" ? Math.round(lead.totalPrice / 12) : lead.totalPrice

    // Preparar datos de pago
    const paymentData = {
      frequency: paymentFrequency,
      method: paymentMethod,
      finalPrice,
      processedAt: new Date().toISOString(),
      ...(paymentMethod === "card"
        ? {
            cardNumber: cardData?.cardNumber?.slice(-4),
            expiryDate: cardData?.expiryDate,
          }
        : {
            iban: sepaData?.iban?.slice(-4),
          }),
    }

    // Actualizar lead
    await prisma.lead.update({
      where: { id: user.leadId },
      data: {
        status: "payment",
        paymentData: JSON.stringify(paymentData),
      },
    })

    return NextResponse.json({
      status: "success",
      message: "Pago procesado correctamente",
      finalPrice,
    })
  } catch (error) {
    console.error("Error en pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
