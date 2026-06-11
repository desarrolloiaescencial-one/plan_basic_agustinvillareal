/* ── Auth Service ───────────────────────────────────────────
   Autenticación de usuarios contra Google Sheets.
   TODO: Implementar lógica real de login/registro.
   ─────────────────────────────────────────────────────────── */
import sheetsApi from './sheetsApi.js'

const authService = {
  async login(email, password) {
    const rows = await sheetsApi.getUsers()
    const user = rows.find(r => r[2] === email)
    if (!user) throw new Error('Usuario no encontrado')
    // TODO: verificar password hasheado
    if (user[6] !== 'true') throw new Error('Cuenta pendiente de aprobación')
    return { id: user[0], name: user[1], email: user[2], role: user[3] }
  },

  async register(name, email, password) {
    // TODO: hashear password antes de guardar
    const id = `u_${Date.now()}`
    await sheetsApi.addUser([id, name, email, 'user', password, new Date().toISOString(), 'false'])
    return { id, name, email, role: 'user', approved: false }
  },
}

export default authService
