import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const { signatureCode, signatureData } = await req.json()

    if (signatureCode !== "1234") {
      return NextResponse.json({ error: "Código de firma incorrecto" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.leadId) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
    }

    // Datos de firma
    const signatureInfo = {
      code: signatureCode,
      signedAt: new Date().toISOString(),
      signature: signatureData,
    }

    // Actualizar lead como firmado
    await prisma.lead.update({
      where: { id: user.leadId },
      data: {
        status: "signed",
        signatureData: JSON.stringify(signatureInfo),
      },
    })

    // Actualizar usuario como cliente con póliza activa
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasActivePolicy: true,
        hasActiveLead: false,
      },
    })

    return NextResponse.json({
      status: "success",
      message: "Contrato firmado correctamente",
    })
  } catch (error) {
    console.error("Error en firma:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
