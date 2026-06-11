import { useState, useEffect, useMemo } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import sheetsApi from '../services/sheetsApi.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { isBetOpen, timeLeft } from '../utils/index.js'

/* ── Chip de filtro reutilizable ───────────────────────── */
function Chip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body border transition-all ${active
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg)]'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]'
                }`}
        >
            {children}
        </button>
    )
}

/* ── Tarjeta de estadística ──────────────────────────── */
function StatCard({ label, value, color = 'var(--color-accent)' }) {
    return (
        <div
            className="rounded-xl p-4 transition-all hover:translate-y-[-2px]"
            style={{
                background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            }}
        >
            <p className="text-[10px] font-body font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
                {label}
            </p>
            <p className="font-display text-3xl md:text-4xl tracking-wide leading-none" style={{ color }}>
                {value}
            </p>
        </div>
    )
}

/* ── Bandera ─────────────────────────────────────────── */
function Bandera({ url }) {
    if (!url) return null
    return (
        <img
            src={url}
            alt=""
            className="w-6 h-4 object-cover rounded-[2px] flex-shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
    )
}

/* ── Fila de partido dentro del acordeón ──────────────── */
function PartidoRow({ match, pred }) {
    const isFinished = match.estado === 'finalizado'
    const isLive = match.estado === 'en_vivo'
    const hasRealScore = isFinished || isLive
    const puntos = pred?.puntos

    return (
        <div
            className="rounded-lg p-3"
            style={{
                background: 'rgba(2,15,39,0.4)',
                border: `1px solid ${isLive ? 'rgba(255,61,113,0.25)' : 'var(--color-border)'}`,
            }}
        >
            {/* Equipos */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Bandera url={match.bandera_local} />
                    <span className="font-body font-semibold text-white text-sm truncate">
                        {match.equipo_local}
                    </span>
                </div>
                <span className="font-display text-sm text-[var(--color-text-faint)]">vs</span>
                <div className="flex items-center gap-2 min-w-0 justify-end">
                    <span className="font-body font-semibold text-white text-sm truncate text-right">
                        {match.equipo_visitante}
                    </span>
                    <Bandera url={match.bandera_visitante} />
                </div>
            </div>

            {/* Scores */}
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-[var(--color-border)]">
                {pred ? (
                    <div className="text-center">
                        <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                            {pred.es_grupal ? 'Área' : 'Tu predicción'}
                        </p>
                        <p className="font-display text-lg text-[var(--color-accent)] leading-none">
                            {pred.pred_local} - {pred.pred_visitante}
                        </p>
                        {pred.es_grupal && pred.cargada_por_nombre && !pred.es_propia && (
                            <p className="text-[9px] text-[var(--color-text-faint)] font-body mt-0.5">
                                por {pred.cargada_por_nombre}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                            Sin predicción
                        </p>
                        <p className="font-display text-lg text-[var(--color-text-faint)] leading-none">
                            — - —
                        </p>
                    </div>
                )}

                {hasRealScore && (
                    <>
                        <div className="w-px h-8 bg-[var(--color-border)]" />
                        <div className="text-center">
                            <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                                {isLive ? 'En vivo' : 'Resultado'}
                            </p>
                            <p
                                className="font-display text-lg leading-none"
                                style={{ color: isLive ? 'var(--color-live)' : 'var(--color-text)' }}
                            >
                                {match.goles_local ?? 0} - {match.goles_visitante ?? 0}
                            </p>
                        </div>
                    </>
                )}

                {puntos !== '' && puntos !== undefined && puntos !== null && (
                    <>
                        <div className="w-px h-8 bg-[var(--color-border)]" />
                        <div className="text-center">
                            <p className="text-[9px] font-body uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-0.5">
                                Puntos
                            </p>
                            <p className="font-display text-lg text-[var(--color-warn)] leading-none">
                                {puntos}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ── Tarjeta de apuesta (acordeón) ──────────────────── */
function BetCardItem({ bet, predsDeLaApuesta, expanded, onToggle }) {
    const open = isBetOpen(bet)
    const estado = bet.estado === 'finalizada'
        ? { label: 'FINALIZADA', color: 'var(--color-warn)', bg: 'rgba(244,180,42,0.1)', border: 'rgba(244,180,42,0.3)' }
        : open
            ? { label: 'ACTIVA', color: 'var(--color-accent)', bg: 'rgba(34,217,223,0.1)', border: 'rgba(34,217,223,0.3)' }
            : { label: 'CERRADA', color: 'var(--color-text-muted)', bg: 'rgba(132,153,194,0.1)', border: 'var(--color-border)' }

    const esGrupal = bet.tipo === 'grupos'
    const tipo = esGrupal
        ? { label: 'GRUPAL', color: 'var(--color-warn)', bg: 'rgba(244,180,42,0.1)', border: 'rgba(244,180,42,0.3)' }
        : { label: 'INDIVIDUAL', color: 'var(--color-accent)', bg: 'rgba(34,217,223,0.08)', border: 'rgba(34,217,223,0.25)' }

    // Contar predicciones de este bet
    const partidosIds = bet.partidos?.map(p => p.id) || []
    const conPrediccion = partidosIds.filter(pid => predsDeLaApuesta[pid]).length
    const totalPartidos = partidosIds.length

    const puntosAcumulados = Object.values(predsDeLaApuesta)
        .filter(p => partidosIds.includes(p.partido_id))
        .reduce((sum, p) => {
            const pts = parseInt(p.puntos)
            return sum + (isNaN(pts) ? 0 : pts)
        }, 0)

    return (
        <div
            className="rounded-xl overflow-hidden transition-all"
            style={{
                background: 'linear-gradient(145deg, rgba(15,43,79,0.85) 0%, rgba(15,33,69,0.9) 100%)',
                border: `1px solid ${expanded ? 'rgba(34,217,223,0.4)' : 'var(--color-border)'}`,
                boxShadow: expanded ? '0 10px 30px rgba(0,0,0,0.35), 0 0 24px rgba(34,217,223,0.08)' : '0 6px 20px rgba(0,0,0,0.25)',
            }}
        >
            {/* Header clickeable */}
            <button
                onClick={onToggle}
                className="w-full p-5 text-left transition-colors hover:bg-white/[0.02]"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span
                                className="inline-flex px-2 py-0.5 rounded text-[9px] font-body font-bold uppercase tracking-wider"
                                style={{ background: estado.bg, color: estado.color, border: `1px solid ${estado.border}` }}
                            >
                                {estado.label}
                            </span>
                            <span
                                className="inline-flex px-2 py-0.5 rounded text-[9px] font-body font-bold uppercase tracking-wider"
                                style={{ background: tipo.bg, color: tipo.color, border: `1px solid ${tipo.border}` }}
                            >
                                {tipo.label}
                            </span>
                            {open && (
                                <span className="text-[10px] font-body uppercase tracking-wider text-[var(--color-text-faint)]">
                                    Cierra en {timeLeft(bet.fecha_cierre)}
                                </span>
                            )}
                        </div>
                        <h3 className="font-display text-xl text-white tracking-wide truncate">
                            {bet.titulo}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)] font-body">
                            <span>
                                <span className="text-[var(--color-accent)] font-semibold">{conPrediccion}</span>
                                {' / '}{totalPartidos} predicciones
                            </span>
                            {bet.estado === 'finalizada' && (
                                <>
                                    <span className="text-[var(--color-text-faint)]">·</span>
                                    <span>
                                        <span className="text-[var(--color-warn)] font-display text-sm">{puntosAcumulados}</span>
                                        {' '}puntos
                                    </span>
                                </>
                            )}
                            {bet.premio && (
                                <>
                                    <span className="text-[var(--color-text-faint)]">·</span>
                                    <span className="truncate">Premio: {bet.premio}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Flecha */}
                    <svg
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="flex-shrink-0 transition-transform"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            {/* Contenido expandible */}
            {expanded && bet.partidos?.length > 0 && (
                <div
                    className="p-4 md:p-5 pt-0 flex flex-col gap-2 animate-fade-in"
                    style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}
                >
                    {bet.partidos.map(match => (
                        <PartidoRow
                            key={match.id}
                            match={match}
                            pred={predsDeLaApuesta[match.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ── Página principal ──────────────────────────────── */
export default function MisPrediccionesPage() {
    const { user } = useAuth()
    const [bets, setBets] = useState([])
    const [allMatches, setAllMatches] = useState([])
    const [allPreds, setAllPreds] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState('todas')
    const [filtroTipo, setFiltroTipo] = useState('todas')
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        async function cargar() {
            setLoading(true)
            try {
                const [apuestasResp, partidosResp, prediccionesResp] = await Promise.all([
                    sheetsApi.apuestas.listar(),
                    sheetsApi.partidos.listar(),
                    sheetsApi.predicciones.mias(),
                ])
                const matches = partidosResp.partidos || []
                setAllMatches(matches)
                setAllPreds(prediccionesResp.predicciones || [])

                const apuestas = (apuestasResp.apuestas || []).map(a => {
                    const pIds = a.partidos_ids ? a.partidos_ids.split(',').map(id => id.trim()) : []
                    const partidos = pIds.map(id => matches.find(m => m.id === id)).filter(Boolean)
                    return { ...a, partidos }
                })
                setBets(apuestas)
            } catch (err) {
                alert('Error cargando tus predicciones: ' + err.message)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    // Mapa por apuesta: { apuestaId: { partidoId: pred } }
    const predsPorApuesta = useMemo(() => {
        const map = {}
        allPreds.forEach(p => {
            if (!map[p.apuesta_id]) map[p.apuesta_id] = {}
            map[p.apuesta_id][p.partido_id] = p
        })
        return map
    }, [allPreds])

    // Apuestas en las que realmente tengo predicciones o puedo tener
    const misBets = useMemo(() => {
        return bets.filter(b => {
            const preds = predsPorApuesta[b.id] || {}
            const tieneAlgunaPred = Object.keys(preds).length > 0
            // Las apuestas grupales donde participa mi área las incluimos aunque no tenga preds propias
            const esGrupalDeMiArea = b.tipo === 'grupos' && user?.area_id &&
                b.areas_ids?.split(',').map(id => id.trim()).includes(user.area_id)
            return tieneAlgunaPred || esGrupalDeMiArea
        })
    }, [bets, predsPorApuesta, user])

    // Aplicar filtros
    const betsFiltradas = useMemo(() => {
        return misBets.filter(b => {
            if (filtroTipo === 'individuales' && b.tipo !== 'libre') return false
            if (filtroTipo === 'grupales' && b.tipo !== 'grupos') return false

            const activa = isBetOpen(b)
            if (filtroEstado === 'activas' && !activa) return false
            if (filtroEstado === 'finalizadas' && activa) return false

            return true
        }).sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0))
    }, [misBets, filtroEstado, filtroTipo])

    // Auto-expandir la primera (más reciente)
    useEffect(() => {
        if (betsFiltradas.length > 0 && expandedId === null) {
            setExpandedId(betsFiltradas[0].id)
        }
    }, [betsFiltradas, expandedId])

    // Stats globales
    const stats = useMemo(() => {
        const totalApuestas = misBets.length
        const misPreds = allPreds.filter(p => p.es_propia || p.es_grupal)
        const totalPreds = misPreds.length
        const puntos = misPreds.reduce((sum, p) => {
            const pts = parseInt(p.puntos)
            return sum + (isNaN(pts) ? 0 : pts)
        }, 0)

        // Aciertos exactos: predicción coincide con resultado real
        let exactos = 0
        misPreds.forEach(p => {
            const match = allMatches.find(m => m.id === p.partido_id)
            if (match && match.estado === 'finalizado' &&
                parseInt(p.pred_local) === parseInt(match.goles_local) &&
                parseInt(p.pred_visitante) === parseInt(match.goles_visitante)) {
                exactos++
            }
        })

        return { totalApuestas, totalPreds, puntos, exactos }
    }, [misBets, allPreds, allMatches])

    return (
        <AppLayout>
            {/* Header */}
            <div className="mb-6 animate-fade-in">
                <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide leading-none mb-2">
                    MIS <span className="text-[var(--color-accent)]">PREDICCIONES</span>
                </h1>
                <p className="text-[var(--color-text-muted)] font-body text-sm">
                    Tu historial personal de apuestas y aciertos
                </p>
            </div>

            {/* Stats dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in delay-1">
                <StatCard label="Apuestas" value={stats.totalApuestas} />
                <StatCard label="Predicciones" value={stats.totalPreds} color="var(--color-text)" />
                <StatCard label="Puntos" value={stats.puntos} color="var(--color-warn)" />
                <StatCard label="Aciertos exactos" value={stats.exactos} color="#10b981" />
            </div>

            {/* Filtros */}
            <div className="flex flex-col gap-2 mb-5 animate-fade-in delay-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Estado</span>
                    <Chip active={filtroEstado === 'todas'} onClick={() => setFiltroEstado('todas')}>Todas</Chip>
                    <Chip active={filtroEstado === 'activas'} onClick={() => setFiltroEstado('activas')}>Activas</Chip>
                    <Chip active={filtroEstado === 'finalizadas'} onClick={() => setFiltroEstado('finalizadas')}>Finalizadas</Chip>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)] font-body w-14">Tipo</span>
                    <Chip active={filtroTipo === 'todas'} onClick={() => setFiltroTipo('todas')}>Todas</Chip>
                    <Chip active={filtroTipo === 'individuales'} onClick={() => setFiltroTipo('individuales')}>Individuales</Chip>
                    <Chip active={filtroTipo === 'grupales'} onClick={() => setFiltroTipo('grupales')}>Grupales</Chip>
                </div>
            </div>

            {/* Lista de apuestas */}
            {loading ? (
                <div className="text-center py-16 animate-fade-in">
                    <span className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--color-text-muted)] font-body text-sm mt-3">Cargando tus predicciones...</p>
                </div>
            ) : betsFiltradas.length === 0 ? (
                <div
                    className="rounded-2xl p-12 text-center animate-fade-in"
                    style={{ background: 'rgba(15,43,79,0.4)', border: '1px dashed var(--color-border)' }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                        <path d="M9 11H3v10h6V11zM15 3h-6v18h6V3zM21 7h-6v14h6V7z" />
                    </svg>
                    <p className="text-[var(--color-text-muted)] font-body text-base mb-1">
                        {misBets.length === 0
                            ? 'Todavía no cargaste predicciones'
                            : 'No hay apuestas con estos filtros'}
                    </p>
                    <p className="text-[var(--color-text-faint)] font-body text-xs">
                        {misBets.length === 0
                            ? 'Andá a "Apuestas" y cargá tus primeros prodes.'
                            : 'Probá cambiando los filtros.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 animate-fade-in delay-3">
                    {betsFiltradas.map(bet => (
                        <BetCardItem
                            key={bet.id}
                            bet={bet}
                            predsDeLaApuesta={predsPorApuesta[bet.id] || {}}
                            expanded={expandedId === bet.id}
                            onToggle={() => setExpandedId(expandedId === bet.id ? null : bet.id)}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    )
}