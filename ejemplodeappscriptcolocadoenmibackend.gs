/**
 * PRODE ONE - API & Lógica de Negocio
 * ════════════════════════════════════════════════════════════════════
 *
 * ⚠️ ZONA HORARIA DEL SPREADSHEET (CRÍTICO):
 *   Archivo → Configuración → Zona horaria → (GMT-03:00) Buenos Aires
 *
 * ⚠️ FECHAS:
 *   - Los partidos se cargan en el sheet en hora ARGENTINA.
 *   - El backend convierte a ISO UTC antes de enviar al frontend.
 *   - El frontend muestra en hora local de cada navegador.
 *
 * ⚠️ ESTADO DE PARTIDOS:
 *   - Valores válidos canónicos: programado | en_vivo | finalizado | cancelado
 *   - Se tolera "en_vivo (63')" o "En Vivo 63'": se normaliza a "en_vivo"
 *     y el minuto se extrae al campo "minuto" del objeto partido.
 *
 * ⚠️ REQUISITOS EN EL SHEET:
 *   1) Hoja "apuestas":
 *      - Columna: total_participantes
 *      - Columna: puntos_diferencia (entre puntos_exacto y puntos_resultado)
 *      - Columna: puntos_clasificado (NUEVA — para fases eliminatorias)
 *   2) Hoja "usuarios":
 *      - Columnas: empresa, reset_token, reset_expira
 *   3) Hoja "predicciones":
 *      - Columna: pred_clasificado (NUEVA — código de selección que avanza)
 *   4) Hoja "PartidosMundial":
 *      - Columnas: penales_local, penales_visit (ya existentes)
 *
 * ⚠️ SCRIPT PROPERTIES (para reset de password):
 *   APP_URL = https://tu-dominio-de-la-app.com
 *
 * ════════════════════════════════════════════════════════════════════
 * SISTEMA DE PUNTOS
 * ════════════════════════════════════════════════════════════════════
 *
 * FASE DE GRUPOS (sin cambios):
 *   5 = marcador exacto
 *   3 = misma diferencia
 *   1 = mismo ganador (incluye empates)
 *   0 = errado
 *
 * FASE ELIMINATORIA (16avos → final, NUEVO):
 *   El usuario predice marcador (90') + clasificado (quién avanza).
 *   El backend deduce el clasificado real: si los 90' son distintos,
 *   gana el de más goles; si son iguales, gana el de más penales.
 *
 *   5 = marcador exacto + clasificado correcto
 *   3 = marcador exacto + clasificado errado (caso del penal mal leído)
 *   3 = diferencia correcta NO-CERO + clasificado correcto
 *   1 = solo clasificado correcto (incluye empates predichos no exactos)
 *   0 = errado todo
 *
 *   ⚠️ IMPORTANTE: si la predicción es un empate (predLocal == predVisit),
 *   "diferencia correcta" se ANULA — solo aplican exacto o clasificado.
 *   Esto evita premiar coincidencias numéricas sin lectura del partido.
 */

const SHEETS = {
  USUARIOS:    'usuarios',
  AREAS:       'areas',
  APUESTAS:    'apuestas',
  PREDICCIONES:'predicciones',
  PARTIDOS:    'PartidosMundial',
  GRUPOS:      'Grupos',
  CONFIG:      'config',
  AUDITORIA:   'auditoria'
};

// ── CACHÉ ────────────────────────────────────────────────────────────
const CACHE_TTL = {
  'areas':            3600,
  'Grupos':           21600,
  'PartidosMundial':  60,
  'apuestas':         120,
  'usuarios':         300,
  'config':           3600
};
const CACHE_TTL_USER_PREDS = 300;
const CACHE_TTL_AREA_PREDS = 300;
const CACHE_TTL_RANKING    = 60;

const HEADERS_CACHE = {};

function getCache_() { return CacheService.getScriptCache(); }
function invalidateCache_(sheetName)       { try { getCache_().remove('sheet_' + sheetName); } catch (e) {} }
function invalidateUserPredsCache_(userId) { try { getCache_().remove('preds_user_' + userId); } catch (e) {} }
function invalidateAreaPredsCache_(areaId) { try { getCache_().remove('preds_area_' + areaId); } catch (e) {} }
function invalidateRankingCache_(apuestaId){ try { getCache_().remove('ranking_' + apuestaId); } catch (e) {} }

// ── ESTADO DE PARTIDOS: NORMALIZACIÓN Y MINUTO ───────────────────────
const ESTADOS_VALIDOS = ['programado', 'en_vivo', 'finalizado', 'cancelado'];

function normalizarEstado_(estadoRaw) {
  if (estadoRaw === null || estadoRaw === undefined) return 'programado';
  const s = String(estadoRaw).toLowerCase().trim();
  if (s === '') return 'programado';
  if (s.indexOf('en_vivo') === 0 || s.indexOf('en vivo') === 0 || s === 'live' || s.indexOf('live ') === 0) return 'en_vivo';
  if (s.indexOf('finalizado') === 0 || s === 'final' || s === 'ft' || s === 'terminado') return 'finalizado';
  if (s.indexOf('cancelado') === 0 || s === 'cancelled' || s === 'canceled') return 'cancelado';
  if (s.indexOf('programado') === 0 || s === 'scheduled' || s === 'pendiente') return 'programado';
  return s;
}

function extraerMinuto_(estadoRaw) {
  if (!estadoRaw) return '';
  const str = String(estadoRaw);
  let m = str.match(/\(\s*(\d+\s*(?:\+\s*\d+)?)\s*'?\s*\)/);
  if (m) return m[1].replace(/\s+/g, '');
  m = str.match(/(\d+\s*(?:\+\s*\d+)?)'/);
  if (m) return m[1].replace(/\s+/g, '');
  return '';
}

// ── FASES: GRUPOS VS ELIMINATORIA ────────────────────────────────────
function esFaseEliminatoria_(fase) {
  if (!fase) return false;
  return String(fase).trim().toLowerCase() !== 'grupos';
}

/**
 * Devuelve el código de la selección que clasifica (avanza de fase).
 * - Si hay diferencia de goles en los 90', el ganador.
 * - Si hubo empate en 90', mira los penales.
 * - Si todavía no hay penales cargados (empate sin definir), devuelve ''.
 */
function obtenerClasificadoReal_(partido) {
  const gl = parseInt(partido.goles_local);
  const gv = parseInt(partido.goles_visitante);
  if (isNaN(gl) || isNaN(gv)) return '';
  if (gl > gv) return partido.local;
  if (gv > gl) return partido.visitante;
  // Empate en 90' → desempate por penales
  const pl = parseInt(partido.penales_local);
  const pv = parseInt(partido.penales_visit);
  if (isNaN(pl) || isNaN(pv)) return '';
  return pl > pv ? partido.local : partido.visitante;
}

/**
 * Cálculo unificado de puntos para una predicción (grupos o eliminatoria).
 * Retorna número de puntos, o null si no se puede puntuar todavía
 * (ej: empate eliminatorio sin penales cargados).
 */
function calcularPuntosPrediccion_(partido, apuesta, predLocal, predVisit, predClasificado) {
  if (isNaN(predLocal) || isNaN(predVisit)) return 0;

  const realLocal = parseInt(partido.goles_local);
  const realVisit = parseInt(partido.goles_visitante);
  if (isNaN(realLocal) || isNaN(realVisit)) return 0;

  const ptsExacto       = parseInt(apuesta.puntos_exacto)       || 5;
  const ptsDiferencia   = parseInt(apuesta.puntos_diferencia)   || 3;
  const ptsResultado    = parseInt(apuesta.puntos_resultado)    || 1;
  const ptsClasificado  = parseInt(apuesta.puntos_clasificado)  || 1;

  const difReal = realLocal - realVisit;
  const difPred = predLocal - predVisit;
  const empatePredicho = (predLocal === predVisit);

  if (esFaseEliminatoria_(partido.fase)) {
    // ─── ELIMINATORIA ───────────────────────────────────────────
    const clasifReal = obtenerClasificadoReal_(partido);
    if (!clasifReal) return null; // empate sin penales → todavía no se puede puntuar

    const aciertoExacto       = (predLocal === realLocal && predVisit === realVisit);
    const aciertoClasificado  = (String(predClasificado || '').trim() === String(clasifReal).trim());
    // OJO: en eliminatorias, "diferencia correcta" SOLO aplica si NO se predijo empate
    // y la diferencia es no-cero. Esto evita premiar coincidencias 0=0 sin lectura real.
    const diferenciaCorrecta = !empatePredicho && (difPred === difReal) && (difReal !== 0);

    if (aciertoExacto && aciertoClasificado)        return ptsExacto;        // 5
    if (aciertoExacto && !aciertoClasificado)       return ptsDiferencia;    // 3
    if (diferenciaCorrecta && aciertoClasificado)   return ptsDiferencia;    // 3
    if (aciertoClasificado)                         return ptsClasificado;   // 1
    return 0;
  }

  // ─── FASE DE GRUPOS (lógica clásica, sin cambios) ─────────────
  if (predLocal === realLocal && predVisit === realVisit) return ptsExacto;
  if (difPred === difReal) return ptsDiferencia;
  if ((difPred > 0 && difReal > 0) || (difPred < 0 && difReal < 0)) return ptsResultado;
  return 0;
}

// ── FECHAS Y ZONAS HORARIAS ──────────────────────────────────────────
const TZ_SERVIDOR = 'America/Argentina/Buenos_Aires';

function toIsoUtc_(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) throw new Error('Fecha inválida');
    return valor.toISOString();
  }
  const s = String(valor).trim();
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error('Fecha inválida: ' + s);
  return d.toISOString();
}

function fechaArgentinaAIsoUtc_(valor) {
  if (!valor) return '';
  if (typeof valor === 'string' && /Z$/.test(valor)) return valor;
  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) return '';
    const tzSheet = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    const fmt = Utilities.formatDate(valor, tzSheet, 'yyyy-MM-dd HH:mm:ss');
    const m = fmt.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return valor.toISOString();
    const [, y, mo, d, h, mi, se] = m;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${se}-03:00`;
    const date = new Date(iso);
    return isNaN(date.getTime()) ? valor.toISOString() : date.toISOString();
  }
  const s = String(valor).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    const [, y, mo, d, h, mi, se] = m;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${se || '00'}-03:00`;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    return date.toISOString();
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

function yaVencio_(fechaGuardada) {
  if (!fechaGuardada) return false;
  try {
    let fechaCierre;
    // Si ya es un string ISO con Z (UTC)
    if (typeof fechaGuardada === 'string' && /Z$/.test(fechaGuardada)) {
      fechaCierre = new Date(fechaGuardada);
    }
    // Si es un objeto Date de Google Sheets
    else if (fechaGuardada instanceof Date) {
      fechaCierre = fechaGuardada;
    }
    // Si es string sin timezone (formato del Sheet)
    else {
      const str = String(fechaGuardada).trim();
      // Intentar parsear como está
      fechaCierre = new Date(str);
    }
    // Validar que sea una fecha válida
    if (isNaN(fechaCierre.getTime())) {
      Logger.log(`⚠️ yaVencio_: fecha inválida: ${fechaGuardada}`);
      return false;
    }
    // Comparar directamente
    const ahora = new Date();
    const vencio = ahora > fechaCierre;
    // LOG de debug (puedes comentarlo después)
    Logger.log(`🕐 yaVencio_ check: Ahora=${ahora.toISOString()}, Cierre=${fechaCierre.toISOString()}, Vencio=${vencio}`);
    return vencio;
  } catch (e) {
    Logger.log(`❌ Error en yaVencio_: ${e.message}`);
    return false;
  }
}
function bootstrapAdmin_() {
  const email = 'admin@gmail.com'.trim().toLowerCase();
  const usuarios = getSheet_(SHEETS.USUARIOS, false);
  if (usuarios.find(u => u.email === email)) throw new Error('Ese email ya existe');
  const admin = {
    id: makeId_('USR'), nombre: 'Administrador', email: email,
    password_hash: hashPassword_('123456'), rol: 'admin', estado: 'activo',
    fecha_registro: new Date().toISOString(), session_token: '', session_expira: ''
  };
  appendRow_(SHEETS.USUARIOS, admin);
  Logger.log('Admin creado: ' + email);
}

// ── Entrada HTTP ─────────────────────────────────────────────────────
function doGet(e) {
  try { return jsonResponse_(routeGet_(e.parameter.action || '', e.parameter)); }
  catch (err) { return jsonResponse_(errorResponse_(err.message), 400); }
}
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    return jsonResponse_(routePost_(body.action || '', body));
  } catch (err) { return jsonResponse_(errorResponse_(err.message), 400); }
}

// ── Router ───────────────────────────────────────────────────────────
function routeGet_(action, params) {
  const publicRoutes = ['ping'];
  if (!publicRoutes.includes(action)) requireSession_(params.session_token);
  switch (action) {
    case 'ping':                     return { ok: true, message: 'Prode One activo' };
    case 'bootstrap':                return bootstrap_(params);
    case 'usuarios.listar':          return usuariosListar_(params);
    case 'usuarios.obtener':         return usuariosObtener_(params);
    case 'usuarios.listar_por_area': return usuariosListarPorArea_(params);
    case 'areas.listar':             return areasListar_(params);
    case 'apuestas.listar':          return apuestasListar_(params);
    case 'apuestas.obtener':         return apuestasObtener_(params);
    case 'partidos.listar':          return partidosListar_(params);
    case 'partidos.obtener':         return partidosObtener_(params);
    case 'partidos.sincronizar':     return partidosSincronizar_(params);
    case 'predicciones.mis':         return prediccionesMias_(params);
    case 'predicciones.tabla':       return prediccionesTabla_(params);
    case 'grupos.listar':            return gruposListar_(params);
    default: throw new Error(`Acción GET desconocida: "${action}"`);
  }
}
function routePost_(action, body) {
  const publicRoutes = [
    'auth.login', 'auth.registro', 'auth.logout',
    'auth.reset_solicitar', 'auth.reset_validar', 'auth.reset_confirmar'
  ];
  if (!publicRoutes.includes(action)) requireSession_(body.session_token);
  switch (action) {
    case 'auth.login':             return authLogin_(body);
    case 'auth.registro':          return authRegistro_(body);
    case 'auth.logout':            return authLogout_(body);
    case 'auth.reset_solicitar':   return authResetSolicitar_(body);
    case 'auth.reset_validar':     return authResetValidar_(body);
    case 'auth.reset_confirmar':   return authResetConfirmar_(body);
    case 'usuarios.aprobar':       return usuariosAprobar_(body);
    case 'usuarios.rechazar':      return usuariosRechazar_(body);
    case 'usuarios.crear':         return usuariosCrear_(body);
    case 'areas.crear':            return areasCrear_(body);
    case 'areas.editar':           return areasEditar_(body);
    case 'areas.toggle_activa':    return areasToggleActiva_(body);
    case 'apuestas.crear':         return apuestasCrear_(body);
    case 'apuestas.cerrar':        return apuestasCerrar_(body);
    case 'apuestas.reabrir':       return apuestasReabrir_(body);
    case 'apuestas.finalizar':     return apuestasFinalizar_(body);
    case 'predicciones.guardar':   return prediccionesGuardar_(body);
    case 'partidos.actualizar':    return partidosActualizar_(body);
    default: throw new Error(`Acción POST desconocida: "${action}"`);
  }
}

// ── BOOTSTRAP ────────────────────────────────────────────────────────
function bootstrap_(params) {
  const user = requireSession_(params.session_token);
  return {
    ok: true,
    user: userPublico_(user),
    apuestas: apuestasListar_(params).apuestas,
    partidos: partidosListar_({}).partidos,
    areas: areasListar_({ solo_activas: true }).areas,
    grupos: gruposListar_(params).grupos,
    mis_predicciones: prediccionesMias_(params).predicciones,
    server_time: new Date().toISOString()
  };
}

// ── Auth ─────────────────────────────────────────────────────────────
function authLogin_(body) {
  requireFields_(body, ['email', 'password']);
  const user = getSheet_(SHEETS.USUARIOS).find(u => u.email === body.email.trim().toLowerCase());
  if (!user) throw new Error('Email o contraseña incorrectos');
  if (!verificarPassword_(body.password, user.password_hash)) throw new Error('Email o contraseña incorrectos');
  if (user.estado === 'pendiente') throw new Error('Tu cuenta está pendiente de aprobación');
  if (user.estado === 'bloqueado') throw new Error('Tu cuenta ha sido bloqueada');
  const token = crearSesion_(user.id);
  registrarAuditoria_(user.id, 'LOGIN', 'Login exitoso');
  return { ok: true, session_token: token, user: userPublico_(user) };
}
function authRegistro_(body) {
  requireFields_(body, ['nombre', 'email', 'password']);
  const email = body.email.trim().toLowerCase();
  if (getSheet_(SHEETS.USUARIOS).find(u => u.email === email)) throw new Error('El email ya está registrado');
  const newUser = {
    id: makeId_('USR'), nombre: body.nombre.trim(), email: email,
    password_hash: hashPassword_(body.password), rol: 'usuario', estado: 'pendiente',
    fecha_registro: new Date().toISOString(), session_token: '', session_expira: ''
  };
  appendRow_(SHEETS.USUARIOS, newUser);
  registrarAuditoria_(newUser.id, 'REGISTRO', `Nuevo registro: ${email}`);
  return { ok: true, message: 'Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.' };
}
function authLogout_(body) {
  const user = getUserByToken_(body.session_token);
  if (!user) return { ok: true };
  updateUserField_(user.id, 'session_token', '');
  updateUserField_(user.id, 'session_expira', '');
  registrarAuditoria_(user.id, 'LOGOUT', 'Sesión cerrada');
  return { ok: true, message: 'Sesión cerrada correctamente' };
}

// ── Recuperación de contraseña ───────────────────────────────────────
function authResetSolicitar_(body) {
  requireFields_(body, ['email']);
  const email = body.email.trim().toLowerCase();
  const mensajeGenerico = {
    ok: true,
    message: 'Si el email está registrado, te enviamos un correo con instrucciones para restablecer tu contraseña. Revisá también la carpeta de spam.'
  };
  const user = getSheet_(SHEETS.USUARIOS, false).find(u => u.email === email);
  if (!user) return mensajeGenerico;
  if (user.estado === 'bloqueado') return mensajeGenerico;

  const token = Utilities.getUuid();
  const expira = new Date();
  expira.setHours(expira.getHours() + 1);
  updateUserField_(user.id, 'reset_token', token);
  updateUserField_(user.id, 'reset_expira', expira.toISOString());

  const appUrl = PropertiesService.getScriptProperties().getProperty('APP_URL');
  if (!appUrl) {
    Logger.log('ERROR: Falta la propiedad APP_URL en Script Properties');
    throw new Error('El sistema no está configurado correctamente. Contactá al administrador.');
  }
  const linkReset = `${appUrl}/reset-password?token=${token}`;

  try {
    const asunto = 'Restablecer tu contraseña de Prode One';
    const cuerpo = [
      `Hola ${user.nombre},`,
      '',
      'Recibimos una solicitud para restablecer tu contraseña de Prode One.',
      'Si no fuiste vos, ignorá este mensaje — tu contraseña actual sigue funcionando.',
      '',
      'Para elegir una contraseña nueva, hacé click en el siguiente link:',
      linkReset,
      '',
      'Este link expira en 1 hora.',
      '',
      '— El equipo de Prode One'
    ].join('\n');
    MailApp.sendEmail(user.email, asunto, cuerpo);
    registrarAuditoria_(user.id, 'RESET_SOLICITAR', `Email de recuperación enviado`);
  } catch (e) {
    Logger.log('Error enviando email: ' + e.message);
  }
  return mensajeGenerico;
}

function authResetValidar_(body) {
  requireFields_(body, ['token']);
  const token = String(body.token).trim();
  const user = getSheet_(SHEETS.USUARIOS, false).find(u => u.reset_token === token);
  if (!user) throw new Error('El link de recuperación no es válido o ya fue usado.');
  if (!user.reset_expira || yaVencio_(user.reset_expira)) {
    throw new Error('El link de recuperación expiró. Pedí uno nuevo desde la pantalla de login.');
  }
  if (user.estado === 'bloqueado') throw new Error('Tu cuenta está bloqueada. Contactá al administrador.');
  return { ok: true, email: user.email, nombre: user.nombre };
}

function authResetConfirmar_(body) {
  requireFields_(body, ['token', 'password']);
  const token = String(body.token).trim();
  const password = String(body.password);
  if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

  const user = getSheet_(SHEETS.USUARIOS, false).find(u => u.reset_token === token);
  if (!user) throw new Error('El link de recuperación no es válido o ya fue usado.');
  if (!user.reset_expira || yaVencio_(user.reset_expira)) {
    throw new Error('El link de recuperación expiró. Pedí uno nuevo desde la pantalla de login.');
  }
  if (user.estado === 'bloqueado') throw new Error('Tu cuenta está bloqueada. Contactá al administrador.');

  updateUserField_(user.id, 'password_hash', hashPassword_(password));
  updateUserField_(user.id, 'reset_token', '');
  updateUserField_(user.id, 'reset_expira', '');
  updateUserField_(user.id, 'session_token', '');
  updateUserField_(user.id, 'session_expira', '');
  registrarAuditoria_(user.id, 'RESET_CONFIRMAR', 'Contraseña restablecida exitosamente');
  return { ok: true, message: 'Tu contraseña se actualizó correctamente. Ya podés iniciar sesión.' };
}

// ── Áreas ────────────────────────────────────────────────────────────
function areasListar_(params) {
  let areas = getSheet_(SHEETS.AREAS);
  if (params.solo_activas) areas = areas.filter(a => String(a.activa).toUpperCase() === 'TRUE');
  return { ok: true, areas };
}
function areasCrear_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['nombre']);
  const newArea = {
    id: makeId_('AREA'), nombre: body.nombre.trim(), descripcion: body.descripcion || '',
    activa: true, fecha_creacion: new Date().toISOString()
  };
  appendRow_(SHEETS.AREAS, newArea);
  registrarAuditoria_(admin.id, 'AREA_CREADA', `Nueva área creada: ${newArea.nombre}`);
  return { ok: true, message: 'Área creada correctamente', area_id: newArea.id };
}
function areasEditar_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['area_id', 'nombre']);
  const area = findById_(SHEETS.AREAS, body.area_id);
  if (!area) throw new Error('Área no encontrada');
  updateField_(SHEETS.AREAS, body.area_id, 'nombre', body.nombre.trim());
  if (body.descripcion !== undefined) updateField_(SHEETS.AREAS, body.area_id, 'descripcion', body.descripcion.trim());
  registrarAuditoria_(admin.id, 'AREA_EDITADA', `Área editada: ${body.area_id}`);
  return { ok: true, message: 'Área editada correctamente' };
}
function areasToggleActiva_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['area_id']);
  const area = findById_(SHEETS.AREAS, body.area_id);
  if (!area) throw new Error('Área no encontrada');
  const nuevoEstado = String(area.activa).toUpperCase() === 'TRUE' ? false : true;
  updateField_(SHEETS.AREAS, body.area_id, 'activa', nuevoEstado);
  registrarAuditoria_(admin.id, 'AREA_TOGGLE', `Área ${body.area_id} activa: ${nuevoEstado}`);
  return { ok: true, message: `Área ${nuevoEstado ? 'activada' : 'desactivada'}` };
}

// ── Usuarios ─────────────────────────────────────────────────────────
function usuariosListar_(params) {
  requireAdmin_(params.session_token);
  let usuarios = getSheet_(SHEETS.USUARIOS);
  if (params.estado) usuarios = usuarios.filter(u => u.estado === params.estado);
  return { ok: true, usuarios: usuarios.map(userPublico_) };
}
function usuariosObtener_(params) {
  requireAdmin_(params.session_token);
  requireFields_(params, ['user_id']);
  const user = findById_(SHEETS.USUARIOS, params.user_id);
  if (!user) throw new Error('Usuario no encontrado');
  return { ok: true, usuario: userPublico_(user) };
}
function usuariosAprobar_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['user_id']);
  const user = findById_(SHEETS.USUARIOS, body.user_id);
  if (!user) throw new Error('Usuario no encontrado');
  if (user.estado !== 'pendiente') throw new Error('El usuario no está en estado pendiente');

  const userEsPlanBasic = esPlanBasic_(admin);
  let tipoUsuarioFinal = 'general';
  let areaIdFinal = '';
  let areaNombreLog = '(sin área)';

  if (!userEsPlanBasic) {
    const tieneTipoUsuario = body.tipo_usuario !== undefined && body.tipo_usuario !== null && String(body.tipo_usuario).trim() !== '';
    const tieneAreaId      = body.area_id !== undefined && body.area_id !== null && String(body.area_id).trim() !== '';

    if (tieneTipoUsuario && tieneAreaId) {
      if (!['general', 'jefe'].includes(body.tipo_usuario)) {
        throw new Error('Tipo de usuario inválido (debe ser general o jefe)');
      }
      const area = findById_(SHEETS.AREAS, body.area_id);
      if (!area) throw new Error('El área asignada no existe');
      tipoUsuarioFinal = body.tipo_usuario;
      areaIdFinal = body.area_id;
      areaNombreLog = area.nombre;
      if (tipoUsuarioFinal === 'jefe') {
        const usuariosArea = getSheet_(SHEETS.USUARIOS).filter(u => u.area_id === areaIdFinal);
        const jefeExistente = usuariosArea.find(u => u.tipo_usuario === 'jefe' && u.id !== body.user_id);
        if (jefeExistente) throw new Error(`Ya existe un jefe asignado a esta área (${jefeExistente.nombre})`);
      }
    } else if (tieneTipoUsuario && !tieneAreaId) {
      throw new Error('Si seleccionás un rol también tenés que asignar un área.');
    } else if (!tieneTipoUsuario && tieneAreaId) {
      throw new Error('Si seleccionás un área también tenés que elegir un rol (general o jefe).');
    }
  }

  updateUserField_(body.user_id, 'estado', 'activo');
  updateUserField_(body.user_id, 'tipo_usuario', tipoUsuarioFinal);
  updateUserField_(body.user_id, 'area_id', areaIdFinal);
  registrarAuditoria_(admin.id, 'APROBACION', `Usuario aprobado como ${tipoUsuarioFinal} de ${areaNombreLog}`);
  return { ok: true, message: 'Usuario aprobado y asignado correctamente' };
}
function usuariosListarPorArea_(params) {
  requireSession_(params.session_token);
  requireFields_(params, ['area_id']);
  const usuarios = getSheet_(SHEETS.USUARIOS).filter(u => u.area_id === params.area_id);
  return { ok: true, usuarios: usuarios.map(userPublico_) };
}
function usuariosRechazar_(body) {
  requireAdmin_(body.session_token);
  requireFields_(body, ['user_id']);
  const user = findById_(SHEETS.USUARIOS, body.user_id);
  if (!user) throw new Error('Usuario no encontrado');
  updateUserField_(body.user_id, 'estado', 'bloqueado');
  registrarAuditoria_(body.user_id, 'RECHAZO', 'Usuario rechazado/bloqueado');
  return { ok: true, message: 'Usuario rechazado' };
}
function usuariosCrear_(body) {
  requireAdmin_(body.session_token);
  requireFields_(body, ['nombre', 'email', 'password']);
  const email = body.email.trim().toLowerCase();
  if (getSheet_(SHEETS.USUARIOS).find(u => u.email === email)) throw new Error('El email ya está registrado');
  const newUser = {
    id: makeId_('USR'), nombre: body.nombre.trim(), email: email,
    password_hash: hashPassword_(body.password),
    rol: body.rol === 'admin' ? 'admin' : 'usuario', estado: 'activo',
    fecha_registro: new Date().toISOString(), session_token: '', session_expira: ''
  };
  appendRow_(SHEETS.USUARIOS, newUser);
  registrarAuditoria_(newUser.id, 'CREAR_USUARIO', `Admin creó usuario: ${email}`);
  return { ok: true, message: 'Usuario creado correctamente', user_id: newUser.id };
}

// ── Apuestas ─────────────────────────────────────────────────────────
function apuestasListar_(params) {
  const user = requireSession_(params.session_token);
  let apuestas = getSheet_(SHEETS.APUESTAS);
  if (params.estado) apuestas = apuestas.filter(a => a.estado === params.estado);

  const esPlanBasic = esPlanBasic_(user);
  if (esPlanBasic) apuestas = apuestas.filter(a => a.tipo !== 'grupos');

  if (user.rol !== 'admin') {
    apuestas = apuestas.filter(a => {
      if (a.tipo === 'libre') return true;
      if (a.tipo === 'grupos') {
        if (!a.areas_ids || !user.area_id) return false;
        const areas = a.areas_ids.split(',').map(id => id.trim());
        return areas.includes(user.area_id);
      }
      return true;
    });
  }

  const resultado = apuestas.map(a => ({
    ...a,
    fecha_cierre: fechaArgentinaAIsoUtc_(a.fecha_cierre),
    participantes: parseInt(a.total_participantes) || 0
  }));
  return { ok: true, apuestas: resultado };
}

function esPlanBasic_(user) {
  const plan = String(user.empresa || '').trim().toLowerCase();
  return plan === 'plan_basic';
}

function apuestasObtener_(params) {
  requireFields_(params, ['apuesta_id']);
  const apuesta = findById_(SHEETS.APUESTAS, params.apuesta_id);
  if (!apuesta) throw new Error('Apuesta no encontrada');
  const partidosIds = apuesta.partidos_ids ? apuesta.partidos_ids.split(',').map(id => id.trim()).filter(Boolean) : [];
  const selecciones = getSelecciones_();
  const partidosIdsSet = new Set(partidosIds);
  const partidos = getSheet_(SHEETS.PARTIDOS).filter(p => partidosIdsSet.has(p.id)).map(p => mapearPartido_(p, selecciones));
  return {
    ok: true,
    apuesta: {
      ...apuesta,
      fecha_cierre: fechaArgentinaAIsoUtc_(apuesta.fecha_cierre),
      partidos
    }
  };
}

function apuestasCrear_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['titulo', 'tipo', 'premio', 'fecha_cierre', 'partidos_ids']);
  if (!['libre', 'grupos'].includes(body.tipo)) throw new Error('Tipo de apuesta inválido. Use "libre" o "grupos"');

  if (body.tipo === 'grupos' && esPlanBasic_(admin)) {
    throw new Error('Tu plan no permite crear apuestas por áreas. Actualizá a Plan_pro para habilitar esta función.');
  }

  let areasIdsStr = '';
  if (body.tipo === 'grupos') {
    if (!body.areas_ids) throw new Error('Las apuestas por grupos requieren áreas participantes');
    const areasArr = Array.isArray(body.areas_ids) ? body.areas_ids : body.areas_ids.split(',');
    if (areasArr.length < 2) throw new Error('Debe haber al menos 2 áreas compitiendo');
    areasIdsStr = areasArr.map(id => id.trim()).join(',');
  }

  const fechaCierreIso = toIsoUtc_(body.fecha_cierre);
  if (new Date(fechaCierreIso).getTime() <= Date.now()) {
    throw new Error('La fecha de cierre debe ser futura');
  }

  const partidosIds = Array.isArray(body.partidos_ids) ? body.partidos_ids : body.partidos_ids.split(',').map(id => id.trim());
  if (!partidosIds.length) throw new Error('Debe incluir al menos un partido');
  const todosPartidos = getSheet_(SHEETS.PARTIDOS);
  const partidosMap = new Map(todosPartidos.map(p => [p.id, p]));
  partidosIds.forEach(pid => { if (!partidosMap.has(pid)) throw new Error(`Partido no encontrado: ${pid}`); });

  // ✅ VALIDACIÓN CRÍTICA: la fecha de cierre debe ser ANTERIOR al inicio del primer partido
  // (si no, los usuarios podrían apostar con el partido en curso o ya jugado)
  const fechaCierreTs = new Date(fechaCierreIso).getTime();
  let primerPartidoTs = Infinity;
  let primerPartidoInfo = null;
  partidosIds.forEach(pid => {
    const p = partidosMap.get(pid);
    if (!p || !p.fecha_hora) return;
    const isoPartido = fechaArgentinaAIsoUtc_(p.fecha_hora);
    if (!isoPartido) return;
    const ts = new Date(isoPartido).getTime();
    if (isNaN(ts)) return;
    if (ts < primerPartidoTs) {
      primerPartidoTs = ts;
      primerPartidoInfo = p;
    }
  });
  if (primerPartidoInfo && fechaCierreTs >= primerPartidoTs) {
    const fechaPartidoStr = Utilities.formatDate(new Date(primerPartidoTs), TZ_SERVIDOR, 'dd/MM/yyyy HH:mm');
    throw new Error(
      `La fecha de cierre debe ser anterior al inicio del primer partido. ` +
      `El primer partido (${primerPartidoInfo.local} vs ${primerPartidoInfo.visitante}) ` +
      `comienza el ${fechaPartidoStr} (hora Argentina).`
    );
  }

  const newApuesta = {
    id: makeId_('APU'), titulo: body.titulo.trim(), descripcion: body.descripcion || '',
    tipo: body.tipo, premio: body.premio.trim(), fecha_cierre: fechaCierreIso,
    estado: 'abierta', partidos_ids: partidosIds.join(','),
    puntos_exacto: parseInt(body.puntos_exacto) || 5,
    puntos_diferencia: parseInt(body.puntos_diferencia) || 3,
    puntos_resultado: parseInt(body.puntos_resultado) || 1,
    puntos_clasificado: parseInt(body.puntos_clasificado) || 1,
    creado_por: admin.id, fecha_creacion: new Date().toISOString(), areas_ids: areasIdsStr,
    total_participantes: 0
  };
  appendRow_(SHEETS.APUESTAS, newApuesta);
  registrarAuditoria_(admin.id, 'CREAR_APUESTA', `Apuesta creada: ${newApuesta.titulo}`);
  return { ok: true, message: 'Apuesta creada correctamente', apuesta_id: newApuesta.id };
}

function apuestasCerrar_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['apuesta_id']);
  const apuesta = findById_(SHEETS.APUESTAS, body.apuesta_id);
  if (!apuesta) throw new Error('Apuesta no encontrada');
  if (apuesta.estado !== 'abierta') throw new Error('Solo se pueden cerrar apuestas abiertas');
  updateField_(SHEETS.APUESTAS, body.apuesta_id, 'estado', 'cerrada');
  registrarAuditoria_(admin.id, 'CERRAR_APUESTA', `Apuesta cerrada: ${body.apuesta_id}`);
  return { ok: true, message: 'Apuesta cerrada correctamente' };
}

function apuestasReabrir_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['apuesta_id', 'nueva_fecha_cierre']);
  const apuesta = findById_(SHEETS.APUESTAS, body.apuesta_id);
  if (!apuesta) throw new Error('Apuesta no encontrada');
  if (apuesta.estado === 'finalizada') throw new Error('No se puede reabrir una apuesta ya finalizada');
  if (apuesta.estado !== 'cerrada' && apuesta.estado !== 'abierta') throw new Error('Estado de apuesta no válido para reabrir');

  const fechaCierreIso = toIsoUtc_(body.nueva_fecha_cierre);
  if (new Date(fechaCierreIso).getTime() <= Date.now()) {
    throw new Error('La nueva fecha de cierre debe ser futura');
  }

  updateField_(SHEETS.APUESTAS, body.apuesta_id, 'estado', 'abierta');
  updateField_(SHEETS.APUESTAS, body.apuesta_id, 'fecha_cierre', fechaCierreIso);
  // Campo opcional: si la hoja "apuestas" tiene columna "reabierta", la activa.
  // Si no existe la columna, simplemente se ignora el error.
  try { updateField_(SHEETS.APUESTAS, body.apuesta_id, 'reabierta', true); } catch (e) {}

  invalidateCache_(SHEETS.APUESTAS);
  registrarAuditoria_(admin.id, 'REABRIR_APUESTA', `Apuesta reabierta: ${body.apuesta_id}, nuevo cierre: ${fechaCierreIso}`);
  return { ok: true, message: 'Apuesta reabierta correctamente' };
}

function apuestasFinalizar_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['apuesta_id']);
  const apuesta = findById_(SHEETS.APUESTAS, body.apuesta_id);
  if (!apuesta) throw new Error('Apuesta no encontrada');
  if (apuesta.estado === 'finalizada') throw new Error('La apuesta ya está finalizada');
  const partidosIds = apuesta.partidos_ids.split(',').map(id => id.trim());
  const todosPartidos = getSheet_(SHEETS.PARTIDOS);
  const partidosMap = new Map(todosPartidos.map(p => [p.id, p]));
  const partidos = partidosIds.map(pid => {
    const p = partidosMap.get(pid);
    if (!p) throw new Error(`Partido no encontrado: ${pid}`);
    if (normalizarEstado_(p.estado) !== 'finalizado') throw new Error(`El partido ${pid} aún no está finalizado`);
    // Validación extra: eliminatorio empatado debe tener penales cargados
    if (esFaseEliminatoria_(p.fase)) {
      const gl = parseInt(p.goles_local), gv = parseInt(p.goles_visitante);
      if (gl === gv) {
        const pl = parseInt(p.penales_local), pv = parseInt(p.penales_visit);
        if (isNaN(pl) || isNaN(pv)) {
          throw new Error(`El partido ${pid} es eliminatorio y terminó empatado: faltan los penales para definir el clasificado.`);
        }
      }
    }
    return p;
  });
  partidos.forEach(partido => calcularPuntosPartidoEnApuesta_(partido, apuesta));
  updateField_(SHEETS.APUESTAS, body.apuesta_id, 'estado', 'finalizada');
  invalidateRankingCache_(body.apuesta_id);
  registrarAuditoria_(admin.id, 'FINALIZAR_APUESTA', `Apuesta finalizada: ${body.apuesta_id}`);
  return { ok: true, message: 'Apuesta finalizada y puntos calculados' };
}

function cerrarApuestasVencidas() {
  getSheet_(SHEETS.APUESTAS, false)
    .filter(a => a.estado === 'abierta' && yaVencio_(a.fecha_cierre))
    .forEach(a => {
      updateField_(SHEETS.APUESTAS, a.id, 'estado', 'cerrada');
      registrarAuditoria_('SISTEMA', 'CIERRE_AUTO', `Apuesta cerrada automáticamente: ${a.id}`);
    });
}

// ── Partidos ─────────────────────────────────────────────────────────
function getSelecciones_() {
  const idx = {};
  getSheet_(SHEETS.GRUPOS).forEach(f => {
    if (f.codigo) idx[f.codigo] = { nombre: f.nombre, bandera_url: f.bandera_url, grupo: f.grupo };
  });
  return idx;
}
function mapearPartido_(p, selecciones) {
  const local = selecciones ? selecciones[p.local] : null;
  const visitante = selecciones ? selecciones[p.visitante] : null;
  const estadoNorm = normalizarEstado_(p.estado);
  const minuto = estadoNorm === 'en_vivo' ? extraerMinuto_(p.estado) : '';
  return {
    id: p.id,
    equipo_local: local ? local.nombre : p.local,
    equipo_visitante: visitante ? visitante.nombre : p.visitante,
    bandera_local: local ? local.bandera_url : '',
    bandera_visitante: visitante ? visitante.bandera_url : '',
    codigo_local: p.local, codigo_visitante: p.visitante,
    fecha_partido: fechaArgentinaAIsoUtc_(p.fecha_hora),
    goles_local: p.goles_local, goles_visitante: p.goles_visitante,
    penales_local: p.penales_local, penales_visit: p.penales_visit,
    estado: estadoNorm,
    estado_raw: p.estado,
    minuto: minuto,
    fase: p.fase, grupo: p.grupo, jornada: p.jornada, sede: p.sede,
    es_eliminatoria: esFaseEliminatoria_(p.fase)
  };
}
function partidosListar_(params) {
  let partidos = getSheet_(SHEETS.PARTIDOS);
  if (params.estado)  partidos = partidos.filter(p => normalizarEstado_(p.estado) === params.estado);
  if (params.fase)    partidos = partidos.filter(p => p.fase === params.fase);
  if (params.grupo)   partidos = partidos.filter(p => p.grupo === params.grupo);
  if (params.jornada) partidos = partidos.filter(p => String(p.jornada) === String(params.jornada));
  partidos.sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  const selecciones = getSelecciones_();
  return { ok: true, partidos: partidos.map(p => mapearPartido_(p, selecciones)) };
}
function partidosObtener_(params) {
  requireFields_(params, ['partido_id']);
  const partido = findById_(SHEETS.PARTIDOS, params.partido_id);
  if (!partido) throw new Error('Partido no encontrado');
  return { ok: true, partido: mapearPartido_(partido, getSelecciones_()) };
}

function partidosActualizar_(body) {
  const admin = requireAdmin_(body.session_token);
  requireFields_(body, ['partido_id']);
  const partido = findById_(SHEETS.PARTIDOS, body.partido_id);
  if (!partido) throw new Error('Partido no encontrado');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PARTIDOS);
  const headers = getHeaders_(SHEETS.PARTIDOS);
  const rows = sheet.getDataRange().getValues();
  const rowIdx = rows.findIndex(r => r[0] === body.partido_id);
  if (rowIdx < 0) throw new Error('Partido no encontrado en la hoja');

  const updates = {};
  if (body.goles_local !== undefined)     updates['goles_local']     = body.goles_local;
  if (body.goles_visitante !== undefined) updates['goles_visitante'] = body.goles_visitante;
  if (body.penales_local !== undefined)   updates['penales_local']   = body.penales_local;
  if (body.penales_visit !== undefined)   updates['penales_visit']   = body.penales_visit;
  if (body.estado !== undefined) {
    const estadoNorm = normalizarEstado_(body.estado);
    if (!ESTADOS_VALIDOS.includes(estadoNorm)) {
      throw new Error('Estado inválido. Usar: programado, en_vivo, finalizado, cancelado.');
    }
    if (estadoNorm === 'en_vivo' && body.minuto !== undefined && body.minuto !== null && String(body.minuto).trim() !== '') {
      const minLimpio = String(body.minuto).replace(/['\s]/g, '');
      updates['estado'] = `en_vivo (${minLimpio}')`;
    } else {
      updates['estado'] = estadoNorm;
    }
  }

  Object.entries(updates).forEach(([col, val]) => {
    const colIdx = headers.indexOf(col);
    if (colIdx >= 0) sheet.getRange(rowIdx + 1, colIdx + 1).setValue(val);
  });
  invalidateCache_(SHEETS.PARTIDOS);

  const estadoFinalNorm = updates.estado !== undefined ? normalizarEstado_(updates.estado) : normalizarEstado_(partido.estado);
  const golesLocal  = updates.goles_local !== undefined ? updates.goles_local : partido.goles_local;
  const golesVisit  = updates.goles_visitante !== undefined ? updates.goles_visitante : partido.goles_visitante;

  let debeCalcular =
    estadoFinalNorm === 'finalizado' &&
    golesLocal !== '' && golesLocal !== null && !isNaN(parseInt(golesLocal)) &&
    golesVisit !== '' && golesVisit !== null && !isNaN(parseInt(golesVisit));

  // Si es eliminatorio empatado, exigir penales cargados
  if (debeCalcular && esFaseEliminatoria_(partido.fase) && parseInt(golesLocal) === parseInt(golesVisit)) {
    const penLocal = updates.penales_local !== undefined ? updates.penales_local : partido.penales_local;
    const penVisit = updates.penales_visit !== undefined ? updates.penales_visit : partido.penales_visit;
    if (penLocal === '' || penLocal === null || isNaN(parseInt(penLocal)) ||
        penVisit === '' || penVisit === null || isNaN(parseInt(penVisit))) {
      debeCalcular = false; // empate sin penales → trigger esperará a que se carguen
    }
  }

  let predsActualizadas = 0;
  if (debeCalcular) {
    const partidoActualizado = findById_(SHEETS.PARTIDOS, body.partido_id);
    predsActualizadas = calcularPuntosDePartido_(partidoActualizado);
  }

  registrarAuditoria_(
    admin.id, 'ACTUALIZAR_PARTIDO',
    `${body.partido_id}: ${JSON.stringify(updates)}${debeCalcular ? ` | puntos calculados: ${predsActualizadas} preds` : ''}`
  );

  return {
    ok: true,
    message: debeCalcular
      ? `Partido actualizado. ${predsActualizadas} predicciones puntuadas automáticamente.`
      : 'Partido actualizado correctamente'
  };
}

function partidosSincronizar_(params) {
  requireAdmin_(params.session_token);
  throw new Error('Sincronización automática deshabilitada. Los partidos del Mundial se cargan manualmente.');
}

// ── Grupos ───────────────────────────────────────────────────────────
function gruposListar_(params) {
  const filas = getSheet_(SHEETS.GRUPOS);
  const porGrupo = {};
  filas.forEach(f => {
    if (!f.grupo || !f.codigo) return;
    if (!porGrupo[f.grupo]) porGrupo[f.grupo] = [];
    porGrupo[f.grupo].push({
      grupo: f.grupo, codigo: f.codigo, nombre: f.nombre, bandera_url: f.bandera_url,
      j: parseInt(f.j)||0, g: parseInt(f.g)||0, e: parseInt(f.e)||0, p: parseInt(f.p)||0,
      gf: parseInt(f.gf)||0, gc: parseInt(f.gc)||0, dif: parseInt(f.dif)||0,
      pts: parseInt(f.pts)||0, pos: parseInt(f.pos)||0
    });
  });
  Object.keys(porGrupo).forEach(letra => porGrupo[letra].sort((a, b) => a.pos - b.pos));
  const grupos = Object.keys(porGrupo).sort().map(letra => ({ letra, selecciones: porGrupo[letra] }));
  return { ok: true, grupos };
}

// ── Predicciones ─────────────────────────────────────────────────────
function prediccionesGuardar_(body) {
  const user = requireSession_(body.session_token);
  requireFields_(body, ['apuesta_id', 'partido_id', 'pred_local', 'pred_visitante']);
  const apuesta = findById_(SHEETS.APUESTAS, body.apuesta_id);
  if (!apuesta) throw new Error('Apuesta no encontrada');
  if (apuesta.estado !== 'abierta') throw new Error('La apuesta no está abierta');
  if (yaVencio_(apuesta.fecha_cierre)) throw new Error('El tiempo límite ya expiró');

  let areaPrediccion = '';
  if (apuesta.tipo === 'grupos') {
    if (esPlanBasic_(user)) throw new Error('Tu plan no habilita las apuestas por áreas.');
    if (user.tipo_usuario !== 'jefe') throw new Error('Solo el referente/jefe del área puede cargar predicciones grupales');
    const areasParticipantes = apuesta.areas_ids.split(',').map(id => id.trim());
    if (!areasParticipantes.includes(user.area_id)) throw new Error('Tu área no participa en esta apuesta');
    areaPrediccion = user.area_id;
  }

  const partidosIds = apuesta.partidos_ids.split(',').map(id => id.trim());
  if (!partidosIds.includes(body.partido_id)) throw new Error('El partido no pertenece a esta apuesta');
  const partido = findById_(SHEETS.PARTIDOS, body.partido_id);
  if (!partido) throw new Error('Partido no encontrado');

  const predLocal = parseInt(body.pred_local);
  const predVisitante = parseInt(body.pred_visitante);
  if (isNaN(predLocal) || isNaN(predVisitante) || predLocal < 0 || predVisitante < 0) {
    throw new Error('Los valores de la predicción deben ser números no negativos');
  }

  // ─── Clasificado para fase eliminatoria ──────────────────────
  // Regla UX: si el marcador predicho tiene ganador claro (no-empate),
  // el clasificado se DEDUCE del marcador automáticamente.
  // Si el marcador predicho es empate, el usuario DEBE elegir explícitamente
  // a quién le da el desempate por penales.
  let predClasificado = '';
  if (esFaseEliminatoria_(partido.fase)) {
    if (predLocal !== predVisitante) {
      // Marcador con ganador claro → auto-asume el ganador del marcador
      predClasificado = predLocal > predVisitante ? partido.local : partido.visitante;
      // Si el frontend igual mandó pred_clasificado, validar que coincida
      // (defensa contra payloads malformados; en la práctica el frontend
      // ya manda el ganador correcto)
      if (body.pred_clasificado && String(body.pred_clasificado).trim() !== '') {
        const enviado = String(body.pred_clasificado).trim();
        if (enviado !== predClasificado) {
          // Honramos el marcador, no el clasificado enviado: el marcador es la "verdad" del usuario
          // No tiramos error para evitar fricción; simplemente prevalece el marcador
          predClasificado = predLocal > predVisitante ? partido.local : partido.visitante;
        }
      }
    } else {
      // Marcador empatado → el usuario tiene que elegir quién pasa por penales
      if (!body.pred_clasificado || String(body.pred_clasificado).trim() === '') {
        throw new Error('Predijiste un empate: tenés que indicar quién pasa por penales.');
      }
      const codigoElegido = String(body.pred_clasificado).trim();
      if (![partido.local, partido.visitante].map(s => String(s).trim()).includes(codigoElegido)) {
        throw new Error('El clasificado debe ser una de las dos selecciones del partido.');
      }
      predClasificado = codigoElegido;
    }
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PREDICCIONES);
  const headers = getHeaders_(SHEETS.PREDICCIONES);
  const colPredClasificado = headers.indexOf('pred_clasificado'); // -1 si todavía no existe la columna
  const lastRow = sheet.getLastRow();
  let existenteRowIdx = -1;
  let yaTieneOtraEnEstaApuesta = false;

  if (lastRow >= 2) {
    const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] === '') continue;
      if (row[1] !== body.apuesta_id) continue;
      const esMiaEnApuesta = apuesta.tipo === 'grupos' ? row[8] === user.area_id : row[2] === user.id;
      if (!esMiaEnApuesta) continue;
      yaTieneOtraEnEstaApuesta = true;
      if (row[3] === body.partido_id) { existenteRowIdx = i + 2; break; }
    }
  }

  if (existenteRowIdx > 0) {
    sheet.getRange(existenteRowIdx, 5).setValue(predLocal);
    sheet.getRange(existenteRowIdx, 6).setValue(predVisitante);
    sheet.getRange(existenteRowIdx, 8).setValue(new Date().toISOString());
    if (colPredClasificado >= 0) {
      sheet.getRange(existenteRowIdx, colPredClasificado + 1).setValue(predClasificado);
    }
  } else {
    appendRow_(SHEETS.PREDICCIONES, {
      id: makeId_('PRE'), apuesta_id: body.apuesta_id, user_id: user.id,
      partido_id: body.partido_id, pred_local: predLocal, pred_visitante: predVisitante,
      puntos: '', fecha_registro: new Date().toISOString(), area_id: areaPrediccion,
      pred_clasificado: predClasificado
    });
    if (!yaTieneOtraEnEstaApuesta) {
      const participantesActual = parseInt(apuesta.total_participantes) || 0;
      updateField_(SHEETS.APUESTAS, apuesta.id, 'total_participantes', participantesActual + 1);
    }
  }

  invalidateUserPredsCache_(user.id);
  if (areaPrediccion) invalidateAreaPredsCache_(areaPrediccion);
  invalidateRankingCache_(body.apuesta_id);
  invalidateCache_(SHEETS.PREDICCIONES);
  registrarAuditoria_(user.id, 'PREDICCION', `${body.partido_id}: ${predLocal}-${predVisitante}${predClasificado ? ` · clasif:${predClasificado}` : ''}`);
  return { ok: true, message: 'Predicción guardada correctamente' };
}

function prediccionesMias_(params) {
  const user = requireSession_(params.session_token);
  const cache = getCache_();

  const targetUserId = (user.rol === 'admin' && params.user_id) ? params.user_id : user.id;
  const targetUser   = (targetUserId === user.id) ? user : findById_(SHEETS.USUARIOS, targetUserId);
  if (!targetUser) throw new Error('Usuario no encontrado');

  let predicciones = null;
  try {
    const cached = cache.get('preds_user_' + targetUserId);
    if (cached) predicciones = JSON.parse(cached);
  } catch (e) {}

  if (!predicciones) {
    predicciones = leerPrediccionesDeUsuario_(targetUserId);
    try { cache.put('preds_user_' + targetUserId, JSON.stringify(predicciones), CACHE_TTL_USER_PREDS); } catch (e) {}
  }

  if (targetUser.area_id) {
    let predsArea = null;
    try {
      const cached = cache.get('preds_area_' + targetUser.area_id);
      if (cached) predsArea = JSON.parse(cached);
    } catch (e) {}
    if (!predsArea) {
      predsArea = leerPrediccionesDeArea_(targetUser.area_id);
      try { cache.put('preds_area_' + targetUser.area_id, JSON.stringify(predsArea), CACHE_TTL_AREA_PREDS); } catch (e) {}
    }
    const idsVistos = new Set(predicciones.map(p => p.id));
    predsArea.forEach(p => { if (!idsVistos.has(p.id)) predicciones.push(p); });
  }

  if (params.apuesta_id) predicciones = predicciones.filter(p => p.apuesta_id === params.apuesta_id);

  const userIdsNecesarios = [...new Set(predicciones.map(p => p.user_id))];
  const usuarios = getSheet_(SHEETS.USUARIOS);
  const usuariosMap = new Map(usuarios.filter(u => userIdsNecesarios.includes(u.id)).map(u => [u.id, u]));

  return {
    ok: true,
    predicciones: predicciones.map(p => ({
      ...p,
      cargada_por_nombre: (usuariosMap.get(p.user_id) && usuariosMap.get(p.user_id).nombre) || '',
      es_grupal: !!p.area_id,
      es_propia: p.user_id === user.id
    }))
  };
}

function leerPrediccionesDeUsuario_(userId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PREDICCIONES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const headers = getHeaders_(SHEETS.PREDICCIONES);
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const colUserId = headers.indexOf('user_id');
  const resultado = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][colUserId] === userId) {
      const obj = {};
      headers.forEach((h, j) => obj[h] = data[i][j]);
      resultado.push(obj);
    }
  }
  return resultado;
}
function leerPrediccionesDeArea_(areaId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PREDICCIONES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const headers = getHeaders_(SHEETS.PREDICCIONES);
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const colAreaId = headers.indexOf('area_id');
  const resultado = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][colAreaId] === areaId) {
      const obj = {};
      headers.forEach((h, j) => obj[h] = data[i][j]);
      resultado.push(obj);
    }
  }
  return resultado;
}

function prediccionesTabla_(params) {
  const user = requireSession_(params.session_token);
  requireFields_(params, ['apuesta_id']);
  const apuesta = findById_(SHEETS.APUESTAS, params.apuesta_id);
  if (!apuesta) throw new Error('Apuesta no encontrada');

  const limit = Math.min(parseInt(params.limit) || 50, 200);
  const cache = getCache_();
  let ranking = null;
  try {
    const cached = cache.get('ranking_' + params.apuesta_id);
    if (cached) ranking = JSON.parse(cached);
  } catch (e) {}

  if (!ranking) {
    ranking = construirRanking_(apuesta);
    try {
      const serialized = JSON.stringify(ranking);
      if (serialized.length < 100000) cache.put('ranking_' + params.apuesta_id, serialized, CACHE_TTL_RANKING);
    } catch (e) {}
  }

  const top = ranking.slice(0, limit).map((r, i) => ({ ...r, posicion: i + 1 }));
  let miPosicion = null;
  const miIndex = ranking.findIndex(r => r.user_id === user.id);
  if (miIndex >= 0) miPosicion = { ...ranking[miIndex], posicion: miIndex + 1 };
  const estaEnTop = miPosicion && miPosicion.posicion <= limit;

  return {
    ok: true,
    apuesta_titulo: apuesta.titulo,
    total: ranking.length,
    limit, tabla: top, mi_posicion: miPosicion, esta_en_top: estaEnTop
  };
}

function construirRanking_(apuesta) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PREDICCIONES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const headers = getHeaders_(SHEETS.PREDICCIONES);
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const colApuestaId = headers.indexOf('apuesta_id');
  const colUserId = headers.indexOf('user_id');
  const colPuntos = headers.indexOf('puntos');

  const usuarios = getSheet_(SHEETS.USUARIOS);
  const usuariosMap = new Map(usuarios.map(u => [u.id, u]));
  const ptsExacto      = parseInt(apuesta.puntos_exacto)      || 5;
  const ptsDiferencia  = parseInt(apuesta.puntos_diferencia)  || 3;
  const ptsResultado   = parseInt(apuesta.puntos_resultado)   || 1;
  const ptsClasificado = parseInt(apuesta.puntos_clasificado) || 1;

  const tabla = {};
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[colApuestaId] !== apuesta.id) continue;
    const uid = row[colUserId];
    if (!tabla[uid]) {
      const u = usuariosMap.get(uid);
      tabla[uid] = {
        user_id: uid, nombre: u ? u.nombre : 'Desconocido',
        puntos_totales: 0, aciertos_exactos: 0, aciertos_diferencia: 0,
        aciertos_resultado: 0, aciertos_clasificado: 0, predicciones: 0
      };
    }
    const puntos = parseInt(row[colPuntos]) || 0;
    tabla[uid].puntos_totales += puntos;
    tabla[uid].predicciones += 1;
    if (puntos === ptsExacto)            tabla[uid].aciertos_exactos++;
    else if (puntos === ptsDiferencia)   tabla[uid].aciertos_diferencia++;
    else if (puntos === ptsClasificado && puntos !== ptsResultado) tabla[uid].aciertos_clasificado++;
    else if (puntos === ptsResultado)    tabla[uid].aciertos_resultado++;
  }
  return Object.values(tabla).sort((a, b) => b.puntos_totales - a.puntos_totales);
}

// ── Helpers de sesión ────────────────────────────────────────────────
function requireSession_(token) {
  if (!token) throw new Error('Se requiere session_token');
  const user = getSheet_(SHEETS.USUARIOS, false).find(u => u.session_token === token);
  if (!user) throw new Error('Sesión inválida');
  if (yaVencio_(user.session_expira)) throw new Error('Sesión expirada');
  if (user.estado !== 'activo') throw new Error('Tu cuenta no está activa');
  return user;
}
function requireAdmin_(token) {
  const user = requireSession_(token);
  if (user.rol !== 'admin') throw new Error('Acceso denegado: se requiere rol admin');
  return user;
}
function crearSesion_(userId) {
  const token = Utilities.getUuid();
  const expira = new Date();
  expira.setHours(expira.getHours() + (parseInt(getConfig_('SESSION_HOURS')) || 12));
  updateUserField_(userId, 'session_token', token);
  updateUserField_(userId, 'session_expira', expira.toISOString());
  return token;
}
function getUserByToken_(token) {
  if (!token) return null;
  return getSheet_(SHEETS.USUARIOS, false).find(u => u.session_token === token) || null;
}

// ── Cálculo de puntos: trigger automático (todos los partidos) ────────
function calcularPuntosDePartido_(partido) {
  const realLocal = parseInt(partido.goles_local);
  const realVisit = parseInt(partido.goles_visitante);
  if (isNaN(realLocal) || isNaN(realVisit)) return 0;

  const apuestas = getSheet_(SHEETS.APUESTAS, false);
  const apuestasMap = new Map(apuestas.map(a => [a.id, a]));

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PREDICCIONES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const headers = getHeaders_(SHEETS.PREDICCIONES);
  const colApuestaId        = headers.indexOf('apuesta_id');
  const colPartidoId        = headers.indexOf('partido_id');
  const colPredLocal        = headers.indexOf('pred_local');
  const colPredVisitante    = headers.indexOf('pred_visitante');
  const colPuntos           = headers.indexOf('puntos');
  const colUserId           = headers.indexOf('user_id');
  const colAreaId           = headers.indexOf('area_id');
  const colPredClasificado  = headers.indexOf('pred_clasificado');

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const usuariosInvalidar = new Set();
  const areasInvalidar    = new Set();
  const apuestasInvalidar = new Set();
  let contador = 0;
  const updates = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[colPartidoId] !== partido.id) continue;
    const apuesta = apuestasMap.get(row[colApuestaId]);
    if (!apuesta) continue;

    const predLocal     = parseInt(row[colPredLocal]);
    const predVisit     = parseInt(row[colPredVisitante]);
    const predClasif    = colPredClasificado >= 0 ? row[colPredClasificado] : '';

    const puntos = calcularPuntosPrediccion_(partido, apuesta, predLocal, predVisit, predClasif);
    if (puntos === null) continue; // empate eliminatorio sin penales: postergar

    updates.push({ rowIdx: i + 2, puntos });
    if (row[colUserId])    usuariosInvalidar.add(row[colUserId]);
    if (row[colAreaId])    areasInvalidar.add(row[colAreaId]);
    if (row[colApuestaId]) apuestasInvalidar.add(row[colApuestaId]);
    contador++;
  }

  updates.forEach(u => sheet.getRange(u.rowIdx, colPuntos + 1).setValue(u.puntos));
  invalidateCache_(SHEETS.PREDICCIONES);
  usuariosInvalidar.forEach(uid => invalidateUserPredsCache_(uid));
  areasInvalidar.forEach(aid => invalidateAreaPredsCache_(aid));
  apuestasInvalidar.forEach(aid => invalidateRankingCache_(aid));
  return contador;
}

// ── Cálculo de puntos: cuando se finaliza una apuesta puntual ────────
function calcularPuntosPartidoEnApuesta_(partido, apuesta) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PREDICCIONES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const headers = getHeaders_(SHEETS.PREDICCIONES);
  const colApuestaId       = headers.indexOf('apuesta_id');
  const colPartidoId       = headers.indexOf('partido_id');
  const colPredLocal       = headers.indexOf('pred_local');
  const colPredVisitante   = headers.indexOf('pred_visitante');
  const colPuntos          = headers.indexOf('puntos');
  const colUserId          = headers.indexOf('user_id');
  const colAreaId          = headers.indexOf('area_id');
  const colPredClasificado = headers.indexOf('pred_clasificado');

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const usuariosInvalidar = new Set();
  const areasInvalidar = new Set();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[colPartidoId] !== partido.id) continue;
    if (row[colApuestaId] !== apuesta.id) continue;

    const predLocal  = parseInt(row[colPredLocal]);
    const predVisit  = parseInt(row[colPredVisitante]);
    const predClasif = colPredClasificado >= 0 ? row[colPredClasificado] : '';

    const puntos = calcularPuntosPrediccion_(partido, apuesta, predLocal, predVisit, predClasif);
    if (puntos === null) continue;

    sheet.getRange(i + 2, colPuntos + 1).setValue(puntos);
    if (row[colUserId]) usuariosInvalidar.add(row[colUserId]);
    if (row[colAreaId]) areasInvalidar.add(row[colAreaId]);
  }

  invalidateCache_(SHEETS.PREDICCIONES);
  usuariosInvalidar.forEach(uid => invalidateUserPredsCache_(uid));
  areasInvalidar.forEach(aid => invalidateAreaPredsCache_(aid));
}

// ── Hashing ──────────────────────────────────────────────────────────
function hashPassword_(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
function verificarPassword_(password, hash) { return hashPassword_(password) === hash; }

// ── Acceso al sheet con caché ────────────────────────────────────────
function getSheet_(sheetName, useCache = true) {
  if (useCache && CACHE_TTL[sheetName]) {
    try {
      const cached = getCache_().get('sheet_' + sheetName);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);
  const data = getDataRowsAsObjects_(sheet);
  if (useCache && CACHE_TTL[sheetName]) {
    try {
      const serialized = JSON.stringify(data);
      if (serialized.length < 100000) getCache_().put('sheet_' + sheetName, serialized, CACHE_TTL[sheetName]);
    } catch (e) { Logger.log('Cache put error: ' + e.message); }
  }
  return data;
}
function findById_(sheetName, id) { return getSheet_(sheetName).find(row => row.id === id) || null; }

function getHeaders_(sheetName) {
  if (HEADERS_CACHE[sheetName]) return HEADERS_CACHE[sheetName];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  HEADERS_CACHE[sheetName] = headers;
  return headers;
}

function appendRow_(sheetName, obj) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers = getHeaders_(sheetName);
  sheet.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
  invalidateCache_(sheetName);
}
function updateField_(sheetName, id, field, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers = getHeaders_(sheetName);
  const colIdx = headers.indexOf(field);
  if (colIdx < 0) throw new Error(`Campo no encontrado: ${field}`);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error(`Registro no encontrado: ${id}`);
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const rowIdx = ids.findIndex(r => r[0] === id);
  if (rowIdx < 0) throw new Error(`Registro no encontrado: ${id}`);
  sheet.getRange(rowIdx + 2, colIdx + 1).setValue(value);
  invalidateCache_(sheetName);
}
function updateUserField_(userId, field, value) { updateField_(SHEETS.USUARIOS, userId, field, value); }

function getDataRowsAsObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(row => row.some(cell => cell !== ''))
    .map(row => { const obj = {}; headers.forEach((h, i) => { obj[h] = row[i]; }); return obj; });
}
function getConfig_(clave) {
  const config = getSheet_(SHEETS.CONFIG).find(c => c.clave === clave);
  return config ? config.valor : null;
}
function registrarAuditoria_(userId, accion, detalle) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.AUDITORIA);
    const headers = getHeaders_(SHEETS.AUDITORIA);
    const obj = { fecha: new Date().toISOString(), user_id: userId, accion, detalle, ip: '' };
    sheet.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
  } catch (e) { Logger.log(`Error auditoría: ${e.message}`); }
}
function requireFields_(obj, fields) {
  fields.forEach(f => { if (obj[f] === undefined || obj[f] === null || obj[f] === '') throw new Error(`Campo requerido: "${f}"`); });
}
function makeId_(prefix) {
  return `${prefix}_${Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}
function userPublico_(user) {
  const { password_hash, session_token, session_expira, reset_token, reset_expira, ...pub } = user;
  return pub;
}
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function errorResponse_(message) { return { ok: false, error: message }; }

// ════════════════════════════════════════════════════════════════════
// UTILIDADES ONE-TIME
// ════════════════════════════════════════════════════════════════════

function recalcularPuntosPendientes() {
  const partidos = getSheet_(SHEETS.PARTIDOS, false);
  const finalizados = partidos.filter(p => {
    if (normalizarEstado_(p.estado) !== 'finalizado') return false;
    if (p.goles_local === '' || p.goles_local === null || isNaN(parseInt(p.goles_local))) return false;
    if (p.goles_visitante === '' || p.goles_visitante === null || isNaN(parseInt(p.goles_visitante))) return false;
    if (esFaseEliminatoria_(p.fase) && parseInt(p.goles_local) === parseInt(p.goles_visitante)) {
      if (isNaN(parseInt(p.penales_local)) || isNaN(parseInt(p.penales_visit))) return false;
    }
    return true;
  });
  Logger.log(`Encontrados ${finalizados.length} partidos finalizados puntuables.`);
  let totalPreds = 0;
  finalizados.forEach(p => {
    const n = calcularPuntosDePartido_(p);
    totalPreds += n;
    Logger.log(`${p.id} (${p.local} vs ${p.visitante}, ${p.goles_local}-${p.goles_visitante}): ${n} predicciones puntuadas`);
  });
  Logger.log(`═══ TOTAL: ${totalPreds} predicciones puntuadas ═══`);
  return totalPreds;
}

function sincronizarContadores() {
  const predicciones = getSheet_(SHEETS.PREDICCIONES, false);
  const apuestas = getSheet_(SHEETS.APUESTAS, false);
  apuestas.forEach(apu => {
    const preds = predicciones.filter(p => p.apuesta_id === apu.id);
    const uniqueKey = apu.tipo === 'grupos' ? 'area_id' : 'user_id';
    const participantes = new Set(preds.map(p => p[uniqueKey]).filter(Boolean)).size;
    updateField_(SHEETS.APUESTAS, apu.id, 'total_participantes', participantes);
    Logger.log(`${apu.titulo}: ${participantes} participantes`);
  });
  Logger.log('Sincronización completada.');
}

function debugFechaPartido() {
  const partidos = getSheet_(SHEETS.PARTIDOS, false);
  if (partidos.length === 0) { Logger.log('No hay partidos.'); return; }
  const p = partidos[0];
  const tzSheet = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  Logger.log('--- Diagnóstico de fechas ---');
  Logger.log('Zona del SHEET (clave): ' + tzSheet);
  Logger.log('Zona del SCRIPT: ' + Session.getScriptTimeZone());
  Logger.log('--- Primer partido ---');
  Logger.log('id: ' + p.id);
  Logger.log('local vs visitante: ' + p.local + ' vs ' + p.visitante);
  Logger.log('fecha_hora (crudo): ' + p.fecha_hora);
}

function testRapido() {
  Logger.log('Si ves esto, el archivo se guardó bien');
  Logger.log('Zona del script: ' + Session.getScriptTimeZone());
  Logger.log('Hora actual en AR: ' + Utilities.formatDate(new Date(), TZ_SERVIDOR, 'yyyy-MM-dd HH:mm:ss'));
  Logger.log('Hora actual en UTC: ' + new Date().toISOString());
}

// ════════════════════════════════════════════════════════════════════
// TRIGGER AUTOMÁTICO DE PUNTOS
// ════════════════════════════════════════════════════════════════════

const TRIGGER_MINUTOS = 5;
const HOJA_CONTROL    = 'procesados_control';

function procesarPartidosFinalizados() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('Otra ejecución en curso, salteando.');
    return;
  }
  try {
    const inicio = new Date();

    // ── PASO 1: Cerrar apuestas con fecha de cierre vencida ──
    let apuestasCerradasAuto = 0;
    try {
      const apuestasAbiertas = getSheet_(SHEETS.APUESTAS, false)
        .filter(a => a.estado === 'abierta' && yaVencio_(a.fecha_cierre));
      apuestasAbiertas.forEach(a => {
        updateField_(SHEETS.APUESTAS, a.id, 'estado', 'cerrada');
        Logger.log(`  ⏰ Apuesta cerrada automáticamente: ${a.id} (${a.titulo})`);
        apuestasCerradasAuto++;
      });
      if (apuestasCerradasAuto > 0) {
        registrarAuditoria_('SISTEMA', 'CIERRE_AUTO', `${apuestasCerradasAuto} apuestas cerradas por vencimiento`);
      }
    } catch (err) {
      Logger.log('Error cerrando apuestas vencidas: ' + err.message);
    }

    // ── PASO 2: Procesar partidos finalizados y puntuar predicciones ──
    const partidos = getSheet_(SHEETS.PARTIDOS, false);
    const finalizados = partidos.filter(p => {
      if (normalizarEstado_(p.estado) !== 'finalizado') return false;
      const gl = parseInt(p.goles_local), gv = parseInt(p.goles_visitante);
      if (isNaN(gl) || isNaN(gv)) return false;
      // Eliminatoria empatada: exigir penales cargados
      if (esFaseEliminatoria_(p.fase) && gl === gv) {
        const pl = parseInt(p.penales_local), pv = parseInt(p.penales_visit);
        if (isNaN(pl) || isNaN(pv)) return false;
      }
      return true;
    });

    if (finalizados.length === 0) {
      Logger.log(`No hay partidos finalizados para procesar.${apuestasCerradasAuto > 0 ? ` (${apuestasCerradasAuto} apuestas cerradas por vencimiento)` : ''}`);
      return;
    }

    const yaProcesados = leerProcesadosControl_();
    const pendientes = finalizados.filter(p => {
      const registro = yaProcesados[p.id];
      if (!registro) return true;
      // Re-procesar si cambiaron goles o penales
      const cambioGoles = registro.goles_local !== String(p.goles_local) || registro.goles_visitante !== String(p.goles_visitante);
      const cambioPenales = registro.penales_local !== String(p.penales_local || '') || registro.penales_visit !== String(p.penales_visit || '');
      return cambioGoles || cambioPenales;
    });

    if (pendientes.length === 0) {
      Logger.log(`${finalizados.length} partidos finalizados, todos ya procesados. OK.${apuestasCerradasAuto > 0 ? ` (${apuestasCerradasAuto} apuestas cerradas por vencimiento)` : ''}`);
      return;
    }

    Logger.log(`Procesando ${pendientes.length} partidos nuevos/modificados...`);
    let totalPreds = 0;
    const nuevosRegistros = [];

    pendientes.forEach(p => {
      try {
        const n = calcularPuntosDePartido_(p);
        totalPreds += n;
        const detalle = esFaseEliminatoria_(p.fase) && parseInt(p.goles_local) === parseInt(p.goles_visitante)
          ? `${p.local} ${p.goles_local}-${p.goles_visitante} ${p.visitante} (pen ${p.penales_local}-${p.penales_visit})`
          : `${p.local} ${p.goles_local}-${p.goles_visitante} ${p.visitante}`;
        Logger.log(`  ✓ ${p.id} (${detalle}): ${n} preds puntuadas`);
        nuevosRegistros.push({
          partido_id: p.id,
          goles_local: String(p.goles_local),
          goles_visitante: String(p.goles_visitante),
          penales_local: String(p.penales_local || ''),
          penales_visit: String(p.penales_visit || ''),
          fecha_procesado: new Date().toISOString(),
          predicciones_puntuadas: n
        });
      } catch (err) {
        Logger.log(`  ✗ ERROR en ${p.id}: ${err.message}`);
      }
    });

    if (nuevosRegistros.length > 0) guardarProcesadosControl_(nuevosRegistros, yaProcesados);

    const ms = new Date() - inicio;
    Logger.log(`═══ Listo: ${apuestasCerradasAuto} apuestas cerradas, ${pendientes.length} partidos procesados, ${totalPreds} predicciones, ${ms}ms ═══`);
    registrarAuditoria_('SISTEMA', 'TRIGGER_AUTO', `${apuestasCerradasAuto} apuestas cerradas + ${pendientes.length} partidos + ${totalPreds} predicciones puntuadas`);
  } catch (err) {
    Logger.log('ERROR GENERAL: ' + err.message);
    registrarAuditoria_('SISTEMA', 'TRIGGER_ERROR', err.message);
  } finally {
    lock.releaseLock();
  }
}

function leerProcesadosControl_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HOJA_CONTROL);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_CONTROL);
    sheet.appendRow(['partido_id', 'goles_local', 'goles_visitante', 'penales_local', 'penales_visit', 'fecha_procesado', 'predicciones_puntuadas']);
    return {};
  }
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  const lastCol = Math.max(7, sheet.getLastColumn());
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const map = {};
  data.forEach(r => {
    if (r[0]) {
      // Soporta tanto el formato viejo (5 cols) como el nuevo (7 cols)
      if (lastCol >= 7) {
        map[r[0]] = {
          goles_local: String(r[1]),
          goles_visitante: String(r[2]),
          penales_local: String(r[3] || ''),
          penales_visit: String(r[4] || ''),
          fecha_procesado: r[5],
          predicciones_puntuadas: r[6]
        };
      } else {
        map[r[0]] = {
          goles_local: String(r[1]),
          goles_visitante: String(r[2]),
          penales_local: '',
          penales_visit: '',
          fecha_procesado: r[3],
          predicciones_puntuadas: r[4]
        };
      }
    }
  });
  return map;
}

function guardarProcesadosControl_(nuevosRegistros, yaProcesados) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HOJA_CONTROL);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_CONTROL);
    sheet.appendRow(['partido_id', 'goles_local', 'goles_visitante', 'penales_local', 'penales_visit', 'fecha_procesado', 'predicciones_puntuadas']);
  }
  const lastRow = sheet.getLastRow();
  const existentes = lastRow >= 2 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => r[0]) : [];

  nuevosRegistros.forEach(reg => {
    const idx = existentes.indexOf(reg.partido_id);
    const fila = [reg.partido_id, reg.goles_local, reg.goles_visitante, reg.penales_local, reg.penales_visit, reg.fecha_procesado, reg.predicciones_puntuadas];
    if (idx >= 0) sheet.getRange(idx + 2, 1, 1, 7).setValues([fila]);
    else sheet.appendRow(fila);
  });
}

function instalarTriggerAutomatico() {
  desinstalarTriggerAutomatico();
  ScriptApp.newTrigger('procesarPartidosFinalizados')
    .timeBased()
    .everyMinutes(TRIGGER_MINUTOS)
    .create();
  Logger.log(`✓ Trigger instalado: corre cada ${TRIGGER_MINUTOS} minutos.`);
}

function desinstalarTriggerAutomatico() {
  const triggers = ScriptApp.getProjectTriggers();
  let removidos = 0;
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'procesarPartidosFinalizados') {
      ScriptApp.deleteTrigger(t);
      removidos++;
    }
  });
  Logger.log(`✓ ${removidos} trigger(s) removido(s).`);
}

function testTriggerAhora() {
  Logger.log('═══ TEST MANUAL DEL TRIGGER ═══');
  procesarPartidosFinalizados();
  Logger.log('═══ FIN TEST ═══');
}

function reiniciarControl() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_CONTROL);
  if (sheet) {
    ss.deleteSheet(sheet);
    Logger.log('✓ Control reiniciado.');
  } else {
    Logger.log('No había hoja de control.');
  }
}

function limpiarCacheGrupos() {
  CacheService.getScriptCache().remove('sheet_Grupos');
  Logger.log('✅ Caché de Grupos limpiada');
}