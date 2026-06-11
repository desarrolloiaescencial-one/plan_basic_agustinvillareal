/**
 * RankingWrapper.jsx - CORREGIDO
 * Detecta correctamente si el usuario es admin
 * y renderiza el componente correcto
 */

import RankingPageAdmin from './RankingPageAdmin.jsx'
import RankingPageUser from './RankingPageUser.jsx'
import { useAuth } from '../hooks/useAuth.jsx'

export default function RankingWrapper() {
  const { user, loading, isAdmin } = useAuth()

  // ✅ DEBUG: Descomenta para ver qué está pasando
  console.log('RankingWrapper - User:', user)
  console.log('RankingWrapper - isAdmin:', isAdmin)
  console.log('RankingWrapper - Will render:', isAdmin ? 'RankingPageAdmin' : 'RankingPageUser')

  if (loading) {
    return <div>Cargando...</div>
  }

  // ✅ RENDERIZAR COMPONENTE CORRECTO
  return isAdmin ? <RankingPageAdmin /> : <RankingPageUser />
}