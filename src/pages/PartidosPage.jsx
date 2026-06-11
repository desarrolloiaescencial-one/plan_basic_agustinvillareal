import { useState, useEffect, useMemo } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import sheetsApi from '../services/sheetsApi.js'
import { fmtFecha, diaLocalIso } from '../utils/index.js'

const ORDEN_FASES = ['grupos', '16avos', 'octavos', 'cuartos', 'semis', '3er_puesto', 'final']
const LABEL_FASE = {
    grupos: 'Grupos', '16avos': '16avos', octavos: 'Octavos',
    cuartos: 'Cuartos', semis: 'Semis', '3er_puesto': '3er puesto', final: 'Final'
}

const TABS = ['Tablas de grupos', 'Fixture']

function isTBD(m) {
    return !m.equipo_local || !m.equipo_visitante ||
        m.equipo_local === 'TBD' || m.equipo_visitante === 'TBD' ||
        m.codigo_local === 'TBD' || m.codigo_visitante === 'TBD'
}

export default function PartidosPage() {
    const [tab, setTab] = useState('Tablas de grupos')
    const [grupos, setGrupos] = useState([])
    const [partidos, setPartidos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function cargar() {
            setLoading(true)
            try {
                const [respGrupos, respPartidos] = await Promise.all([
                    sheetsApi.grupos.listar(),
                    sheetsApi.partidos.listar()
                ])
                setGrupos(respGrupos.grupos || [])
                setPartidos(respPartidos.partidos || [])
            } catch (err) {
                alert('Error cargando datos: ' + err.message)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    return (
        <AppLayout>
            {/* Header */}
            <div className="bg-brand-grad rounded-[var(--radius-lg)] p-6 mb-6 text-white shadow-md animate-fade-in">
                <h1 className="font-display text-4xl text-white">Partidos</h1>
                <p className="text-white opacity-80 font-body text-sm mt-1">
                    Tablas de grupos y fixture del Mundial 2026
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-1 w-fit mb-6">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`
              px-4 py-1.5 text-sm font-semibold font-body rounded-[var(--radius-sm)] transition-all
              ${tab === t
                                ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}
            `}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="w-8 h-8 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin"></span>
                    <p className="text-[var(--color-text-muted)] font-body text-sm">Cargando...</p>
                </div>
            ) : tab === 'Tablas de grupos' ? (
                <TablasGrupos grupos={grupos} />
            ) : (
                <Fixture partidos={partidos} />
            )}
        </AppLayout>
    )
}

/* ─────────────────────────────────────────────
   Sección: Tablas de grupos
   ───────────────────────────────────────────── */
function TablasGrupos({ grupos }) {
    if (grupos.length === 0) {
        return (
            <Card className="text-center py-12 text-[var(--color-text-muted)] font-body">
                No hay datos de grupos cargados todavía.
            </Card>
        )
    }

    return (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
            {grupos.map(g => (
                <TablaGrupo key={g.letra} grupo={g} />
            ))}
        </div>
    )
}

function TablaGrupo({ grupo }) {
    return (
        <Card className="p-0 overflow-hidden">
            <div className="bg-[var(--color-bg-3)] px-4 py-2.5 border-b border-[var(--color-border)]">
                <h3 className="font-display text-lg text-[var(--color-text)] tracking-wide">
                    GRUPO {grupo.letra}
                </h3>
            </div>

            <table className="w-full text-xs font-body">
                <thead>
                    <tr className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-bg-2)]">
                        <th className="px-2 py-2 text-left w-6">#</th>
                        <th className="px-2 py-2 text-left">Equipo</th>
                        <th className="px-1 py-2 text-center w-6">J</th>
                        <th className="px-1 py-2 text-center w-6">G</th>
                        <th className="px-1 py-2 text-center w-6">E</th>
                        <th className="px-1 py-2 text-center w-6">P</th>
                        <th className="px-1 py-2 text-center w-8" title="Goles a favor">GF</th>
                        <th className="px-1 py-2 text-center w-8" title="Goles en contra">GC</th>
                        <th className="px-1 py-2 text-center w-8" title="Diferencia de gol">DIF</th>
                        <th className="px-2 py-2 text-right w-10">PTS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                    {grupo.selecciones.map(s => {
                        const clasifica = s.pos === 1 || s.pos === 2
                        return (
                            <tr key={s.codigo} className={clasifica ? 'bg-[var(--color-accent-glow)]' : ''}>
                                <td className="px-2 py-2 text-[var(--color-text-muted)] font-semibold">
                                    {s.pos}
                                </td>
                                <td className="px-2 py-2">
                                    <div className="flex items-center gap-2">
                                        {s.bandera_url && (
                                            <img src={s.bandera_url} alt="" className="w-5 h-3.5 object-cover rounded-[2px] flex-shrink-0" />
                                        )}
                                        <span className="text-[var(--color-text)] truncate">{s.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">{s.j}</td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">{s.g}</td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">{s.e}</td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">{s.p}</td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">{s.gf}</td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">{s.gc}</td>
                                <td className="px-1 py-2 text-center text-[var(--color-text-muted)]">
                                    {s.dif > 0 ? `+${s.dif}` : s.dif}
                                </td>
                                <td className="px-2 py-2 text-right font-display text-base text-[var(--color-accent)]">
                                    {s.pts}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </Card>
    )
}

/* ─────────────────────────────────────────────
   Sección: Fixture de partidos
   ───────────────────────────────────────────── */
function Fixture({ partidos }) {
    const [filtroFase, setFiltroFase] = useState('todas')
    const [filtroJornada, setFiltroJornada] = useState('todas')
    const [filtroGrupo, setFiltroGrupo] = useState('todos')
    const [filtroEstado, setFiltroEstado] = useState('todos')

    const partidosDefinidos = useMemo(() => partidos.filter(m => !isTBD(m)), [partidos])

    const fasesDisponibles = useMemo(() => {
        const set = new Set(partidosDefinidos.map(m => m.fase).filter(Boolean))
        return ORDEN_FASES.filter(f => set.has(f))
    }, [partidosDefinidos])

    const jornadasDisponibles = useMemo(() => {
        const relevantes = filtroFase === 'todas' ? partidosDefinidos : partidosDefinidos.filter(m => m.fase === filtroFase)
        const set = new Set(relevantes.map(m => m.jornada).filter(j => j !== '' && j != null).map(String))
        return [...set].sort()
    }, [partidosDefinidos, filtroFase])

    const gruposDisponibles = useMemo(() => {
        const relevantes = filtroFase === 'todas' ? partidosDefinidos : partidosDefinidos.filter(m => m.fase === filtroFase)
        const set = new Set(relevantes.map(m => m.grupo).filter(Boolean))
        return [...set].sort()
    }, [partidosDefinidos, filtroFase])

    const partidosFiltrados = useMemo(() => {
        return partidosDefinidos.filter(m => {
            if (filtroFase !== 'todas' && m.fase !== filtroFase) return false
            if (filtroJornada !== 'todas' && String(m.jornada) !== filtroJornada) return false
            if (filtroGrupo !== 'todos' && m.grupo !== filtroGrupo) return false
            if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false
            return true
        })
    }, [partidosDefinidos, filtroFase, filtroJornada, filtroGrupo, filtroEstado])

    const agrupados = useMemo(() => {
        const map = {}
        partidosFiltrados.forEach(m => {
            const dia = m.fecha_partido ? diaLocalIso(m.fecha_partido) : 'sin fecha'
            if (!map[dia]) map[dia] = []
            map[dia].push(m)
        })
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dia, items]) => ({
                dia,
                items: items.sort((a, b) => new Date(a.fecha_partido) - new Date(b.fecha_partido))
            }))
    }, [partidosFiltrados])

    function handleChangeFase(nueva) {
        setFiltroFase(nueva)
        setFiltroJornada('todas')
        setFiltroGrupo('todos')
    }

    function fmtDia(iso) {
        if (iso === 'sin fecha') return 'Sin fecha'
        try {
            const d = new Date(iso + 'T12:00:00')
            return d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })
        } catch { return iso }
    }

    return (
        <div className="animate-fade-in">
            {/* Filtros */}
            <Card className="mb-4">
                <div className="flex flex-col gap-2">
                    {fasesDisponibles.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Fase</span>
                            <Chip active={filtroFase === 'todas'} onClick={() => handleChangeFase('todas')}>Todas</Chip>
                            {fasesDisponibles.map(f => (
                                <Chip key={f} active={filtroFase === f} onClick={() => handleChangeFase(f)}>{LABEL_FASE[f] || f}</Chip>
                            ))}
                        </div>
                    )}

                    {jornadasDisponibles.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Jornada</span>
                            <Chip active={filtroJornada === 'todas'} onClick={() => setFiltroJornada('todas')}>Todas</Chip>
                            {jornadasDisponibles.map(j => (
                                <Chip key={j} active={filtroJornada === j} onClick={() => setFiltroJornada(j)}>{j}</Chip>
                            ))}
                        </div>
                    )}

                    {gruposDisponibles.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Grupo</span>
                            <Chip active={filtroGrupo === 'todos'} onClick={() => setFiltroGrupo('todos')}>Todos</Chip>
                            {gruposDisponibles.map(g => (
                                <Chip key={g} active={filtroGrupo === g} onClick={() => setFiltroGrupo(g)}>{g}</Chip>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Estado</span>
                        <Chip active={filtroEstado === 'todos'} onClick={() => setFiltroEstado('todos')}>Todos</Chip>
                        <Chip active={filtroEstado === 'programado'} onClick={() => setFiltroEstado('programado')}>Programados</Chip>
                        <Chip active={filtroEstado === 'en_vivo'} onClick={() => setFiltroEstado('en_vivo')}>En vivo</Chip>
                        <Chip active={filtroEstado === 'finalizado'} onClick={() => setFiltroEstado('finalizado')}>Finalizados</Chip>
                    </div>
                </div>
            </Card>

            {/* Contador */}
            <p className="text-xs text-[var(--color-text-muted)] font-body mb-3">
                {partidosFiltrados.length} {partidosFiltrados.length === 1 ? 'partido' : 'partidos'}
            </p>

            {/* Lista agrupada por día */}
            {agrupados.length === 0 ? (
                <Card className="text-center py-12 text-[var(--color-text-muted)] font-body">
                    No hay partidos que coincidan con los filtros.
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {agrupados.map(({ dia, items }) => (
                        <div key={dia}>
                            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                                {fmtDia(dia)}
                            </div>
                            <div className="flex flex-col gap-2">
                                {items.map(m => <PartidoRow key={m.id} match={m} />)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function PartidoRow({ match }) {
    const isLive = match.estado === 'en_vivo'
    const isFinished = match.estado === 'finalizado'
    const isScheduled = match.estado === 'programado'

    const badgeVariant = isLive ? 'danger' : isFinished ? 'muted' : 'accent'
    const badgeLabel = isLive ? 'EN VIVO' : isFinished ? 'FINAL' : fmtFecha(match.fecha_partido, ' · ')

    return (
        <Card className="flex items-center gap-3 py-2.5 px-3">
            {/* Fase/grupo */}
            <div className="flex flex-col gap-0.5 flex-shrink-0 w-20">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-body">
                    {LABEL_FASE[match.fase] || match.fase}
                </span>
                {match.grupo && (
                    <span className="text-[9px] text-[var(--color-text-faint)] font-body">
                        Grupo {match.grupo}{match.jornada ? ` · J${match.jornada}` : ''}
                    </span>
                )}
            </div>

            {/* Equipos + marcador */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0 justify-end">
                    <span className="font-body text-sm text-[var(--color-text)] truncate text-right">{match.equipo_local}</span>
                    {match.bandera_local && (
                        <img src={match.bandera_local} alt="" className="w-6 h-4 object-cover rounded-[2px] flex-shrink-0" />
                    )}
                </div>

                <div className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded px-2.5 py-0.5 flex-shrink-0">
                    {isScheduled ? (
                        <span className="font-display text-sm text-[var(--color-text-faint)]">
                            - : -
                        </span>
                    ) : (
                        <span className="font-display text-base text-[var(--color-accent)]">
                            {match.goles_local ?? 0} : {match.goles_visitante ?? 0}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                    {match.bandera_visitante && (
                        <img src={match.bandera_visitante} alt="" className="w-6 h-4 object-cover rounded-[2px] flex-shrink-0" />
                    )}
                    <span className="font-body text-sm text-[var(--color-text)] truncate">{match.equipo_visitante}</span>
                </div>
            </div>

            {/* Estado */}
            <div className="flex-shrink-0 w-24 text-right">
                <Badge variant={badgeVariant}>
                    {badgeLabel}
                </Badge>
            </div>
        </Card>
    )
}

function Chip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        px-2.5 py-1 rounded-full text-[11px] font-semibold font-body border transition-all
        ${active
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg)]'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]'}
      `}
        >
            {children}
        </button>
    )
}