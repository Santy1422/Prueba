interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor() {
    this.baseUrl = "/api"
    this.token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || "Error desconocido",
        status: response.status,
      }
    } catch (error) {
      return {
        error: "Error de conexión",
        status: 0,
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async googleAuth() {
    return this.request("/auth/google", {
      method: "POST",
    })
  }

  // Calculator endpoint
  async calculatePrice(data: {
    phone: string
    mainBirthDate: string
    hasCopay: boolean
    additionalInsured: any[]
  }) {
    return this.request("/calculator", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Subscription endpoint
  async submitSubscription(isSmoker: boolean) {
    return this.request("/subscription", {
      method: "POST",
      body: JSON.stringify({ isSmoker }),
    })
  }

  // Payment endpoint
  async processPayment(data: {
    paymentFrequency: string
    paymentMethod: string
    cardData?: any
    sepaData?: any
  }) {
    return this.request("/payment", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Signature endpoint
  async signContract(signatureCode: string, signatureData: string) {
    return this.request("/signature", {
      method: "POST",
      body: JSON.stringify({ signatureCode, signatureData }),
    })
  }

  // User profile
  async getUserProfile() {
    return this.request("/user/profile")
  }
}

export const apiClient = new ApiClient()
