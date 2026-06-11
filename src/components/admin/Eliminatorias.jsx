import { useState, useMemo, useEffect } from 'react'
import sheetsApi from '../../services/sheetsApi.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useToast } from '../../hooks/useToast.jsx'
import { fmtFecha, inputLocalAIsoUtc } from '../../utils/index.js'

/* ── Constantes ─────────────────────────────────────────── */
const INITIAL = { titulo: '', type: 'libre', premio: '', fecha_cierre: '', partidos_ids: [], areas_ids: [] }

// ✅ Mundial 2026 tiene 48 equipos: Fase de Grupos → 16avos (32 equipos) → Octavos (16 equipos) → etc.
const ORDEN_FASES = ['grupos', '16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const LABEL_FASE = {
  grupos: 'Fase de Grupos', 
  '16avos': 'Dieciseisavos de Final', 
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final', 
  semis: 'Semifinales', 
  '3er_puesto': 'Tercer y Cuarto Puesto', 
  final: 'Final'
}

function isTBD(m) {
  return !m.equipo_local || !m.equipo_visitante ||
    m.equipo_local === 'TBD' || m.equipo_visitante === 'TBD' ||
    m.codigo_local === 'TBD' || m.codigo_visitante === 'TBD'
}

function estaDisponible(m) { return m.estado === 'programado' }

function partidoYaTerminado(partido) {
  if (!partido.fecha_partido) return false
  const fechaPartido = new Date(partido.fecha_partido)
  const ahora = new Date()
  const partidoTerminado = new Date(fechaPartido.getTime() + (2 * 60 * 60 * 1000))
  return ahora >= partidoTerminado
}

function faseYaTerminada(partidos, fase) {
  const partidosDeFase = partidos.filter(p => p.fase === fase)
  if (partidosDeFase.length === 0) return false
  return partidosDeFase.every(p => partidoYaTerminado(p) || p.estado === 'finalizado')
}

/* ── Sub-componentes de UI internos ─────────────────────── */
function Field({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body font-bold text-xs uppercase tracking-widest"
        style={{ color: error ? '#e03252' : '#5f6e8a' }}>
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none transition-all"
        style={{ 
          background: '#fff', 
          border: `1px solid ${error ? '#e03252' : '#e8dfd0'}`, 
          color: '#0c182b' 
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? '#e03252' : '#ebc32b'
          e.target.style.boxShadow = error 
            ? '0 0 0 3px rgba(224,50,82,.12)' 
            : '0 0 0 3px rgba(235,195,43,.12)'
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#e03252' : '#e8dfd0'
          e.target.style.boxShadow = 'none'
        }}
      />
      {error && (
        <span className="font-body text-xs" style={{ color: '#e03252' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 rounded-full font-body font-semibold transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        fontSize: 11,
        background: active ? '#0c182b' : '#fff',
        border: `1px solid ${active ? '#0c182b' : '#e8dfd0'}`,
        color: active ? '#ebc32b' : '#5f6e8a',
      }}
      onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.borderColor = '#0c182b'; e.currentTarget.style.color = '#0c182b' } }}
      onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.borderColor = '#e8dfd0'; e.currentTarget.style.color = '#5f6e8a' } }}
    >
      {children}
    </button>
  )
}

/* ── Componente principal ───────────────────────────────── */
export default function CreateBetForm({ onSubmit, loading, matches = [] }) {
  const { isPro } = useAuth()
  const { toast } = useToast()
  const [form, setForm] = useState(INITIAL)
  const [areas, setAreas] = useState([])
  const [filtroFase, setFiltroFase] = useState('todas')
  const [filtroJornada, setFiltroJornada] = useState('todas')
  const [filtroGrupo, setFiltroGrupo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [errorFecha, setErrorFecha] = useState('')

  useEffect(() => {
    sheetsApi.areas.listar(true).then(res => setAreas(res.areas || [])).catch(console.error)
  }, [])

  const partidosDisponibles = useMemo(
    () => matches.filter(m => estaDisponible(m)),
    [matches]
  )

  const fasesDisponibles = useMemo(() => {
    const set = new Set(partidosDisponibles.map(m => m.fase).filter(Boolean))
    return ORDEN_FASES.filter(f => set.has(f))
  }, [partidosDisponibles])

  const gruposDisponibles = useMemo(() => {
    const rel = filtroFase === 'todas' ? partidosDisponibles : partidosDisponibles.filter(m => m.fase === filtroFase)
    return [...new Set(rel.map(m => m.grupo).filter(Boolean))].sort()
  }, [partidosDisponibles, filtroFase])

  const jornadasDisponibles = useMemo(() => {
    const rel = filtroFase === 'todas' ? partidosDisponibles : partidosDisponibles.filter(m => m.fase === filtroFase)
    return [...new Set(rel.map(m => m.jornada).filter(j => j !== '' && j !== null && j !== undefined).map(String))].sort()
  }, [partidosDisponibles, filtroFase])

  const partidosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return partidosDisponibles.filter(m => {
      if (filtroFase !== 'todas' && m.fase !== filtroFase) return false
      if (filtroJornada !== 'todas' && String(m.jornada) !== filtroJornada) return false
      if (filtroGrupo !== 'todos' && m.grupo !== filtroGrupo) return false
      if (q && !(`${m.equipo_local} ${m.equipo_visitante}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [partidosDisponibles, filtroFase, filtroJornada, filtroGrupo, busqueda])

  const agrupados = useMemo(() => {
    const map = {}
    partidosFiltrados.forEach(m => {
      const f = m.fase || 'otros'
      const j = m.jornada ? `Jornada ${m.jornada}` : ''
      const g = m.grupo ? `Grupo ${m.grupo}` : ''
      const key = `${f}|${j}|${g}`
      if (!map[key]) map[key] = { fase: f, jornada: j, grupo: g, partidos: [] }
      map[key].partidos.push(m)
    })
    const order = new Map(ORDEN_FASES.map((f, i) => [f, i]))
    return Object.values(map).sort((a, b) => {
      const oa = order.get(a.fase) ?? 99, ob = order.get(b.fase) ?? 99
      if (oa !== ob) return oa - ob
      if (a.jornada !== b.jornada) return a.jornada.localeCompare(b.jornada)
      return a.grupo.localeCompare(b.grupo)
    })
  }, [partidosFiltrados])

  const seleccionados = form.partidos_ids.length

  useEffect(() => {
    if (!form.fecha_cierre || form.partidos_ids.length === 0) {
      setErrorFecha('')
      return
    }

    const fechaLimite = new Date(form.fecha_cierre)
    const partidosSeleccionados = partidosDisponibles.filter(m => form.partidos_ids.includes(m.id))
    
    const partidoMasTemprano = partidosSeleccionados.reduce((earliest, current) => {
      const currentDate = new Date(current.fecha_partido)
      const earliestDate = new Date(earliest.fecha_partido)
      return currentDate < earliestDate ? current : earliest
    }, partidosSeleccionados[0])

    const fechaPrimerPartido = new Date(partidoMasTemprano.fecha_partido)

    if (fechaLimite >= fechaPrimerPartido) {
      setErrorFecha(`La fecha límite debe ser ANTES del ${fmtFecha(partidoMasTemprano.fecha_partido)} (${partidoMasTemprano.equipo_local} vs ${partidoMasTemprano.equipo_visitante})`)
    } else {
      setErrorFecha('')
    }
  }, [form.fecha_cierre, form.partidos_ids, partidosDisponibles])

  function toggleMatch(id) {
    setForm(prev => ({
      ...prev,
      partidos_ids: prev.partidos_ids.includes(id)
        ? prev.partidos_ids.filter(x => x !== id)
        : [...prev.partidos_ids, id]
    }))
  }

  function toggleVisibles() {
    const ids = partidosFiltrados.map(m => m.id)
    const todos = ids.every(id => form.partidos_ids.includes(id))
    setForm(prev => ({
      ...prev,
      partidos_ids: todos
        ? prev.partidos_ids.filter(id => !ids.includes(id))
        : [...new Set([...prev.partidos_ids, ...ids])]
    }))
  }

  function limpiarSeleccion() { 
    setForm(prev => ({ ...prev, partidos_ids: [] }))
    setErrorFecha('')
  }

  function handleChangeFase(f) { 
    setFiltroFase(f)
    setFiltroJornada('todas')
    setFiltroGrupo('todos')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (form.partidos_ids.length === 0) {
      toast.error('Seleccioná al menos un partido para la apuesta.')
      return
    }

    if (errorFecha) {
      toast.error('Corregí la fecha límite antes de continuar.')
      return
    }

    try {
      const payload = {
        titulo: form.titulo,
        tipo: form.type,
        premio: form.premio,
        fecha_cierre: inputLocalAIsoUtc(form.fecha_cierre),
        partidos_ids: form.partidos_ids.join(',')
      }
      if (isPro && form.type === 'grupos') {
        if (form.areas_ids.length < 2) { 
          toast.error('Para apuestas por áreas seleccioná al menos 2 áreas.')
          return 
        }
        payload.areas_ids = form.areas_ids.join(',')
      }
      await onSubmit(payload)
      toast.success('Apuesta creada exitosamente')
      setForm(INITIAL)
      setFiltroFase('todas')
      setFiltroJornada('todas')
      setFiltroGrupo('todos')
      setBusqueda('')
      setErrorFecha('')
    } catch (err) { 
      toast.error('Error al crear apuesta: ' + err.message) 
    }
  }

  const canSubmit = !loading && seleccionados > 0 && !errorFecha

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Título + Tipo en una fila */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <Field
          label="Título de la apuesta"
          value={form.titulo}
          onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
          required
          placeholder="Ej: Fase de grupos · Jornada 1"
        />

        {/* Tipo — solo Plan Pro */}
        {isPro && (
          <div className="flex flex-col gap-1.5">
            <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
              Tipo
            </span>
            <div className="flex gap-2">
              {['libre', 'grupos'].map(t => {
                const active = form.type === t
                return (
                  <button key={t} type="button"
                    onClick={() => setForm(p => ({ ...p, type: t }))}
                    className="flex-1 py-2.5 rounded-xl font-body font-semibold text-sm transition-all"
                    style={{
                      background: active ? '#0c182b' : '#fff',
                      border: `1px solid ${active ? '#0c182b' : '#e8dfd0'}`,
                      color: active ? '#ebc32b' : '#5f6e8a',
                    }}>
                    {t === 'grupos' ? 'Por Áreas' : 'Libre'}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Áreas — solo Plan Pro y tipo grupos */}
      {isPro && form.type === 'grupos' && (
        <div className="flex flex-col gap-2 p-3 rounded-xl"
          style={{ border: '1px solid rgba(235,195,43,.25)', background: 'rgba(235,195,43,.04)' }}>
          <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
            Áreas participantes (Mín. 2)
          </span>
          <div className="flex flex-wrap gap-2">
            {areas.map(a => {
              const active = form.areas_ids.includes(a.id)
              return (
                <FilterChip key={a.id} active={active}
                  onClick={() => setForm(p => ({
                    ...p,
                    areas_ids: active
                      ? p.areas_ids.filter(id => id !== a.id)
                      : [...p.areas_ids, a.id]
                  }))}>
                  {a.nombre}
                </FilterChip>
              )
            })}
          </div>
        </div>
      )}

      {/* Partidos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
            Partidos
          </span>
          <span className="font-body text-xs" style={{ color: '#a8b2c4' }}>
            <span className="font-bold" style={{ color: '#c99f16' }}>{seleccionados}</span>
            {' / '}{partidosDisponibles.length} seleccionados
          </span>
        </div>

        {/* Filtros de Fase - ahora en 4 columnas */}
        {fasesDisponibles.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-body font-semibold text-xs uppercase tracking-wider"
              style={{ color: '#a8b2c4' }}>Fases</span>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleChangeFase('todas')}
                className="px-3 py-2 rounded-lg font-body font-semibold text-sm transition-all"
                style={{
                  background: filtroFase === 'todas' ? '#0c182b' : '#fff',
                  border: `1px solid ${filtroFase === 'todas' ? '#0c182b' : '#e8dfd0'}`,
                  color: filtroFase === 'todas' ? '#ebc32b' : '#5f6e8a',
                }}
              >
                Todas las fases
              </button>
              {fasesDisponibles.map(f => {
                const terminada = faseYaTerminada(partidosDisponibles, f)
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => handleChangeFase(f)}
                    className="px-3 py-2 rounded-lg font-body font-semibold text-sm transition-all relative"
                    style={{
                      background: filtroFase === f ? '#0c182b' : '#fff',
                      border: `1px solid ${filtroFase === f ? '#0c182b' : '#e8dfd0'}`,
                      color: filtroFase === f ? '#ebc32b' : '#5f6e8a',
                    }}
                  >
                    {LABEL_FASE[f] || f}
                    {terminada && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full font-body font-bold uppercase"
                        style={{ 
                          fontSize: 8, 
                          background: '#e03252', 
                          color: '#fff',
                          letterSpacing: '.05em'
                        }}>
                        Finalizada
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filtros de Jornada y Grupo en una fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jornadasDisponibles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-body font-semibold uppercase w-14"
                style={{ fontSize: 10, color: '#a8b2c4', letterSpacing: '.1em' }}>Jornada</span>
              <FilterChip active={filtroJornada === 'todas'} onClick={() => setFiltroJornada('todas')}>Todas</FilterChip>
              {jornadasDisponibles.map(j => (
                <FilterChip key={j} active={filtroJornada === j} onClick={() => setFiltroJornada(j)}>{j}</FilterChip>
              ))}
            </div>
          )}

          {gruposDisponibles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-body font-semibold uppercase w-14"
                style={{ fontSize: 10, color: '#a8b2c4', letterSpacing: '.1em' }}>Grupo</span>
              <FilterChip active={filtroGrupo === 'todos'} onClick={() => setFiltroGrupo('todos')}>Todos</FilterChip>
              {gruposDisponibles.map(g => (
                <FilterChip key={g} active={filtroGrupo === g} onClick={() => setFiltroGrupo(g)}>{g}</FilterChip>
              ))}
            </div>
          )}
        </div>

        {/* Búsqueda */}
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar equipo..."
          className="w-full px-3 py-2 rounded-xl font-body text-sm outline-none transition-all"
          style={{ background: '#fff', border: '1px solid #e8dfd0', color: '#0c182b' }}
          onFocus={e => { e.target.style.borderColor = '#ebc32b'; e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.12)' }}
          onBlur={e => { e.target.style.borderColor = '#e8dfd0'; e.target.style.boxShadow = 'none' }}
        />

        {/* Acciones */}
        <div className="flex items-center justify-between gap-2 text-xs font-body">
          <button type="button" onClick={toggleVisibles} disabled={partidosFiltrados.length === 0}
            className="transition-colors disabled:opacity-40" style={{ color: '#c99f16' }}
            onMouseEnter={e => { if (partidosFiltrados.length > 0) e.currentTarget.style.color = '#ebc32b' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#c99f16' }}>
            {partidosFiltrados.every(m => form.partidos_ids.includes(m.id)) && partidosFiltrados.length > 0
              ? `✕ Deseleccionar visibles (${partidosFiltrados.length})`
              : `✓ Seleccionar visibles (${partidosFiltrados.length})`}
          </button>
          {seleccionados > 0 && (
            <button type="button" onClick={limpiarSeleccion}
              className="transition-colors" style={{ color: '#a8b2c4' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e03252' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#a8b2c4' }}>
              Limpiar selección
            </button>
          )}
        </div>

        {/* Lista de partidos - más alta */}
        <div className="max-h-80 overflow-y-auto rounded-xl"
          style={{ background: '#faf7f0', border: '1px solid #e8dfd0' }}>
          {agrupados.length === 0 ? (
            <p className="font-body text-xs text-center p-4" style={{ color: '#a8b2c4' }}>
              No hay partidos que coincidan.
            </p>
          ) : agrupados.map(gr => {
            const header = [LABEL_FASE[gr.fase] || gr.fase, gr.jornada, gr.grupo].filter(Boolean).join(' · ')
            return (
              <div key={`${gr.fase}-${gr.jornada}-${gr.grupo}`}>
                <div className="px-3 py-1.5 flex items-center justify-between sticky top-0 z-10"
                  style={{ background: '#0c182b', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <span className="font-body font-semibold uppercase"
                    style={{ fontSize: 10, color: 'rgba(235,195,43,.8)', letterSpacing: '.1em' }}>
                    {header}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{gr.partidos.length}</span>
                </div>

                {gr.partidos.map(m => {
                  const checked = form.partidos_ids.includes(m.id)
                  return (
                    <label key={m.id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
                      style={{
                        background: checked ? 'rgba(235,195,43,.08)' : 'transparent',
                        borderBottom: '1px solid #f0eadb',
                      }}
                      onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(12,24,43,.04)' }}
                      onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center"
                        style={{
                          border: `1.5px solid ${checked ? '#ebc32b' : '#e8dfd0'}`,
                          background: checked ? '#ebc32b' : 'transparent',
                          transition: 'all .15s',
                        }}>
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#05090f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMatch(m.id)}
                        className="sr-only"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-body text-sm" style={{ color: '#0c182b' }}>
                          {m.bandera_local && <img src={m.bandera_local} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                          <span className="truncate">{m.equipo_local}</span>
                          <span style={{ color: '#a8b2c4', fontSize: 11 }}>vs</span>
                          {m.bandera_visitante && <img src={m.bandera_visitante} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                          <span className="truncate">{m.equipo_visitante}</span>
                        </div>
                      </div>
                      <span className="font-body whitespace-nowrap" style={{ fontSize: 10, color: '#a8b2c4' }}>
                        {fmtFecha(m.fecha_partido)}
                      </span>
                    </label>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Premio + Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Premio / Incentivo"
          value={form.premio}
          onChange={e => setForm(p => ({ ...p, premio: e.target.value }))}
          required
          placeholder="Ej: Gift card $50"
        />
        <Field
          label="Fecha límite (debe ser ANTES del primer partido)"
          type="datetime-local"
          value={form.fecha_cierre}
          onChange={e => setForm(p => ({ ...p, fecha_cierre: e.target.value }))}
          error={errorFecha}
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full mt-1 py-3.5 rounded-full font-body font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? '#0c182b' : 'rgba(12,24,43,.2)',
          color: canSubmit ? '#ebc32b' : '#a8b2c4',
          boxShadow: canSubmit ? '0 4px 16px rgba(12,24,43,.2)' : 'none',
        }}
        onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.background = '#17376a'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
        onMouseLeave={e => { if (canSubmit) { e.currentTarget.style.background = '#0c182b'; e.currentTarget.style.transform = '' } }}
      >
        {loading
          ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Creando...</>
          : <>Crear Apuesta{seleccionados > 0 && ` · ${seleccionados} partidos`}</>
        }
      </button>
    </form>
  )
}