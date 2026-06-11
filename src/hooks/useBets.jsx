import { useState, useCallback, useEffect, useRef } from 'react'
import sheetsApi from '../services/sheetsApi.js'

/* ── Hook de Apuestas ───────────────────────────────────────
   Conectado a sheetsApi → Apps Script → Google Sheets.

   autoLoad:
   - true  => mantiene el comportamiento actual para páginas de usuario.
   - false => evita cargar backend automáticamente. Útil en AdminPage.

   autoLoadPredictions:
   - true  => carga predicciones propias al iniciar.
   - false => evita pedir predicciones propias. Útil en AdminPage.
   ─────────────────────────────────────────────────────────── */

export function useBets({
  autoLoad = true,
  autoLoadPredictions = true,
} = {}) {
  const [bets, setBets] = useState([])
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initialLoadStartedRef = useRef(false)

  const loadBets = useCallback(async (estado = '') => {
    setLoading(true)
    setError(null)

    try {
      const [dataApuestas, dataPartidos] = await Promise.all([
        sheetsApi.apuestas.listar(estado),
        sheetsApi.partidos.listar(),
      ])

      const allMatches = dataPartidos.partidos || []
      setMatches(allMatches)

      const enrichedBets = (dataApuestas.apuestas || []).map(a => {
        const pIds = a.partidos_ids
          ? a.partidos_ids.split(',').map(id => id.trim()).filter(Boolean)
          : []

        const mappedMatches = pIds
          .map(id => allMatches.find(pm => pm.id === id))
          .filter(Boolean)

        return {
          ...a,
          partidos: mappedMatches,
        }
      })

      setBets(enrichedBets)
    } catch (err) {
      setError(err.message || 'Error cargando apuestas')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyPredictions = useCallback(async (apuesta_id = '') => {
    setError(null)

    try {
      const data = await sheetsApi.predicciones.mias(apuesta_id)
      const map = {}

      ;(data.predicciones || []).forEach(p => {
        map[p.partido_id] = p
      })

      setPredictions(map)
    } catch (err) {
      setError(err.message || 'Error cargando predicciones')
    }
  }, [])

  useEffect(() => {
    if (!autoLoad) return
    if (initialLoadStartedRef.current) return

    initialLoadStartedRef.current = true

    loadBets()

    if (autoLoadPredictions) {
      loadMyPredictions()
    }
  }, [autoLoad, autoLoadPredictions, loadBets, loadMyPredictions])

  const savePrediction = useCallback(async (data) => {
    setLoading(true)
    setError(null)

    try {
      await sheetsApi.predicciones.guardar(data)

      setPredictions(prev => ({
        ...prev,
        [data.partido_id]: {
          ...data,
          puntos: '',
        },
      }))
    } catch (err) {
      setError(err.message || 'Error guardando predicción')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createBet = useCallback(async (data) => {
    setLoading(true)
    setError(null)

    try {
      await sheetsApi.apuestas.crear(data)
      await loadBets()
    } catch (err) {
      setError(err.message || 'Error creando apuesta')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  const closeBet = useCallback(async (apuesta_id) => {
    setLoading(true)
    setError(null)

    try {
      await sheetsApi.apuestas.cerrar(apuesta_id)
      await loadBets()
    } catch (err) {
      setError(err.message || 'Error cerrando apuesta')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  const reopenBet = useCallback(async (apuesta_id, nueva_fecha_cierre) => {
    setLoading(true)
    setError(null)

    try {
      await sheetsApi.apuestas.reabrir(apuesta_id, nueva_fecha_cierre)
      await loadBets()
    } catch (err) {
      setError(err.message || 'Error reabriendo apuesta')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  const finalizeBet = useCallback(async (apuesta_id) => {
    setLoading(true)
    setError(null)

    try {
      await sheetsApi.apuestas.finalizar(apuesta_id)
      await loadBets()
    } catch (err) {
      setError(err.message || 'Error finalizando apuesta')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  return {
    bets,
    matches,
    predictions,
    loading,
    error,
    loadBets,
    loadMyPredictions,
    savePrediction,
    createBet,
    closeBet,
    reopenBet,
    finalizeBet,
  }
}