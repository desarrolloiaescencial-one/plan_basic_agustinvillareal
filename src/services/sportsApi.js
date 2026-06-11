/* ── Sports API Service ─────────────────────────────────────
   Integración con la API de deportes externa.
   
   Configurar en .env:
     VITE_SPORTS_API_KEY=tu_api_key
     VITE_SPORTS_API_URL=https://api.ejemplo.com/v1
   ─────────────────────────────────────────────────────────── */

const BASE_URL = import.meta.env.VITE_SPORTS_API_URL || ''
const API_KEY  = import.meta.env.VITE_SPORTS_API_KEY  || ''

const headers = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
})

async function request(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: headers() })
  if (!res.ok) throw new Error(`Sports API error: ${res.status}`)
  return res.json()
}

const sportsApi = {
  /** Obtener partidos programados */
  getScheduledMatches: () => request('/fixtures?status=NS'),

  /** Obtener resultados en tiempo real */
  getLiveMatches: () => request('/fixtures?live=all'),

  /** Obtener resultado de un partido específico */
  getMatchById: (id) => request(`/fixtures/${id}`),

  /** Obtener datos de equipos */
  getTeam: (id) => request(`/teams/${id}`),
}

export default sportsApi
