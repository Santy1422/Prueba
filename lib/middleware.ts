import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ error: "Token requerido" }, { status: 401 })
      }

      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 })
      }

      return handler(req, payload.userId)
    } catch (error) {
      return NextResponse.json({ error: "Error de autenticación" }, { status: 401 })
    }
  }
}
