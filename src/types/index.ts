// Tipos para el sistema de monitoreo de lixiviación de níquel

export interface Lote {
  id: string
  numeroLote: string
  fechaCreacion: Date
  fechaCierre: Date | null
  estado: EstadoLote
  datosProceso: DatoProceso[]
  datosCalidad: DatoCalidad[]
  datosAmbientales: DatoAmbiental[]
  calculos: Calculo[]
}

export type EstadoLote = 'en_proceso' | 'aprobado' | 'rechazado'

export interface DatoProceso {
  id: string
  loteId: string
  phReactor: number
  temperaturaReactor: number
  masaConcentrado: number
  volumenSolucion: number
  acidoSulfurico: number
  timestamp: Date
}

export interface DatoCalidad {
  id: string
  loteId: string
  porcentajeNi: number
  impurezaFe: number
  impurezaCu: number
  impurezaZn: number
  humedad: number
  timestamp: Date
}

export interface DatoAmbiental {
  id: string
  loteId: string
  phEfluente: number
  niEfluente: number
  feEfluente: number
  cuEfluente: number
  znEfluente: number
  caudalEfluente: number
  aguaRecirculada: number
  aguaFresca: number
  timestamp: Date
}

export interface Calculo {
  id: string
  loteId: string
  rendimientoLixiviacion: number | null
  recuperacionNi: number | null
  consumoEspecificoAcido: number | null
  consumoAgua: number | null
  indiceCircularidadAgua: number | null
  cargaContaminanteNi: number | null
  purezaTotal: number | null
  gradoBateria: boolean | null
  cumplimientoPH: boolean | null
  cumplimientoMetales: boolean | null
  cumplimientoGeneral: boolean | null
  timestamp: Date
}

export interface LimiteAmbiental {
  id: string
  parametro: string
  valor: number
  unidad: string
  descripcion: string | null
}

export interface EspecificacionCalidad {
  id: string
  parametro: string
  valor: number
  unidad: string
  descripcion: string | null
}

// Tipos para formularios
export interface FormularioProceso {
  phReactor: string
  temperaturaReactor: string
  masaConcentrado: string
  volumenSolucion: string
  acidoSulfurico: string
}

export interface FormularioCalidad {
  porcentajeNi: string
  impurezaFe: string
  impurezaCu: string
  impurezaZn: string
  humedad: string
}

export interface FormularioAmbiental {
  phEfluente: string
  niEfluente: string
  feEfluente: string
  cuEfluente: string
  znEfluente: string
  caudalEfluente: string
  aguaRecirculada: string
  aguaFresca: string
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipos para estadísticas
export interface Estadisticas {
  periodo: string
  fechaInicio: string
  fechaFin: string
  lotes: {
    total: number
    aprobados: number
    rechazados: number
    enProceso: number
    tasaAprobacion: number
  }
  kpis: {
    rendimientoLixiviacion: number
    recuperacionNi: number
    consumoEspecificoAcido: number
    indiceCircularidadAgua: number
    purezaTotal: number
    tasaGradoBateria: number
  }
  calidad: {
    porcentajeNi: number
    impurezaFe: number
    impurezaCu: number
    impurezaZn: number
    humedad: number
  }
  ambiental: {
    phEfluente: number
    niEfluente: number
    caudalEfluente: number
    aguaRecirculada: number
    aguaFresca: number
  }
}

// Tipos para gráficos
export interface ChartDataPoint {
  name: string
  [key: string]: number | string
}

export interface TrendData {
  timestamp: Date
  value: number
}

// Estado de semáforo
export type StatusType = 'verde' | 'amarillo' | 'rojo' | 'apagado'

// Rangos para semáforos
export interface RangoSemaforo {
  verde: { min?: number; max?: number }
  amarillo: { min?: number; max?: number }
}


