import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        leads: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const currentLead = user.leads[0] || null

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        hasActiveLead: user.hasActiveLead,
        hasActivePolicy: user.hasActivePolicy,
        isKO: user.isKO,
        leadId: user.leadId,
      },
      currentLead: currentLead
        ? {
            id: currentLead.id,
            phone: currentLead.phone,
            totalPrice: currentLead.totalPrice,
            status: currentLead.status,
            createdAt: currentLead.createdAt,
            mainInsuredData: JSON.parse(currentLead.mainInsuredData),
            additionalInsured: JSON.parse(currentLead.additionalInsured),
            hasCopay: currentLead.hasCopay,
            paymentData: currentLead.paymentData ? JSON.parse(currentLead.paymentData) : null,
            signatureData: currentLead.signatureData ? JSON.parse(currentLead.signatureData) : null,
          }
        : null,
    })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
