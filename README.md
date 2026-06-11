# Prode One

Plataforma de apuestas deportivas con gestión centralizada por administradores.

## Stack

- **Vite 8.0.4** — Build tool y dev server
- **React 19.2.4** — UI
- **Tailwind CSS 4.2.2** — Estilos (via `@tailwindcss/vite`)
- **React Router 7** — Navegación
- **Google Sheets** — Base de datos
- **API de Deportes** — Resultados en tiempo real

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# 3. Iniciar el servidor de desarrollo
npm run dev
```

## Estructura del proyecto

```
src/
├── styles/index.css        # Tokens de diseño centralizados (colores, fuentes, etc.)
├── hooks/
│   ├── useAuth.jsx         # Contexto de autenticación
│   └── useBets.jsx         # Estado de apuestas
├── services/
│   ├── sportsApi.js        # Integración con API deportiva
│   ├── sheetsApi.js        # Google Sheets (base de datos)
│   ├── authService.js      # Login / registro
│   └── betsService.js      # CRUD de apuestas
├── components/
│   ├── ui/                 # Primitivos: Button, Card, Input, Badge
│   ├── layout/             # Navbar, AppLayout
│   ├── user/               # BetCard, PredictModal
│   └── admin/              # CreateBetForm
├── pages/                  # LoginPage, DashboardPage, BetsPage, AdminPage
└── utils/index.js          # Helpers de fecha, estado, etc.
```

## Personalización de diseño

Todos los tokens de diseño están centralizados en `src/styles/index.css`.
Para cambiar colores, fuentes o radios, editá únicamente las variables CSS en `:root`.

## Google Sheets — Estructura esperada

El spreadsheet debe tener 3 hojas con estas columnas:

| Hoja          | Columnas                                                    |
|---------------|-------------------------------------------------------------|
| `Usuarios`    | id, name, email, role, password, createdAt, approved        |
| `Apuestas`    | id, title, type, prize, deadline, status, matchId, notes    |
| `Predicciones`| id, betId, userId, value, createdAt, result                 |

## Roles

| Rol     | Permisos                                              |
|---------|-------------------------------------------------------|
| `admin` | Crear apuestas, aprobar usuarios, ver todo            |
| `user`  | Ver apuestas activas, registrar predicciones          |
