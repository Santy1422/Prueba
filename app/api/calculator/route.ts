import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"

// Tabla de precios base
const PRICE_TABLE = {
  withCopay: {
    "18-25": 30,
    "26-35": 40,
    "36-45": 60,
    "46-55": 80,
    "56-65": 120,
  },
  withoutCopay: {
    "18-25": 50,
    "26-35": 70,
    "36-45": 100,
    "46-55": 140,
    "56-65": 200,
  },
}

function calculateActuarialAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()

  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  const nextYearBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())

  const diffThisYear = Math.abs(today.getTime() - thisYearBirthday.getTime())
  const diffNextYear = Math.abs(today.getTime() - nextYearBirthday.getTime())

  return diffThisYear <= diffNextYear ? age : age + 1
}

function getPriceRange(age: number): string {
  if (age >= 18 && age <= 25) return "18-25"
  if (age >= 26 && age <= 35) return "26-35"
  if (age >= 36 && age <= 45) return "36-45"
  if (age >= 46 && age <= 55) return "46-55"
  if (age >= 56 && age <= 65) return "56-65"
  return ""
}

function validateAge(age: number): boolean {
  return age >= 18 && age <= 65
}

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const { phone, mainBirthDate, hasCopay, additionalInsured } = await req.json()

    if (!phone || !mainBirthDate) {
      return NextResponse.json({ error: "Teléfono y fecha de nacimiento son obligatorios" }, { status: 400 })
    }

    // Validar asegurado principal
    const mainAge = calculateActuarialAge(mainBirthDate)
    if (!validateAge(mainAge)) {
      return NextResponse.json({ error: "El asegurado principal debe tener entre 18 y 65 años" }, { status: 400 })
    }

    // Validar asegurados adicionales
    const validAdditionalInsured = additionalInsured.filter((insured: any) => insured.birthDate)
    for (const insured of validAdditionalInsured) {
      const age = calculateActuarialAge(insured.birthDate)
      if (!validateAge(age)) {
        return NextResponse.json({ error: "Todos los asegurados deben tener entre 18 y 65 años" }, { status: 400 })
      }
    }

    // Calcular precio
    const priceTable = hasCopay ? PRICE_TABLE.withCopay : PRICE_TABLE.withoutCopay
    let totalPrice = 0

    // Precio asegurado principal
    const mainPriceRange = getPriceRange(mainAge)
    totalPrice += priceTable[mainPriceRange as keyof typeof priceTable]

    // Precio asegurados adicionales
    for (const insured of validAdditionalInsured) {
      const age = calculateActuarialAge(insured.birthDate)
      const priceRange = getPriceRange(age)
      totalPrice += priceTable[priceRange as keyof typeof priceTable]
    }

    // Aplicar descuentos
    const totalInsured = 1 + validAdditionalInsured.length
    if (totalInsured === 2) {
      totalPrice *= 0.9 // 10% descuento
    } else if (totalInsured === 3) {
      totalPrice *= 0.8 // 20% descuento
    }

    const finalPrice = Math.round(totalPrice)

    // Crear lead
    const mainInsuredData = {
      birthDate: mainBirthDate,
      actuarialAge: mainAge,
    }

    const additionalInsuredData = validAdditionalInsured.map((insured: any) => ({
      id: insured.id,
      birthDate: insured.birthDate,
      actuarialAge: calculateActuarialAge(insured.birthDate),
    }))

    const lead = await prisma.lead.create({
      data: {
        userId,
        phone,
        mainInsuredData: JSON.stringify(mainInsuredData),
        additionalInsured: JSON.stringify(additionalInsuredData),
        hasCopay,
        totalPrice: finalPrice,
        status: "calculated",
      },
    })

    // Actualizar usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasActiveLead: true,
        leadId: lead.id,
        phone,
      },
    })

    return NextResponse.json({
      leadId: lead.id,
      totalPrice: finalPrice,
      message: "Precio calculado correctamente",
    })
  } catch (error) {
    console.error("Error en cálculo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
