# Calculadora y Funnel de Suscripción para Seguros de Salud

Una aplicación web completa que funciona como un funnel de suscripción de seguros de salud con backend y frontend integrados.

## 🚀 Despliegue en Vercel

### Variables de Entorno Requeridas

En tu proyecto de Vercel, configura las siguientes variables:

\`\`\`env
JWT_SECRET=tu-clave-secreta-muy-segura
DATABASE_URL=tu-url-de-base-de-datos-postgresql
\`\`\`

### Configuración de Base de Datos

1. **Neon Database** (Recomendado para Vercel):
   - Crea una cuenta en [Neon](https://neon.tech)
   - Crea una nueva base de datos PostgreSQL
   - Copia la URL de conexión a `DATABASE_URL`

2. **Otras opciones**:
   - Supabase
   - PlanetScale
   - Railway

### Despliegue Automático

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js y desplegará

### Comandos de Build

Vercel ejecutará automáticamente:
\`\`\`bash
npm install
npm run build  # Incluye prisma generate
\`\`\`

## 🛠 Desarrollo Local

### Instalación

\`\`\`bash
# Clonar repositorio
git clone <tu-repositorio>
cd health-insurance-funnel

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Generar cliente Prisma
npm run db:generate

# Sincronizar base de datos
npm run db:push

# Ejecutar en desarrollo
npm run dev
\`\`\`

### Variables de Entorno Locales

Crear `.env.local`:

\`\`\`env
JWT_SECRET=tu-clave-secreta-para-desarrollo
DATABASE_URL="postgresql://usuario:password@localhost:5432/health_insurance"
\`\`\`

## 📊 Características

- 🔐 **Autenticación JWT** con bcrypt
- 🧮 **Calculadora de seguros** con validaciones
- 🚭 **Motor de suscripción** con lógica KO
- 💳 **Sistema de pago** simulado
- ✍️ **Firma digital** de contratos
- 🏠 **Portal de cliente** completo
- 📱 **Responsive design**
- 🗄️ **Base de datos PostgreSQL**

## Tecnologías

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend
- Next.js API Routes
- Prisma ORM
- SQLite Database
- JWT Authentication
- bcryptjs

## Instalación y Configuración

### 1. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar base de datos

\`\`\`bash
# Generar cliente de Prisma
npm run db:generate

# Crear y sincronizar base de datos
npm run db:push
\`\`\`

### 3. Variables de entorno

Crear un archivo \`.env.local\` en la raíz del proyecto:

\`\`\`env
JWT_SECRET=tu-clave-secreta-muy-segura
DATABASE_URL="file:./dev.db"
\`\`\`

### 4. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:3000\`

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/                 # API Routes
│   │   ├── auth/           # Autenticación
│   │   ├── calculator/     # Cálculo de precios
│   │   ├── subscription/   # Motor de suscripción
│   │   ├── payment/        # Procesamiento de pagos
│   │   ├── signature/      # Firma de contratos
│   │   └── user/          # Gestión de usuarios
│   ├── calculator/         # Página de calculadora
│   ├── subscription/       # Página de suscripción
│   ├── payment/           # Página de pago
│   ├── signature/         # Página de firma
│   ├── portal/            # Portal de cliente
│   ├── dashboard/         # Panel de usuario
│   ├── ko/               # Página de rechazo
│   └── page.tsx          # Página de login
├── components/ui/         # Componentes de UI
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── prisma/              # Esquema de base de datos
└── README.md
\`\`\`

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - OAuth Google

### Funcionalidades
- `POST /api/calculator` - Calcular precio
- `POST /api/subscription` - Procesar suscripción
- `POST /api/payment` - Procesar pago
- `POST /api/signature` - Firmar contrato
- `GET /api/user/profile` - Perfil de usuario
- `GET /api/health` - Health check
- `POST /api/init-db` - Inicializar BD

## Flujo de Usuario

1. **Login/Registro** → Autenticación
2. **Calculadora** → Cálculo de precio
3. **Suscripción** → Pregunta fumador
4. **Pago** → Procesamiento
5. **Firma** → Contrato digital
6. **Portal** → Cliente activo

## Características Técnicas

### Base de Datos
- **Usuarios**: Gestión completa de usuarios con estados
- **Leads**: Seguimiento de procesos de suscripción
- **Relaciones**: Un usuario puede tener múltiples leads

### Autenticación
- JWT tokens con expiración de 7 días
- Contraseñas hasheadas con bcrypt
- Middleware de autenticación para rutas protegidas

### Validaciones
- Edad actuarial calculada correctamente
- Validaciones de formularios en frontend y backend
- Restricciones de edad (18-65 años)

### Estados de Usuario
- **Nuevo**: Sin lead activo
- **Con Lead**: Proceso en curso
- **Con Póliza**: Cliente activo
- **KO**: Rechazado (fumador)

## 🔧 Scripts

\`\`\`bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Ejecutar producción
npm run db:push      # Sincronizar BD
npm run db:studio    # Prisma Studio
npm run db:generate  # Generar cliente
\`\`\`

## 👤 Usuario de Prueba

\`\`\`
Email: test@example.com
Contraseña: password123
Código de firma: 1234
\`\`\`

## Producción

Para desplegar en producción:

1. Configurar variables de entorno en tu plataforma
2. Usar una base de datos PostgreSQL o MySQL
3. Ejecutar \`npm run build\`
4. Ejecutar \`npm run start\`

## 🐛 Troubleshooting

### Error de Base de Datos
\`\`\`bash
npm run db:push
npm run db:generate
\`\`\`

### Error de Build en Vercel
- Verificar variables de entorno
- Revisar logs de build
- Verificar conexión a BD

### Error de Autenticación
- Verificar JWT_SECRET
- Limpiar localStorage
- Verificar tokens

## Soporte

Para problemas o preguntas, crear un issue en el repositorio.

## 📞 Soporte

Para problemas:
1. Revisar logs de Vercel
2. Verificar variables de entorno
3. Comprobar conexión a BD
4. Crear issue en GitHub

## 🔒 Seguridad

- Tokens JWT con expiración
- Contraseñas hasheadas
- Validación de entrada
- Sanitización de datos
- CORS configurado
