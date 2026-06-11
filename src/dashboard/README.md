# Dashboard Nuevo — Instalación completa

## Archivos
```
src/dashboard/
├── AppShell.jsx        ← Navbar navy + layout crema (reemplaza AppLayout+Navbar)
├── DashboardPage.jsx   ← Dashboard
├── BetsPage.jsx        ← Apuestas
├── FixturePage.jsx     ← Fixture / Partidos
├── MisPredesPage.jsx   ← Mis Predicciones
└── RankingPage.jsx     ← Ranking
```

## Paso 1 — Crear carpeta y copiar archivos
Creá `src/dashboard/` y copiá los 6 archivos.

## Paso 2 — Actualizar App.jsx

```jsx
// Reemplazar estos imports:
import DashboardPage        from './pages/DashboardPage.jsx'
import BetsPage             from './pages/BetsPage.jsx'
import PartidosPage         from './pages/PartidosPage.jsx'
import MisPrediccionesPage  from './pages/MisPrediccionesPage.jsx'
import RankingPage          from './pages/RankingPage.jsx'

// Por estos:
import DashboardPage        from './dashboard/DashboardPage.jsx'
import BetsPage             from './dashboard/BetsPage.jsx'
import PartidosPage         from './dashboard/FixturePage.jsx'
import MisPrediccionesPage  from './dashboard/MisPredesPage.jsx'
import RankingPage          from './dashboard/RankingPage.jsx'
```

Las rutas en el Router NO cambian. Solo los imports.

## Paleta usada (misma que homepage)
- Fondo: `#faf7f0`
- Cards: `#fff` con borde `#f0eadb`
- Navbar/Hero: `#0c182b` (navy)
- Texto: `#0c182b` / `#5f6e8a` (muted)
- Accent: `#ebc32b` / `#c99f16` (gold)
- Éxito: `#1b8a5a` / Error: `#e03252`

## Notas
- Sin dependencias nuevas
- Usa `useAuth`, `useBets`, `sheetsApi` exactamente igual que antes
- BetsPage usa el `PredictModal` existente de `components/user/`
- Toasts en lugar de `alert()` nativos
