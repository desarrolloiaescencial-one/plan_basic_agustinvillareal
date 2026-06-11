/* ============================================================
   PRODE ONE — Servicios Externos
   
   Estructura de capas de servicio:
   - sportsApi   → API de deportes (resultados en tiempo real)
   - sheetsApi   → Google Sheets (base de datos)
   - authService → Autenticación de usuarios
   - betsService → CRUD de apuestas y predicciones
   ============================================================ */

export { default as sportsApi }   from './sportsApi.js'
export { default as sheetsApi }   from './sheetsApi.js'
export { default as authService } from './authService.js'
export { default as betsService } from './betsService.js'
