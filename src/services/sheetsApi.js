/* ============================================================
   PRODE ONE — API Client (OPTIMIZADO + DIRECTO A APPS SCRIPT)
   - Llama directo a Apps Script (sin pasar por Netlify Function).
   - Cachea respuestas GET en memoria del cliente.
   - Invalida caché en cada POST.
   - Soporta limit en ranking (top N).
   - v2: predicciones.deUsuario(apuesta_id, user_id) para admin/ranking expandido.
   ============================================================ */

// URL directa del deploy de Apps Script.
// Si hacés un nuevo deploy, actualizá esta URL.
const API_URL = 'https://script.google.com/macros/s/AKfycbz65YMyQVFDyKQMO_zCUk6bNVb-24eItIu-gCD61X2Asmue2TS5dTD0QuTw8f67e8VQeA/exec'

// ── Caché de cliente en memoria ────────────────────────────
const CLIENT_CACHE = new Map()
const CLIENT_CACHE_TTL = {
  'areas.listar': 60_000,
  'grupos.listar': 300_000,
  'partidos.listar': 30_000,
  'apuestas.listar': 30_000,
  'predicciones.mis': 15_000,
  'bootstrap': 15_000,
}

function cacheKey(action, params) {
  return action + '|' + JSON.stringify(params || {})
}
function getFromClientCache(action, params) {
  const ttl = CLIENT_CACHE_TTL[action]
  if (!ttl) return null
  const key = cacheKey(action, params)
  const entry = CLIENT_CACHE.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > ttl) {
    CLIENT_CACHE.delete(key)
    return null
  }
  return entry.data
}
function saveToClientCache(action, params, data) {
  if (!CLIENT_CACHE_TTL[action]) return
  CLIENT_CACHE.set(cacheKey(action, params), { ts: Date.now(), data })
}
function invalidateClientCache(prefix = '') {
  if (!prefix) { CLIENT_CACHE.clear(); return }
  for (const key of CLIENT_CACHE.keys()) {
    if (key.startsWith(prefix)) CLIENT_CACHE.delete(key)
  }
}

// ── Helpers de transporte ─────────────────────────────────

async function get(action, params = {}, { useCache = true } = {}) {
  if (useCache) {
    const cached = getFromClientCache(action, params)
    if (cached) return cached
  }
  const token = getToken()
  const qs = new URLSearchParams({
    action,
    ...(token ? { session_token: token } : {}),
    ...params,
  })
  const res = await fetch(`${API_URL}?${qs}`, { method: 'GET' })
  const data = await handleResponse(res)
  if (useCache) saveToClientCache(action, params, data)
  return data
}

async function post(action, data = {}) {
  const token = getToken()
  // IMPORTANTE: para evitar preflight CORS (que duplica la latencia),
  // usamos Content-Type: text/plain. Apps Script igual lee postData.contents.
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action,
      ...(token ? { session_token: token } : {}),
      ...data,
    }),
  })
  const result = await handleResponse(res)
  invalidateClientCache()
  return result
}

async function handleResponse(res) {
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error('Respuesta inválida del servidor')
  }
  if (!data.ok) {
    // Detectar errores de sesión expirada o inválida
    const error = String(data.error || '').toLowerCase()
    const esSesionExpirada =
      error.includes('sesión inválida') ||
      error.includes('sesion invalida') ||
      error.includes('sesión expirada') ||
      error.includes('sesion expirada') ||
      error.includes('se requiere session_token') ||
      error.includes('cuenta no está activa')

    if (esSesionExpirada) {
      // Limpiar todo lo relacionado a la sesión
      try {
        localStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem('prode_user')
        invalidateClientCache()
      } catch (e) { /* noop */ }

      // Si estamos en la app (no en login), avisar y redirigir
      const path = window.location.pathname
      const yaEnLogin = path === '/login' || path === '/' || path === '/home' || path.startsWith('/forgot-password') || path.startsWith('/reset-password')
      if (!yaEnLogin) {
        // Pequeño aviso visual antes del redirect (toast simple)
        mostrarAvisoSesionExpirada()
        setTimeout(() => {
          window.location.href = '/login'
        }, 1200)
        // Igualmente lanzamos el error para frenar el flujo del caller
        throw new Error('Sesión expirada — redirigiendo al login')
      }
    }
    throw new Error(data.error || 'Error desconocido en el servidor')
  }
  return data
}

// ── Aviso visual cuando expira la sesión ─────────────────
let avisoSesionMostrado = false
function mostrarAvisoSesionExpirada() {
  if (avisoSesionMostrado) return // evitar duplicados si varias requests fallan a la vez
  avisoSesionMostrado = true

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(12,24,43,.85);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
    animation: fadeInOverlay .25s ease both;
  `
  overlay.innerHTML = `
    <style>
      @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
    </style>
    <div style="text-align: center; color: #fff; max-width: 320px; padding: 1.5rem;">
      <div style="
        width: 56px; height: 56px; border-radius: 50%;
        background: rgba(235,195,43,.15);
        border: 1px solid rgba(235,195,43,.4);
        margin: 0 auto 1rem;
        display: flex; align-items: center; justify-content: center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ebc32b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <p style="
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.6rem; margin: 0 0 .35rem;
        letter-spacing: .04em;">Sesión expirada</p>
      <p style="font-size: .85rem; color: rgba(255,255,255,.6); margin: 0;">
        Por seguridad, te llevamos al login para que vuelvas a entrar.
      </p>
    </div>
  `
  document.body.appendChild(overlay)
}

// ── Gestión de sesión ─────────────────────────────────────

const TOKEN_KEY = 'prode_session_token'
function getToken() { return localStorage.getItem(TOKEN_KEY) || null }
function saveToken(t) { localStorage.setItem(TOKEN_KEY, t) }
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  invalidateClientCache()
}

// ── Módulos ───────────────────────────────────────────────

const sistema = {
  ping: () => get('ping', {}, { useCache: false }),
}

const bootstrap = {
  cargar: () => get('bootstrap'),
}

const auth = {
  login: async (email, password) => {
    const data = await post('auth.login', { email, password })
    saveToken(data.session_token)
    return data
  },
  logout: async () => {
    try { await post('auth.logout') } finally { clearToken() }
  },
  registro: (nombre, email, password) =>
    post('auth.registro', { nombre, email, password }),

  // Recuperación de contraseña (flujo de 3 pasos)
  resetSolicitar: (email) =>
    post('auth.reset_solicitar', { email }),
  resetValidar: (token) =>
    post('auth.reset_validar', { token }),
  resetConfirmar: (token, password) =>
    post('auth.reset_confirmar', { token, password }),
}

const usuarios = {
  listar: (estado = '') => get('usuarios.listar', estado ? { estado } : {}, { useCache: false }),
  obtener: (user_id) => get('usuarios.obtener', { user_id }, { useCache: false }),
  aprobar: (user_id, tipo_usuario, area_id) => post('usuarios.aprobar', { user_id, tipo_usuario, area_id }),
  rechazar: (user_id) => post('usuarios.rechazar', { user_id }),
  crear: (data) => post('usuarios.crear', data),
}

const apuestas = {
  listar: (estado = '') => get('apuestas.listar', estado ? { estado } : {}),
  obtener: (apuesta_id) => get('apuestas.obtener', { apuesta_id }),
  crear: (data) => post('apuestas.crear', data),
  cerrar: (apuesta_id) => post('apuestas.cerrar', { apuesta_id }),
  reabrir: (apuesta_id, nueva_fecha_cierre) => post('apuestas.reabrir', { apuesta_id, nueva_fecha_cierre }),
  finalizar: (apuesta_id) => post('apuestas.finalizar', { apuesta_id }),
  /**
   * NUEVO: Finaliza en lote todas las apuestas cerradas que tengan
   * todos sus partidos finalizados con resultados cargados.
   * Devuelve { finalizadas, no_listas, resumen }.
   */
  finalizar_listas: () => post('apuestas.finalizar_listas', {}),
}

const partidos = {
  listar: ({ estado, fase, grupo, jornada } = {}) => {
    const params = {}
    if (estado) params.estado = estado
    if (fase) params.fase = fase
    if (grupo) params.grupo = grupo
    if (jornada) params.jornada = jornada
    return get('partidos.listar', params)
  },
  obtener: (partido_id) => get('partidos.obtener', { partido_id }),
  actualizar: (data) => post('partidos.actualizar', data),
  sincronizar: (filtros = {}) => get('partidos.sincronizar', filtros, { useCache: false }),
}

const predicciones = {
  guardar: (data) => post('predicciones.guardar', data),
  mias: (apuesta_id = '') => get('predicciones.mis', apuesta_id ? { apuesta_id } : {}),

  /**
   * NUEVO v2: predicciones de un usuario específico para una apuesta.
   * - Si user_id es el propio: funciona para cualquier rol.
   * - Si user_id es de otro: solo funciona si el caller es admin (lo valida el backend).
   * Usado por el ranking expandido.
   */
  deUsuario: (apuesta_id, user_id) =>
    get('predicciones.mis', { apuesta_id, user_id }, { useCache: false }),

  // Ranking: acepta { limit } para top N. Default 50.
  // Devuelve: { tabla, total, mi_posicion, esta_en_top, apuesta_titulo }
  tabla: (apuesta_id, opciones = {}) => {
    const params = { apuesta_id }
    if (opciones.limit) params.limit = opciones.limit
    return get('predicciones.tabla', params, { useCache: false })
  },
}

const grupos = {
  listar: () => get('grupos.listar'),
}

const areas = {
  listar: (solo_activas = true) => get('areas.listar', { solo_activas }),
  crear: (data) => post('areas.crear', data),
  editar: (data) => post('areas.editar', data),
  toggle_activa: (area_id) => post('areas.toggle_activa', { area_id }),
}


// ✅ Equipos
const equipos = {
  listar: () => get('listarEquipos'),
}

// ── Export ────────────────────────────────────────────────

const sheetsApi = {
  sistema,
  bootstrap,
  auth,
  usuarios,
  apuestas,
  partidos,
  predicciones,
  grupos,
  areas,
  equipos,
  _token: { get: getToken, save: saveToken, clear: clearToken },
  _cache: { invalidate: invalidateClientCache },
}

export default sheetsApi