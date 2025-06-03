import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
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
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
