import { useState, useMemo, useEffect } from 'react'
import sheetsApi from '../../services/sheetsApi.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useToast } from '../../hooks/useToast.jsx'
import { fmtFecha, inputLocalAIsoUtc } from '../../utils/index.js'

/* ── Constantes ─────────────────────────────────────────── */
const INITIAL = { titulo: '', type: 'libre', premio: '', fecha_cierre: '', partidos_ids: [], areas_ids: [] }

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
        className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
        style={{ 
          background: '#fff', 
          border: `1.5px solid ${error ? '#e03252' : '#f0eadb'}`, 
          color: '#0a1226' 
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? '#e03252' : '#ebc32b'
          e.target.style.boxShadow = error 
            ? '0 0 0 3px rgba(224,50,82,.08)' 
            : '0 0 0 3px rgba(235,195,43,.08)'
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#e03252' : '#f0eadb'
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
      className="px-3 py-1.5 rounded-lg font-body font-semibold text-xs transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: active ? '#0a1226' : '#fff',
        border: `1.5px solid ${active ? '#0a1226' : '#f0eadb'}`,
        color: active ? '#ebc32b' : '#5f6e8a',
      }}
      onMouseEnter={e => { 
        if (!active && !disabled) { 
          e.currentTarget.style.borderColor = '#ebc32b'
          e.currentTarget.style.color = '#c99f16'
        } 
      }}
      onMouseLeave={e => { 
        if (!active && !disabled) { 
          e.currentTarget.style.borderColor = '#f0eadb'
          e.currentTarget.style.color = '#5f6e8a'
        } 
      }}
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
  const [primerPartido, setPrimerPartido] = useState(null)

  useEffect(() => {
    sheetsApi.areas.listar(true).then(res => setAreas(res.areas || [])).catch(console.error)
  }, [])

  const partidosDisponibles = useMemo(
    () => matches.filter(m => !isTBD(m) && estaDisponible(m)),
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
    if (form.partidos_ids.length === 0) {
      setErrorFecha('')
      setPrimerPartido(null)
      return
    }

    const partidosSeleccionados = partidosDisponibles.filter(m => form.partidos_ids.includes(m.id))
    if (partidosSeleccionados.length === 0) {
      setErrorFecha('')
      setPrimerPartido(null)
      return
    }

    const partidoMasTemprano = partidosSeleccionados.reduce((earliest, current) => {
      const currentDate = new Date(current.fecha_partido)
      const earliestDate = new Date(earliest.fecha_partido)
      return currentDate < earliestDate ? current : earliest
    }, partidosSeleccionados[0])

    setPrimerPartido(partidoMasTemprano)

    if (!form.fecha_cierre) {
      setErrorFecha('')
      return
    }

    const fechaLimite = new Date(form.fecha_cierre)
    const fechaPrimerPartido = new Date(partidoMasTemprano.fecha_partido)

    if (fechaLimite >= fechaPrimerPartido) {
      setErrorFecha(`La fecha límite debe ser ANTES del ${fmtFecha(partidoMasTemprano.fecha_partido)} (${partidoMasTemprano.equipo_local} vs ${partidoMasTemprano.equipo_visitante})`)
    } else if (fechaLimite.getTime() <= Date.now()) {
      setErrorFecha('La fecha límite debe ser futura.')
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
    setPrimerPartido(null)
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
      setPrimerPartido(null)
    } catch (err) { 
      toast.error('Error al crear apuesta: ' + err.message) 
    }
  }

  const canSubmit = !loading && seleccionados > 0 && !errorFecha && form.fecha_cierre

  const maxFechaCierre = useMemo(() => {
    if (!primerPartido) return ''
    const fecha = new Date(primerPartido.fecha_partido)
    fecha.setMinutes(fecha.getMinutes() - 2)
    const yyyy = fecha.getFullYear()
    const mm = String(fecha.getMonth() + 1).padStart(2, '0')
    const dd = String(fecha.getDate()).padStart(2, '0')
    const hh = String(fecha.getHours()).padStart(2, '0')
    const mi = String(fecha.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }, [primerPartido])

  const minFechaCierre = useMemo(() => {
    const ahora = new Date()
    ahora.setMinutes(ahora.getMinutes() + 1)
    const yyyy = ahora.getFullYear()
    const mm = String(ahora.getMonth() + 1).padStart(2, '0')
    const dd = String(ahora.getDate()).padStart(2, '0')
    const hh = String(ahora.getHours()).padStart(2, '0')
    const mi = String(ahora.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }, [primerPartido])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Título */}
      <Field
        label="Título de la apuesta"
        value={form.titulo}
        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
        required
        placeholder="Ej: Fase de grupos · Jornada 1"
      />

      {/* ── SECCIÓN PARTIDOS ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
            Partidos
          </span>
          <span className="font-body text-xs" style={{ color: '#a8b2c4' }}>
            <span className="font-bold" style={{ color: seleccionados > 0 ? '#c99f16' : '#a8b2c4' }}>
              {seleccionados}
            </span>
            {' / '}{partidosDisponibles.length} seleccionados
          </span>
        </div>

        {/* Filtros de Fase */}
        {fasesDisponibles.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-body font-semibold text-xs uppercase tracking-wider"
              style={{ color: '#a8b2c4' }}>Fases</span>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={filtroFase === 'todas'} onClick={() => handleChangeFase('todas')}>
                Todas las fases
              </FilterChip>
              {fasesDisponibles.map(f => (
                <FilterChip key={f} active={filtroFase === f} onClick={() => handleChangeFase(f)}>
                  {LABEL_FASE[f] || f}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        {/* Filtros de Jornada + Grupo */}
        <div className="flex flex-wrap gap-3">
          {jornadasDisponibles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-body font-semibold uppercase text-[10px]"
                style={{ color: '#a8b2c4', letterSpacing: '.1em', minWidth: 60 }}>Jornada</span>
              <FilterChip active={filtroJornada === 'todas'} onClick={() => setFiltroJornada('todas')}>Todas</FilterChip>
              {jornadasDisponibles.map(j => (
                <FilterChip key={j} active={filtroJornada === j} onClick={() => setFiltroJornada(j)}>{j}</FilterChip>
              ))}
            </div>
          )}

          {gruposDisponibles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-body font-semibold uppercase text-[10px]"
                style={{ color: '#a8b2c4', letterSpacing: '.1em', minWidth: 50 }}>Grupo</span>
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
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{ background: '#fff', border: '1.5px solid #f0eadb', color: '#0a1226' }}
          onFocus={e => { 
            e.target.style.borderColor = '#ebc32b'
            e.target.style.boxShadow = '0 0 0 3px rgba(235,195,43,.08)' 
          }}
          onBlur={e => { 
            e.target.style.borderColor = '#f0eadb'
            e.target.style.boxShadow = 'none' 
          }}
        />

        {/* Acciones rápidas */}
        <div className="flex items-center justify-between gap-2 text-xs font-body">
          <button type="button" onClick={toggleVisibles} disabled={partidosFiltrados.length === 0}
            className="transition-colors disabled:opacity-40 font-semibold" style={{ color: '#c99f16' }}
            onMouseEnter={e => { if (partidosFiltrados.length > 0) e.currentTarget.style.color = '#ebc32b' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#c99f16' }}>
            {partidosFiltrados.every(m => form.partidos_ids.includes(m.id)) && partidosFiltrados.length > 0
              ? `✕ Deseleccionar visibles`
              : `✓ Seleccionar visibles`}
          </button>
          {seleccionados > 0 && (
            <button type="button" onClick={limpiarSeleccion}
              className="transition-colors font-semibold" style={{ color: '#a8b2c4' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e03252' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#a8b2c4' }}>
              Limpiar selección ({seleccionados})
            </button>
          )}
        </div>

        {/* Lista de partidos con scroll */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1.5px solid #f0eadb', boxShadow: '0 2px 8px rgba(12,24,43,0.04)' }}>
          <div className="max-h-96 overflow-y-auto"
            style={{ 
              background: '#fafafa',
              scrollbarWidth: 'thin',
              scrollbarColor: '#e8dfd0 transparent'
            }}>
            {agrupados.length === 0 ? (
              <div className="text-center py-16"
                style={{ background: '#fff' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e8dfd0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <p className="font-body text-sm" style={{ color: '#a8b2c4' }}>
                  No hay partidos que coincidan con los filtros.
                </p>
              </div>
            ) : agrupados.map(gr => {
              const header = [LABEL_FASE[gr.fase] || gr.fase, gr.jornada, gr.grupo].filter(Boolean).join(' · ')
              const faseTerminada = faseYaTerminada(partidosDisponibles, gr.fase)
              
              return (
                <div key={`${gr.fase}-${gr.jornada}-${gr.grupo}`}>
                  {/* Header de grupo */}
                  <div className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #0a1226 0%, #1a2540 100%)', borderBottom: '1px solid rgba(235,195,43,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center font-display font-bold text-xs"
                        style={{ background: '#ebc32b', color: '#0a1226' }}>
                        {gr.partidos.length}
                      </span>
                      <span className="font-body font-bold uppercase text-xs tracking-wider"
                        style={{ color: '#ebc32b' }}>
                        {header}
                      </span>
                    </div>
                    {faseTerminada && (
                      <span className="px-2 py-0.5 rounded-full font-body font-bold uppercase text-[8px]"
                        style={{ background: '#e03252', color: '#fff', letterSpacing: '.08em' }}>
                        Finalizada
                      </span>
                    )}
                  </div>

                  {/* Lista de partidos */}
                  {gr.partidos.map(m => {
                    const checked = form.partidos_ids.includes(m.id)
                    const yaTermino = partidoYaTerminado(m)
                    
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                        style={{
                          background: checked ? 'rgba(235,195,43,0.08)' : '#fff',
                          borderBottom: '1px solid #f5f5f5',
                          opacity: yaTermino ? 0.5 : 1,
                          cursor: yaTermino ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={e => { 
                          if (!checked && !yaTermino) e.currentTarget.style.background = 'rgba(235,195,43,0.04)' 
                        }}
                        onMouseLeave={e => { 
                          if (!checked && !yaTermino) e.currentTarget.style.background = '#fff' 
                        }}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => !yaTermino && toggleMatch(m.id)}
                          disabled={yaTermino}
                          className="hidden"
                        />
                        <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
                          style={{
                            border: `2px solid ${checked ? '#ebc32b' : '#e8dfd0'}`,
                            background: checked ? '#ebc32b' : '#fff',
                          }}>
                          {checked && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a1226" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>

                        {/* Equipos */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {m.bandera_local && (
                            <img src={m.bandera_local} alt="" 
                              className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                          )}
                          <span className="font-body font-semibold text-sm truncate"
                            style={{ color: '#0a1226' }}>
                            {m.equipo_local}
                          </span>
                          
                          <span className="font-body text-xs flex-shrink-0"
                            style={{ color: '#a8b2c4' }}>
                            vs
                          </span>
                          
                          {m.bandera_visitante && (
                            <img src={m.bandera_visitante} alt="" 
                              className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                          )}
                          <span className="font-body font-semibold text-sm truncate"
                            style={{ color: '#0a1226' }}>
                            {m.equipo_visitante}
                          </span>
                        </div>

                        {/* Fecha */}
                        <span className="text-[11px] font-body px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0"
                          style={{ 
                            background: yaTermino ? 'rgba(224,50,82,0.08)' : 'rgba(95,110,138,0.08)', 
                            color: yaTermino ? '#e03252' : '#5f6e8a'
                          }}>
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
      </div>

      {/* Tipo — solo Plan Pro */}
      {isPro && (
        <div className="flex flex-col gap-2">
          <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#5f6e8a' }}>
            Tipo de apuesta
          </span>
          <div className="grid grid-cols-2 gap-3">
            {['libre', 'grupos'].map(t => {
              const active = form.type === t
              return (
                <button key={t} type="button"
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  className="py-3 rounded-xl font-body font-semibold text-sm transition-all"
                  style={{
                    background: active ? '#0a1226' : '#fff',
                    border: `1.5px solid ${active ? '#0a1226' : '#f0eadb'}`,
                    color: active ? '#ebc32b' : '#5f6e8a',
                  }}>
                  {t === 'grupos' ? 'Por Áreas' : 'Libre'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Áreas — solo Plan Pro y tipo grupos */}
      {isPro && form.type === 'grupos' && (
        <div className="flex flex-col gap-3 p-4 rounded-xl"
          style={{ border: '1.5px solid rgba(235,195,43,.2)', background: 'rgba(235,195,43,.04)' }}>
          <span className="font-body font-bold text-xs uppercase tracking-widest" style={{ color: '#c99f16' }}>
            Áreas participantes (Mínimo 2)
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

      {/* Premio + Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Premio / Incentivo"
          value={form.premio}
          onChange={e => setForm(p => ({ ...p, premio: e.target.value }))}
          required
          placeholder="Ej: Gift card $50"
        />
        <div className="flex flex-col gap-1.5">
          <Field
            label={primerPartido
              ? `Fecha límite (antes del ${fmtFecha(primerPartido.fecha_partido)})`
              : 'Fecha límite (seleccioná partidos primero)'}
            type="datetime-local"
            value={form.fecha_cierre}
            min={minFechaCierre}
            max={maxFechaCierre || undefined}
            onChange={e => setForm(p => ({ ...p, fecha_cierre: e.target.value }))}
            error={errorFecha}
            disabled={!primerPartido}
            required
          />
          {primerPartido && !errorFecha && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(235,195,43,0.06)', border: '1px solid rgba(235,195,43,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c99f16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span className="font-body text-[11px]" style={{ color: '#5f6e8a' }}>
                El primer partido es <strong style={{ color: '#0a1226' }}>{primerPartido.equipo_local} vs {primerPartido.equipo_visitante}</strong> el {fmtFecha(primerPartido.fecha_partido)}.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-4 rounded-xl font-body font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? 'linear-gradient(135deg, #0a1226 0%, #1a2540 100%)' : 'rgba(12,24,43,.15)',
          color: canSubmit ? '#ebc32b' : '#a8b2c4',
          boxShadow: canSubmit ? '0 4px 16px rgba(10,18,38,.2)' : 'none',
        }}
        onMouseEnter={e => { 
          if (canSubmit) { 
            e.currentTarget.style.background = 'linear-gradient(135deg, #1a2540 0%, #0a1226 100%)'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,18,38,.25)'
          } 
        }}
        onMouseLeave={e => { 
          if (canSubmit) { 
            e.currentTarget.style.background = 'linear-gradient(135deg, #0a1226 0%, #1a2540 100%)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,18,38,.2)'
          } 
        }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Creando apuesta...
          </>
        ) : (
          <>
            Crear Apuesta
            {seleccionados > 0 && ` · ${seleccionados} ${seleccionados === 1 ? 'partido' : 'partidos'}`}
          </>
        )}
      </button>
    </form>
  )
}