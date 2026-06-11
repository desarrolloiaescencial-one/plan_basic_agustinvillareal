import { useState, useEffect, useCallback, useRef } from 'react'
import sheetsApi from '../services/sheetsApi'

/**
 * Hook SWR personalizado para fixture (y otros endpoints reutilizables)
 * 
 * Estrategia:
 * 1. Lee del localStorage al montar (síncrono, al instante)
 * 2. SIEMPRE hace fetch en background
 * 3. Si hay cambios, actualiza localStorage + UI
 * 4. Si no hay cambios, nada (evita re-renders innecesarios)
 */

const FIXTURE_CACHE_KEY = 'fixture_v1'
const FIXTURE_CACHE_VERSION = '1'
const FIXTURE_CACHE_TTL = 5 * 60 * 1000 // 5 minutos en cache before refetch

export function useFixtureSWR(filters = {}) {
  // Estado del fixture
  const [fixture, setFixture] = useState(() => {
    // PASO 1: Lee del localStorage al inicializar (síncrono)
    try {
      const cached = localStorage.getItem(FIXTURE_CACHE_KEY)
      if (cached) {
        const { version, data, timestamp } = JSON.parse(cached)
        // Validar que el cache sea de la versión correcta
        if (version === FIXTURE_CACHE_VERSION) {
          return data
        }
      }
    } catch (e) {
      console.warn('⚠️ Error leyendo fixture del localStorage:', e)
    }
    return null
  })

  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState(null)
  const fetchControllerRef = useRef(null)

  // Función para guardar en localStorage
  const saveToCache = useCallback((data) => {
    try {
      const payload = {
        version: FIXTURE_CACHE_VERSION,
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(FIXTURE_CACHE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('⚠️ Error guardando fixture a localStorage:', e)
      // Si localStorage se llena, intentar limpiar cache viejo
      if (e.name === 'QuotaExceededError') {
        handleStorageQuotaFull()
      }
    }
  }, [])

  // Función para revalidar (fetch en background)
  const revalidate = useCallback(async () => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort()
    }
    fetchControllerRef.current = new AbortController()

    try {
      setIsValidating(true)
      setError(null)

      // Hacer fetch al backend
      const response = await sheetsApi.partidos.listar(filters)
      
      if (!response.ok) {
        throw new Error(response.error || 'Error al traer partidos')
      }

      const freshData = response.partidos || []

      // PASO 3: Comparar con lo actual
      const currentStr = JSON.stringify(fixture || [])
      const freshStr = JSON.stringify(freshData)

      if (currentStr !== freshStr) {
        // 🔄 Hubo cambios → actualizar localStorage + state
        saveToCache(freshData)
        setFixture(freshData)
        console.log('✅ Fixture actualizado desde backend', freshData.length, 'partidos')
      } else {
        // ✅ Sin cambios → no re-renderizar
        console.log('✅ Fixture ya estaba al día, sin cambios')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('❌ Error revalidando fixture:', err)
        setError(err.message)
      }
    } finally {
      setIsValidating(false)
    }
  }, [fixture, filters, saveToCache])

  // PASO 2: Fetch en background cuando monta o cuando cambian los filtros
  useEffect(() => {
    revalidate()

    // Cleanup
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort()
      }
    }
  }, [revalidate])

  // Bonus: Revalidar cuando la pestaña vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📲 Pestaña visible, revalidando fixture...')
        revalidate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [revalidate])

  return {
    fixture,
    isValidating,
    error,
    revalidate,
    isEmpty: !fixture || fixture.length === 0,
    isLoading: fixture === null && !error,
  }
}

/**
 * Hook genérico SWR para cualquier endpoint GET
 * Uso: const { data, isValidating } = useSWR('apuestas.listar', sheetsApi.apuestas.listar, opts)
 */
export function useSWR(key, fetcher, options = {}) {
  const {
    revalidateOnFocus = true,
    dedupingInterval = 2000,
    focusThrottleInterval = 300000, // 5 min
    cacheKey = null,
    onSuccess = null,
    onError = null,
    ...swrConfig
  } = options

  const [data, setData] = useState(() => {
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { version, value } = JSON.parse(cached)
          return value
        }
      } catch (e) {}
    }
    return null
  })

  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState(null)
  const fetchControllerRef = useRef(null)
  const lastFetchRef = useRef(0)
  const lastFocusRef = useRef(0)

  const saveToCache = useCallback((value) => {
    if (cacheKey) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          version: '1',
          value,
          timestamp: Date.now(),
        }))
      } catch (e) {
        console.warn('⚠️ Error guardando a cache:', e)
      }
    }
  }, [cacheKey])

  const revalidate = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < dedupingInterval) {
      return // Evitar duplicate requests
    }
    lastFetchRef.current = now

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort()
    }
    fetchControllerRef.current = new AbortController()

    try {
      setIsValidating(true)
      const freshData = await fetcher()

      if (!freshData.ok) {
        throw new Error(freshData.error || 'Error en fetch')
      }

      const value = freshData.data || freshData

      // Comparar y actualizar solo si cambió
      const currentStr = JSON.stringify(data)
      const freshStr = JSON.stringify(value)

      if (currentStr !== freshStr) {
        saveToCache(value)
        setData(value)
      }

      setError(null)
      onSuccess?.(value)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        onError?.(err)
      }
    } finally {
      setIsValidating(false)
    }
  }, [fetcher, data, saveToCache, dedupingInterval, onSuccess, onError])

  // Fetch inicial
  useEffect(() => {
    revalidate()
  }, [key])

  // Revalidar al volver a estar visible
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now()
        if (now - lastFocusRef.current > focusThrottleInterval) {
          lastFocusRef.current = now
          revalidate()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [revalidateOnFocus, focusThrottleInterval, revalidate])

  return { data, isValidating, error, revalidate }
}

/**
 * Helper: Invalidar manualmente el cache de fixture
 * Útil después de hacer un POST que modifique partidos
 */
export function invalidateFixtureCache() {
  localStorage.removeItem(FIXTURE_CACHE_KEY)
}

/**
 * Helper: Limpiar storage si está casi lleno (>80%)
 */
export function handleStorageQuotaFull() {
  try {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(estimate => {
        const percentUsed = (estimate.usage / estimate.quota) * 100
        if (percentUsed > 80) {
          console.warn(`⚠️ Storage al ${percentUsed.toFixed(1)}%, limpiando caches...`)
          // Borrar los caches menos críticos
          localStorage.removeItem(FIXTURE_CACHE_KEY)
          localStorage.removeItem('apuestas_cache')
          localStorage.removeItem('predicciones_cache')
        }
      })
    }
  } catch (e) {
    console.warn('Error chequeando storage:', e)
  }
}