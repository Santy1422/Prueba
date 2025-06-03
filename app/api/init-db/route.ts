import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    // Verificar si ya existe un usuario de prueba
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Base de datos ya inicializada" })
    }

    // Crear usuario de prueba
    const hashedPassword = await hashPassword("password123")
    await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Usuario de Prueba",
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: "Base de datos inicializada correctamente" })
  } catch (error) {
    console.error("Error inicializando base de datos:", error)
    return NextResponse.json({ error: "Error inicializando base de datos" }, { status: 500 })
  }
}
