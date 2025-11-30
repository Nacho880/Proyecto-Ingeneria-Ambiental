'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, InfoCard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusLight'
import { ComparisonBarChart } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Form'
import {
  Activity,
  Plus,
  X,
  RefreshCw,
  ArrowLeftRight,
  Check,
  AlertTriangle,
} from 'lucide-react'

interface Lote {
  id: string
  numeroLote: string
  fechaCreacion: string
  estado: string
  datosProceso: {
    phReactor: number
    temperaturaReactor: number
    masaConcentrado: number
    volumenSolucion: number
    acidoSulfurico: number
  }[]
  datosCalidad: {
    porcentajeNi: number
    impurezaFe: number
    impurezaCu: number
    impurezaZn: number
    humedad: number
  }[]
  datosAmbientales: {
    phEfluente: number
    niEfluente: number
    feEfluente: number
    cuEfluente: number
    znEfluente: number
    caudalEfluente: number
  }[]
  calculos: {
    rendimientoLixiviacion: number
    recuperacionNi: number
    consumoEspecificoAcido: number
    consumoAgua: number
    indiceCircularidadAgua: number
    gradoBateria: boolean
  }[]
}

const COLORES_LOTES = [
  '#4caf50', // verde
  '#2196f3', // azul
  '#ff9800', // naranja
  '#e91e63', // rosa
  '#9c27b0', // púrpura
]

export default function ComparadorPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [lotesSeleccionados, setLotesSeleccionados] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLotes = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/lotes')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Solo lotes con datos completos (no en proceso)
        const lotesCompletos = result.data.filter((l: Lote) => 
          l.estado !== 'en_proceso' && 
          l.datosCalidad?.length > 0 && 
          l.calculos?.length > 0
        )
        setLotes(lotesCompletos)
      } else {
        setError('No se pudieron cargar los datos')
      }
    } catch (err) {
      console.error('Error cargando lotes:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLotes()
  }, [])

  const toggleLote = (id: string) => {
    if (lotesSeleccionados.includes(id)) {
      setLotesSeleccionados(lotesSeleccionados.filter(l => l !== id))
    } else if (lotesSeleccionados.length < 5) {
      setLotesSeleccionados([...lotesSeleccionados, id])
    }
  }

  const limpiarSeleccion = () => {
    setLotesSeleccionados([])
  }

  // Obtener datos de lotes seleccionados
  const lotesParaComparar = lotes.filter(l => lotesSeleccionados.includes(l.id))

  // Preparar datos para gráficos de comparación
  const datosProcesoComparacion = [
    {
      name: 'pH Reactor',
      ...Object.fromEntries(lotesParaComparar.map((l, i) => [l.numeroLote, l.datosProceso[0]?.phReactor || 0])),
      optimo: 1.5,
    },
    {
      name: 'Temp (°C/10)',
      ...Object.fromEntries(lotesParaComparar.map((l, i) => [l.numeroLote, (l.datosProceso[0]?.temperaturaReactor || 0) / 10])),
      optimo: 8.5,
    },
  ]

  const datosCalidadComparacion = [
    {
      name: '% Níquel',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.datosCalidad[0]?.porcentajeNi || 0])),
      minimo: 22,
    },
    {
      name: 'Fe (ppm)',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.datosCalidad[0]?.impurezaFe || 0])),
      limite: 10,
    },
    {
      name: 'Cu (ppm)',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.datosCalidad[0]?.impurezaCu || 0])),
      limite: 10,
    },
    {
      name: 'Zn (ppm)',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.datosCalidad[0]?.impurezaZn || 0])),
      limite: 10,
    },
  ]

  const datosRendimientoComparacion = [
    {
      name: 'Rendimiento',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.calculos[0]?.rendimientoLixiviacion || 0])),
    },
    {
      name: 'Recuperación',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.calculos[0]?.recuperacionNi || 0])),
    },
    {
      name: 'Circularidad H₂O',
      ...Object.fromEntries(lotesParaComparar.map(l => [l.numeroLote, l.calculos[0]?.indiceCircularidadAgua || 0])),
    },
  ]

  const barsConfig = lotesParaComparar.map((l, i) => ({
    dataKey: l.numeroLote,
    color: COLORES_LOTES[i % COLORES_LOTES.length],
    name: l.numeroLote,
  }))

  return (
    <DashboardLayout>
      <PageHeader
        title="Comparador de Lotes"
        description="Compara el rendimiento y calidad de diferentes lotes"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Comparador' },
        ]}
      />

      <ContentSection>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error} - <button onClick={fetchLotes} className="underline">Reintentar</button>
          </div>
        )}

        {/* Selector de lotes */}
        <Card className="p-4 mb-6" variant="gradient">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-nickel-400" />
              <span className="text-white font-medium">Selecciona hasta 5 lotes para comparar</span>
            </div>
            {lotesSeleccionados.length > 0 && (
              <Button variant="ghost" size="sm" onClick={limpiarSeleccion} icon={<X className="w-4 h-4" />}>
                Limpiar selección
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-industrial-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Cargando lotes...
            </div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-8 text-industrial-400">
              No hay lotes completados para comparar
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {lotes.slice(0, 15).map((lote, index) => {
                const isSelected = lotesSeleccionados.includes(lote.id)
                const selectedIndex = lotesSeleccionados.indexOf(lote.id)
                const color = isSelected ? COLORES_LOTES[selectedIndex % COLORES_LOTES.length] : undefined
                
                return (
                  <button
                    key={lote.id}
                    onClick={() => toggleLote(lote.id)}
                    disabled={!isSelected && lotesSeleccionados.length >= 5}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-current bg-current/10' 
                        : 'border-industrial-600/50 bg-industrial-800/30 hover:border-industrial-500/50'
                      }
                      ${!isSelected && lotesSeleccionados.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    style={isSelected ? { borderColor: color, backgroundColor: `${color}20` } : undefined}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold" style={isSelected ? { color } : { color: '#9ca3af' }}>
                        {lote.numeroLote.split('-').slice(-2).join('-')}
                      </span>
                      {isSelected && (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-industrial-400">
                      {new Date(lote.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="mt-1">
                      <StatusBadge
                        status={lote.estado === 'aprobado' ? 'verde' : 'rojo'}
                        label={lote.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {lotesSeleccionados.length > 0 && (
            <div className="mt-4 pt-4 border-t border-industrial-700/50 flex flex-wrap gap-2">
              <span className="text-sm text-industrial-400">Comparando:</span>
              {lotesParaComparar.map((lote, i) => (
                <span 
                  key={lote.id}
                  className="px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ 
                    backgroundColor: `${COLORES_LOTES[i]}20`, 
                    color: COLORES_LOTES[i],
                    border: `1px solid ${COLORES_LOTES[i]}50`
                  }}
                >
                  {lote.numeroLote}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Comparaciones */}
        {lotesParaComparar.length >= 2 ? (
          <>
            {/* Tabla comparativa */}
            <Card className="p-6 mb-6" variant="gradient">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-nickel-400" />
                Tabla Comparativa
              </h3>
              <div className="overflow-x-auto">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>Parámetro</th>
                      {lotesParaComparar.map((lote, i) => (
                        <th key={lote.id} style={{ color: COLORES_LOTES[i] }}>
                          {lote.numeroLote.split('-').slice(-2).join('-')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-industrial-800/20">
                      <td colSpan={lotesParaComparar.length + 1} className="text-industrial-400 text-xs font-semibold">
                        PROCESO
                      </td>
                    </tr>
                    <tr>
                      <td>pH Reactor</td>
                      {lotesParaComparar.map(l => (
                        <td key={l.id} className="font-mono">{l.datosProceso[0]?.phReactor.toFixed(2) || '-'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Temperatura</td>
                      {lotesParaComparar.map(l => (
                        <td key={l.id} className="font-mono">{l.datosProceso[0]?.temperaturaReactor.toFixed(1) || '-'} °C</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Masa Concentrado</td>
                      {lotesParaComparar.map(l => (
                        <td key={l.id} className="font-mono">{l.datosProceso[0]?.masaConcentrado.toFixed(0) || '-'} kg</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Ácido Sulfúrico</td>
                      {lotesParaComparar.map(l => (
                        <td key={l.id} className="font-mono">{l.datosProceso[0]?.acidoSulfurico.toFixed(0) || '-'} kg</td>
                      ))}
                    </tr>

                    <tr className="bg-industrial-800/20">
                      <td colSpan={lotesParaComparar.length + 1} className="text-industrial-400 text-xs font-semibold">
                        CALIDAD
                      </td>
                    </tr>
                    <tr>
                      <td>% Níquel</td>
                      {lotesParaComparar.map(l => {
                        const val = l.datosCalidad[0]?.porcentajeNi || 0
                        return (
                          <td key={l.id} className={`font-mono ${val >= 22 ? 'text-green-400' : 'text-red-400'}`}>
                            {val.toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Fe (ppm)</td>
                      {lotesParaComparar.map(l => {
                        const val = l.datosCalidad[0]?.impurezaFe || 0
                        return (
                          <td key={l.id} className={`font-mono ${val <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                            {val.toFixed(1)}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Cu (ppm)</td>
                      {lotesParaComparar.map(l => {
                        const val = l.datosCalidad[0]?.impurezaCu || 0
                        return (
                          <td key={l.id} className={`font-mono ${val <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                            {val.toFixed(1)}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Zn (ppm)</td>
                      {lotesParaComparar.map(l => {
                        const val = l.datosCalidad[0]?.impurezaZn || 0
                        return (
                          <td key={l.id} className={`font-mono ${val <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                            {val.toFixed(1)}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Humedad</td>
                      {lotesParaComparar.map(l => {
                        const val = l.datosCalidad[0]?.humedad || 0
                        return (
                          <td key={l.id} className={`font-mono ${val <= 1.0 ? 'text-green-400' : 'text-red-400'}`}>
                            {val.toFixed(2)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Grado</td>
                      {lotesParaComparar.map(l => (
                        <td key={l.id}>
                          {l.estado === 'rechazado' ? (
                            <span className="text-red-400">-</span>
                          ) : l.calculos[0]?.gradoBateria ? (
                            <span className="text-green-400">Batería</span>
                          ) : (
                            <span className="text-industrial-400">Estándar</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-industrial-800/20">
                      <td colSpan={lotesParaComparar.length + 1} className="text-industrial-400 text-xs font-semibold">
                        RENDIMIENTO
                      </td>
                    </tr>
                    <tr>
                      <td>Rendimiento Lixiviación</td>
                      {lotesParaComparar.map(l => {
                        const val = l.calculos[0]?.rendimientoLixiviacion || 0
                        return (
                          <td key={l.id} className={`font-mono ${val >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {val.toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Recuperación Ni</td>
                      {lotesParaComparar.map(l => {
                        const val = l.calculos[0]?.recuperacionNi || 0
                        return (
                          <td key={l.id} className={`font-mono ${val >= 92 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {val.toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Consumo Ácido</td>
                      {lotesParaComparar.map(l => {
                        const val = l.calculos[0]?.consumoEspecificoAcido || 0
                        return (
                          <td key={l.id} className={`font-mono ${val <= 200 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {val.toFixed(0)} kg/t
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td>Circularidad Agua</td>
                      {lotesParaComparar.map(l => {
                        const val = l.calculos[0]?.indiceCircularidadAgua || 0
                        return (
                          <td key={l.id} className={`font-mono ${val >= 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {val.toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>

                    <tr className="bg-industrial-800/20">
                      <td colSpan={lotesParaComparar.length + 1} className="text-industrial-400 text-xs font-semibold">
                        RESULTADO
                      </td>
                    </tr>
                    <tr>
                      <td>Estado Final</td>
                      {lotesParaComparar.map(l => (
                        <td key={l.id}>
                          <StatusBadge
                            status={l.estado === 'aprobado' ? 'verde' : 'rojo'}
                            label={l.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Gráficos de comparación */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <InfoCard
                title="Comparación de Calidad"
                icon={<Activity className="w-5 h-5" />}
              >
                <ComparisonBarChart
                  data={datosCalidadComparacion}
                  bars={barsConfig}
                  height={280}
                />
              </InfoCard>

              <InfoCard
                title="Comparación de Rendimiento (%)"
                icon={<Activity className="w-5 h-5" />}
              >
                <ComparisonBarChart
                  data={datosRendimientoComparacion}
                  bars={barsConfig}
                  height={280}
                />
              </InfoCard>
            </div>

            {/* Resumen */}
            <Card className="p-6" variant="gradient">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen de Comparación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-industrial-800/50 rounded-lg p-4">
                  <div className="text-sm text-industrial-400 mb-2">Mejor % Níquel</div>
                  {(() => {
                    const mejor = lotesParaComparar.reduce((best, l) => 
                      (l.datosCalidad[0]?.porcentajeNi || 0) > (best.datosCalidad[0]?.porcentajeNi || 0) ? l : best
                    )
                    const idx = lotesParaComparar.indexOf(mejor)
                    return (
                      <div>
                        <span className="text-2xl font-bold font-mono" style={{ color: COLORES_LOTES[idx] }}>
                          {mejor.datosCalidad[0]?.porcentajeNi.toFixed(1)}%
                        </span>
                        <span className="text-sm text-industrial-400 ml-2">{mejor.numeroLote}</span>
                      </div>
                    )
                  })()}
                </div>
                <div className="bg-industrial-800/50 rounded-lg p-4">
                  <div className="text-sm text-industrial-400 mb-2">Mejor Rendimiento</div>
                  {(() => {
                    const mejor = lotesParaComparar.reduce((best, l) => 
                      (l.calculos[0]?.rendimientoLixiviacion || 0) > (best.calculos[0]?.rendimientoLixiviacion || 0) ? l : best
                    )
                    const idx = lotesParaComparar.indexOf(mejor)
                    return (
                      <div>
                        <span className="text-2xl font-bold font-mono" style={{ color: COLORES_LOTES[idx] }}>
                          {mejor.calculos[0]?.rendimientoLixiviacion.toFixed(1)}%
                        </span>
                        <span className="text-sm text-industrial-400 ml-2">{mejor.numeroLote}</span>
                      </div>
                    )
                  })()}
                </div>
                <div className="bg-industrial-800/50 rounded-lg p-4">
                  <div className="text-sm text-industrial-400 mb-2">Menor Consumo Ácido</div>
                  {(() => {
                    const mejor = lotesParaComparar.reduce((best, l) => 
                      (l.calculos[0]?.consumoEspecificoAcido || 999) < (best.calculos[0]?.consumoEspecificoAcido || 999) ? l : best
                    )
                    const idx = lotesParaComparar.indexOf(mejor)
                    return (
                      <div>
                        <span className="text-2xl font-bold font-mono" style={{ color: COLORES_LOTES[idx] }}>
                          {mejor.calculos[0]?.consumoEspecificoAcido.toFixed(0)} kg/t
                        </span>
                        <span className="text-sm text-industrial-400 ml-2">{mejor.numeroLote}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </Card>
          </>
        ) : lotesSeleccionados.length === 1 ? (
          <Card className="p-8 text-center" variant="gradient">
            <Plus className="w-16 h-16 mx-auto mb-4 text-industrial-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Selecciona al menos otro lote</h3>
            <p className="text-industrial-400">Necesitas seleccionar mínimo 2 lotes para compararlos</p>
          </Card>
        ) : (
          <Card className="p-8 text-center" variant="gradient">
            <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-industrial-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Selecciona lotes para comparar</h3>
            <p className="text-industrial-400">Haz clic en los lotes de arriba para seleccionarlos y ver la comparación</p>
          </Card>
        )}
      </ContentSection>
    </DashboardLayout>
  )
}
