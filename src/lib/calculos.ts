// Lógica de cálculos de KPIs para el proceso de lixiviación de níquel

export interface DatosProceso {
  phReactor: number
  temperaturaReactor: number
  masaConcentrado: number // kg
  volumenSolucion: number // L
  acidoSulfurico: number // kg
}

export interface DatosCalidad {
  porcentajeNi: number // %
  impurezaFe: number // ppm
  impurezaCu: number // ppm
  impurezaZn: number // ppm
  humedad: number // %
}

export interface DatosAmbientales {
  phEfluente: number
  niEfluente: number // mg/L
  feEfluente: number // mg/L
  cuEfluente: number // mg/L
  znEfluente: number // mg/L
  caudalEfluente: number // m³/día
  aguaRecirculada: number // m³/día
  aguaFresca: number // m³/día
}

export interface LimitesAmbientales {
  pH_min: number
  pH_max: number
  Ni_max: number // mg/L
  Fe_max: number // mg/L
  Cu_max: number // mg/L
  Zn_max: number // mg/L
}

export interface EspecificacionesCalidad {
  Ni_min: number // %
  Fe_max: number // ppm
  Cu_max: number // ppm
  Zn_max: number // ppm
  Humedad_max: number // %
}

export interface ResultadosKPI {
  // KPIs de proceso
  rendimientoLixiviacion: number // %
  recuperacionNi: number // %
  consumoEspecificoAcido: number // kg/t
  
  // KPIs ambientales
  consumoAgua: number // m³/t
  indiceCircularidadAgua: number // %
  cargaContaminanteNi: number // kg Ni/día
  
  // KPIs de calidad
  purezaTotal: number // %
  gradoBateria: boolean
  
  // Cumplimiento
  cumplimientoPH: boolean
  cumplimientoMetales: boolean
  cumplimientoGeneral: boolean
  
  // Estado del lote
  estadoLote: 'aprobado' | 'rechazado' | 'en_proceso'
}

// Constantes de proceso típicas
const NI_EN_CONCENTRADO = 0.15 // 15% Ni típico en concentrado de níquel
const DENSIDAD_ACIDO = 1.84 // kg/L para H2SO4 concentrado

/**
 * Calcula el rendimiento de lixiviación
 * Basado en la eficiencia de extracción del níquel del concentrado
 */
export function calcularRendimientoLixiviacion(
  masaConcentrado: number,
  porcentajeNiProducto: number,
  masaProducto: number = 0
): number {
  // Si no hay masa de producto, estimamos basado en el % de Ni esperado
  const niEnConcentrado = masaConcentrado * NI_EN_CONCENTRADO
  const niRecuperado = masaProducto > 0 
    ? masaProducto * (porcentajeNiProducto / 100)
    : niEnConcentrado * 0.92 // Eficiencia típica 92%
  
  const rendimiento = (niRecuperado / niEnConcentrado) * 100
  return Math.min(100, Math.max(0, rendimiento))
}

/**
 * Calcula la recuperación de níquel
 * Porcentaje del níquel que se recupera efectivamente
 */
export function calcularRecuperacionNi(
  masaConcentrado: number,
  porcentajeNiProducto: number,
  impurezas: { Fe: number; Cu: number; Zn: number }
): number {
  // La recuperación depende de la pureza y las pérdidas en impurezas
  const totalImpurezas = (impurezas.Fe + impurezas.Cu + impurezas.Zn) / 10000 // Convertir ppm a %
  const factorPureza = 1 - totalImpurezas
  
  // Recuperación base ajustada por pureza
  const recuperacionBase = 90 + (porcentajeNiProducto - 20) * 0.5
  const recuperacion = recuperacionBase * factorPureza
  
  return Math.min(99, Math.max(70, recuperacion))
}

/**
 * Calcula el consumo específico de ácido sulfúrico
 * kg de ácido por tonelada de concentrado procesado
 */
export function calcularConsumoEspecificoAcido(
  acidoSulfurico: number,
  masaConcentrado: number
): number {
  const masaToneladas = masaConcentrado / 1000
  return masaToneladas > 0 ? acidoSulfurico / masaToneladas : 0
}

/**
 * Calcula el consumo de agua
 * m³ de agua fresca por tonelada de concentrado
 */
export function calcularConsumoAgua(
  aguaFresca: number,
  masaConcentrado: number
): number {
  const masaToneladas = masaConcentrado / 1000
  return masaToneladas > 0 ? aguaFresca / masaToneladas : 0
}

/**
 * Calcula el índice de circularidad del agua
 * Porcentaje de agua que se recircula vs total
 */
export function calcularIndiceCircularidadAgua(
  aguaRecirculada: number,
  aguaFresca: number
): number {
  const aguaTotal = aguaRecirculada + aguaFresca
  return aguaTotal > 0 ? (aguaRecirculada / aguaTotal) * 100 : 0
}

/**
 * Calcula la carga contaminante de níquel en el efluente
 * kg de Ni descargado por día
 */
export function calcularCargaContaminanteNi(
  niEfluente: number, // mg/L
  caudalEfluente: number // m³/día
): number {
  // mg/L * m³/día = g/día / 1000 = kg/día
  return (niEfluente * caudalEfluente) / 1000
}

/**
 * Calcula la pureza total del producto
 * Basado en el contenido de Ni y las impurezas
 */
export function calcularPurezaTotal(
  porcentajeNi: number,
  impurezas: { Fe: number; Cu: number; Zn: number },
  humedad: number
): number {
  // Convertir impurezas de ppm a %
  const totalImpurezasPct = (impurezas.Fe + impurezas.Cu + impurezas.Zn) / 10000
  // La pureza es 100% menos impurezas y humedad (considerando que el Ni es el componente principal)
  const pureza = 100 - totalImpurezasPct - humedad
  return Math.min(100, Math.max(0, pureza))
}

/**
 * Determina si el producto cumple especificaciones de grado batería
 */
export function verificarGradoBateria(
  calidad: DatosCalidad,
  specs: EspecificacionesCalidad
): boolean {
  return (
    calidad.porcentajeNi >= specs.Ni_min &&
    calidad.impurezaFe <= specs.Fe_max &&
    calidad.impurezaCu <= specs.Cu_max &&
    calidad.impurezaZn <= specs.Zn_max &&
    calidad.humedad <= specs.Humedad_max
  )
}

/**
 * Verifica cumplimiento de pH en efluente
 */
export function verificarCumplimientoPH(
  phEfluente: number,
  limites: LimitesAmbientales
): boolean {
  return phEfluente >= limites.pH_min && phEfluente <= limites.pH_max
}

/**
 * Verifica cumplimiento de metales en efluente
 */
export function verificarCumplimientoMetales(
  ambientales: DatosAmbientales,
  limites: LimitesAmbientales
): boolean {
  return (
    ambientales.niEfluente <= limites.Ni_max &&
    ambientales.feEfluente <= limites.Fe_max &&
    ambientales.cuEfluente <= limites.Cu_max &&
    ambientales.znEfluente <= limites.Zn_max
  )
}

/**
 * Calcula todos los KPIs para un lote
 */
export function calcularTodosLosKPIs(
  proceso: DatosProceso,
  calidad: DatosCalidad,
  ambientales: DatosAmbientales,
  limitesAmbientales: LimitesAmbientales,
  especificacionesCalidad: EspecificacionesCalidad
): ResultadosKPI {
  const impurezas = {
    Fe: calidad.impurezaFe,
    Cu: calidad.impurezaCu,
    Zn: calidad.impurezaZn,
  }

  const rendimientoLixiviacion = calcularRendimientoLixiviacion(
    proceso.masaConcentrado,
    calidad.porcentajeNi
  )

  const recuperacionNi = calcularRecuperacionNi(
    proceso.masaConcentrado,
    calidad.porcentajeNi,
    impurezas
  )

  const consumoEspecificoAcido = calcularConsumoEspecificoAcido(
    proceso.acidoSulfurico,
    proceso.masaConcentrado
  )

  const consumoAgua = calcularConsumoAgua(
    ambientales.aguaFresca,
    proceso.masaConcentrado
  )

  const indiceCircularidadAgua = calcularIndiceCircularidadAgua(
    ambientales.aguaRecirculada,
    ambientales.aguaFresca
  )

  const cargaContaminanteNi = calcularCargaContaminanteNi(
    ambientales.niEfluente,
    ambientales.caudalEfluente
  )

  const purezaTotal = calcularPurezaTotal(
    calidad.porcentajeNi,
    impurezas,
    calidad.humedad
  )

  const gradoBateria = verificarGradoBateria(calidad, especificacionesCalidad)
  const cumplimientoPH = verificarCumplimientoPH(ambientales.phEfluente, limitesAmbientales)
  const cumplimientoMetales = verificarCumplimientoMetales(ambientales, limitesAmbientales)
  const cumplimientoGeneral = cumplimientoPH && cumplimientoMetales && gradoBateria

  // Determinar estado del lote
  let estadoLote: 'aprobado' | 'rechazado' | 'en_proceso' = 'en_proceso'
  if (cumplimientoGeneral) {
    estadoLote = 'aprobado'
  } else if (!cumplimientoPH || !cumplimientoMetales) {
    estadoLote = 'rechazado'
  }

  return {
    rendimientoLixiviacion,
    recuperacionNi,
    consumoEspecificoAcido,
    consumoAgua,
    indiceCircularidadAgua,
    cargaContaminanteNi,
    purezaTotal,
    gradoBateria,
    cumplimientoPH,
    cumplimientoMetales,
    cumplimientoGeneral,
    estadoLote,
  }
}

/**
 * Determina el estado del semáforo para un valor dado
 */
export function obtenerEstadoSemaforo(
  valor: number,
  limiteVerde: number,
  limiteAmarillo: number,
  invertido: boolean = false
): 'verde' | 'amarillo' | 'rojo' {
  if (invertido) {
    // Para valores donde menor es mejor (ej: impurezas)
    if (valor <= limiteVerde) return 'verde'
    if (valor <= limiteAmarillo) return 'amarillo'
    return 'rojo'
  } else {
    // Para valores donde mayor es mejor (ej: rendimiento)
    if (valor >= limiteVerde) return 'verde'
    if (valor >= limiteAmarillo) return 'amarillo'
    return 'rojo'
  }
}

/**
 * Rangos para semáforos de proceso
 */
export const RANGOS_SEMAFORO = {
  phReactor: { verde: { min: 1.3, max: 2.0 }, amarillo: { min: 1.0, max: 2.5 } },
  temperatura: { verde: { min: 80, max: 90 }, amarillo: { min: 70, max: 95 } },
  rendimiento: { verde: 90, amarillo: 80 },
  recuperacion: { verde: 92, amarillo: 85 },
  circularidadAgua: { verde: 85, amarillo: 70 },
  porcentajeNi: { verde: 22, amarillo: 20 },
  impurezas: { verde: 10, amarillo: 20 }, // ppm
  humedad: { verde: 0.5, amarillo: 1.0 }, // %
}


