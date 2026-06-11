/* ── Bets Service ───────────────────────────────────────────
   CRUD de apuestas y predicciones sobre Google Sheets.
   TODO: Implementar lógica real de mapeo de filas.
   ─────────────────────────────────────────────────────────── */
import sheetsApi from './sheetsApi.js'

const betsService = {
  async getAll() {
    const rows = await sheetsApi.getBets()
    return rows.map(r => ({
      id: r[0], title: r[1], type: r[2], prize: r[3],
      deadline: r[4], status: r[5], matchId: r[6],
    }))
  },

  async create(bet) {
    const id = `b_${Date.now()}`
    await sheetsApi.addBet([id, bet.title, bet.type, bet.prize, bet.deadline, 'active', bet.matchId || ''])
    return { ...bet, id, status: 'active' }
  },

  async savePrediction(betId, userId, value) {
    const id = `p_${Date.now()}`
    await sheetsApi.addPrediction([id, betId, userId, value, new Date().toISOString()])
    return { id, betId, userId, value }
  },
}

export default betsService
