import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken, hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    // Simulación de Google OAuth - en producción usarías la API de Google
    const googleUser = {
      email: "usuario@gmail.com",
      name: "Usuario Google",
    }

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (!user) {
      // Crear nuevo usuario con contraseña temporal
      const tempPassword = await hashPassword("google-oauth-temp")
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          password: tempPassword,
        },
      })
    }

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasActiveLead: user.hasActiveLead,
        hasActivePolicy: user.hasActivePolicy,
        isKO: user.isKO,
        phone: user.phone,
        leadId: user.leadId,
      },
      token,
    })
  } catch (error) {
    console.error("Error en Google OAuth:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
