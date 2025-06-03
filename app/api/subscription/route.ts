import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const { isSmoker } = await req.json()

    if (isSmoker === undefined) {
      return NextResponse.json({ error: "Respuesta requerida" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.leadId) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    if (isSmoker) {
      // KO - Usuario fumador
      await prisma.user.update({
        where: { id: userId },
        data: {
          isKO: true,
          hasActiveLead: false,
          leadId: null,
        },
      })

      await prisma.lead.update({
        where: { id: user.leadId },
        data: { status: "ko" },
      })

      return NextResponse.json({ status: "ko", message: "No podemos cubrirte" })
    } else {
      // Continuar al pago
      await prisma.lead.update({
        where: { id: user.leadId },
        data: { status: "subscription" },
      })

      return NextResponse.json({ status: "success", message: "Continuar al pago" })
    }
  } catch (error) {
    console.error("Error en suscripción:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
