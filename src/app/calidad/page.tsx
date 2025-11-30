'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, MetricCard, InfoCard, StatRow } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusLight'
import { TrendLineChart, ComparisonBarChart, DonutChart } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Form'
import {
  FlaskConical,
  Award,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  BarChart3,
  FileText,
} from 'lucide-react'

interface Lote {
  id: string
  numeroLote: string
  fechaCreacion: string
  estado: string
  datosCalidad: {
    porcentajeNi: number
    impurezaFe: number
    impurezaCu: number
    impurezaZn: number
    humedad: number
  }[]
  calculos: {
    gradoBateria: boolean
  }[]
}

type VistaMode = 'promedio' | 'lote'

export default function CalidadPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'aprobado' | 'rechazado' | 'en_proceso'>('todos')
  
  // Nuevo: modo de vista y lote seleccionado
  const [vistaMode, setVistaMode] = useState<VistaMode>('promedio')
  const [loteSeleccionado, setLoteSeleccionado] = useState<string>('')

  const fetchLotes = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/lotes')
      const result = await response.json()
      
      if (result.success && result.data) {
        setLotes(result.data)
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

  // Filtrar lotes con datos de calidad
  const lotesConCalidad = lotes.filter(l => l.datosCalidad && l.datosCalidad.length > 0)
  
  // Obtener lote específico si está seleccionado
  const loteActual = vistaMode === 'lote' && loteSeleccionado 
    ? lotesConCalidad.find(l => l.id === loteSeleccionado)
    : null

  // Calcular KPIs (promedio o lote específico)
  const calcularKPIs = () => {
    if (vistaMode === 'lote' && loteActual) {
      const cal = loteActual.datosCalidad[0]
      return {
        promedioNi: cal?.porcentajeNi || 0,
        promedioFe: cal?.impurezaFe || 0,
        promedioCu: cal?.impurezaCu || 0,
        promedioZn: cal?.impurezaZn || 0,
        promedioHumedad: cal?.humedad || 0,
        promedioImpurezas: ((cal?.impurezaFe || 0) + (cal?.impurezaCu || 0) + (cal?.impurezaZn || 0)) / 3,
        tasaAprobacion: loteActual.estado === 'aprobado' ? 100 : 0,
        lotesGradoBateria: loteActual.calculos[0]?.gradoBateria ? 100 : 0,
        esLoteIndividual: true,
        gradoBateria: loteActual.calculos[0]?.gradoBateria || false,
        estado: loteActual.estado,
      }
    }

    // Modo promedio
    const lotesParaCalculo = lotesConCalidad
    return {
      promedioNi: lotesParaCalculo.length > 0 
        ? lotesParaCalculo.reduce((acc, l) => acc + (l.datosCalidad[0]?.porcentajeNi || 0), 0) / lotesParaCalculo.length 
        : 0,
      promedioFe: lotesParaCalculo.length > 0
        ? lotesParaCalculo.reduce((acc, l) => acc + (l.datosCalidad[0]?.impurezaFe || 0), 0) / lotesParaCalculo.length
        : 0,
      promedioCu: lotesParaCalculo.length > 0
        ? lotesParaCalculo.reduce((acc, l) => acc + (l.datosCalidad[0]?.impurezaCu || 0), 0) / lotesParaCalculo.length
        : 0,
      promedioZn: lotesParaCalculo.length > 0
        ? lotesParaCalculo.reduce((acc, l) => acc + (l.datosCalidad[0]?.impurezaZn || 0), 0) / lotesParaCalculo.length
        : 0,
      promedioHumedad: lotesParaCalculo.length > 0
        ? lotesParaCalculo.reduce((acc, l) => acc + (l.datosCalidad[0]?.humedad || 0), 0) / lotesParaCalculo.length
        : 0,
      promedioImpurezas: lotesParaCalculo.length > 0
        ? lotesParaCalculo.reduce((acc, l) => {
            const cal = l.datosCalidad[0]
            return acc + ((cal?.impurezaFe || 0) + (cal?.impurezaCu || 0) + (cal?.impurezaZn || 0)) / 3
          }, 0) / lotesParaCalculo.length
        : 0,
      tasaAprobacion: lotes.length > 0 
        ? (lotes.filter(l => l.estado === 'aprobado').length / lotes.length) * 100 
        : 0,
      lotesGradoBateria: lotesParaCalculo.length > 0
        ? (lotesParaCalculo.filter(l => l.calculos[0]?.gradoBateria).length / lotesParaCalculo.length) * 100
        : 0,
      esLoteIndividual: false,
      gradoBateria: false,
      estado: '',
    }
  }

  const kpis = calcularKPIs()

  // Datos para gráfico de tendencia
  const trendCalidad = lotesConCalidad
    .slice(0, 8)
    .reverse()
    .map(lote => ({
      name: lote.numeroLote.split('-').pop() || '',
      Ni: lote.datosCalidad[0]?.porcentajeNi || 0,
      Fe: lote.datosCalidad[0]?.impurezaFe || 0,
    }))

  // Datos para comparación de impurezas
  const impurezasComparacion = [
    { name: 'Fe', actual: kpis.promedioFe, limite: 10 },
    { name: 'Cu', actual: kpis.promedioCu, limite: 10 },
    { name: 'Zn', actual: kpis.promedioZn, limite: 10 },
  ]

  // Distribución por grado
  const gradoBateriaCount = lotesConCalidad.filter(l => l.calculos[0]?.gradoBateria && l.estado === 'aprobado').length
  const gradoEstandarCount = lotesConCalidad.filter(l => !l.calculos[0]?.gradoBateria && l.estado === 'aprobado').length
  const rechazadosCount = lotes.filter(l => l.estado === 'rechazado').length
  const enProcesoCount = lotes.filter(l => l.estado === 'en_proceso').length

  const distribucionGrados = [
    { name: 'Grado Batería', value: gradoBateriaCount, color: '#4caf50' },
    { name: 'Grado Estándar', value: gradoEstandarCount, color: '#2196f3' },
    { name: 'Rechazado', value: rechazadosCount, color: '#f44336' },
    { name: 'En Proceso', value: enProcesoCount, color: '#ff9800' },
  ]

  // Filtrar lotes para tabla
  const lotesFiltrados = lotes.filter(
    lote => filtroEstado === 'todos' || lote.estado === filtroEstado
  )

  return (
    <DashboardLayout>
      <PageHeader
        title="Panel de Calidad"
        description="Control de calidad del sulfato de níquel producido"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Calidad' },
        ]}
      />

      <ContentSection>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error} - <button onClick={fetchLotes} className="underline">Reintentar</button>
          </div>
        )}

        {/* Filtros de vista */}
        <Card className="p-4 mb-6" variant="gradient">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-industrial-400" />
              <span className="text-sm text-industrial-300">Ver datos de:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setVistaMode('promedio')
                  setLoteSeleccionado('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  vistaMode === 'promedio'
                    ? 'bg-nickel-600 text-white'
                    : 'bg-industrial-700/50 text-industrial-300 hover:bg-industrial-600/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Promedio General
              </button>
              <button
                onClick={() => setVistaMode('lote')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  vistaMode === 'lote'
                    ? 'bg-nickel-600 text-white'
                    : 'bg-industrial-700/50 text-industrial-300 hover:bg-industrial-600/50'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Lote Específico
              </button>
            </div>

            {vistaMode === 'lote' && (
              <select
                value={loteSeleccionado}
                onChange={(e) => setLoteSeleccionado(e.target.value)}
                className="px-4 py-2 bg-industrial-900/50 border border-industrial-600/50 rounded-lg text-white text-sm"
              >
                <option value="">Seleccionar lote...</option>
                {lotesConCalidad.map(lote => (
                  <option key={lote.id} value={lote.id}>
                    {lote.numeroLote} - {lote.estado === 'aprobado' ? '✓' : lote.estado === 'rechazado' ? '✗' : '...'} 
                  </option>
                ))}
              </select>
            )}

            {vistaMode === 'lote' && loteActual && (
              <StatusBadge
                status={loteActual.estado === 'aprobado' ? 'verde' : loteActual.estado === 'rechazado' ? 'rojo' : 'amarillo'}
                label={loteActual.estado === 'aprobado' ? 'Aprobado' : loteActual.estado === 'rechazado' ? 'Rechazado' : 'En Proceso'}
              />
            )}
          </div>
          
          {vistaMode === 'promedio' && (
            <p className="text-xs text-industrial-500 mt-2">
              Mostrando promedios de {lotesConCalidad.length} lotes con datos de calidad
            </p>
          )}
          {vistaMode === 'lote' && loteActual && (
            <p className="text-xs text-industrial-500 mt-2">
              Mostrando datos del lote {loteActual.numeroLote} - {new Date(loteActual.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </Card>

        {/* KPIs de calidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title={vistaMode === 'lote' ? '% Níquel' : '% Níquel Promedio'}
            value={kpis.promedioNi}
            unit="%"
            icon={<FlaskConical className="w-5 h-5" />}
            status={kpis.promedioNi >= 22 ? 'verde' : kpis.promedioNi >= 20 ? 'amarillo' : 'rojo'}
            description="Mínimo grado batería: 22%"
          />
          <MetricCard
            title={vistaMode === 'lote' ? 'Impurezas' : 'Impurezas Promedio'}
            value={kpis.promedioImpurezas}
            unit="ppm"
            icon={<AlertTriangle className="w-5 h-5" />}
            status={kpis.promedioImpurezas <= 10 ? 'verde' : kpis.promedioImpurezas <= 15 ? 'amarillo' : 'rojo'}
            description="Máximo permitido: 10 ppm"
          />
          {vistaMode === 'promedio' ? (
            <>
              <MetricCard
                title="Tasa de Aprobación"
                value={kpis.tasaAprobacion}
                unit="%"
                icon={<CheckCircle className="w-5 h-5" />}
                status={kpis.tasaAprobacion >= 90 ? 'verde' : kpis.tasaAprobacion >= 80 ? 'amarillo' : 'rojo'}
              />
              <MetricCard
                title="Grado Batería"
                value={kpis.lotesGradoBateria}
                unit="%"
                icon={<Award className="w-5 h-5" />}
                status={kpis.lotesGradoBateria >= 70 ? 'verde' : kpis.lotesGradoBateria >= 50 ? 'amarillo' : 'rojo'}
                description="% de lotes que califican"
              />
            </>
          ) : (
            <>
              <MetricCard
                title="Humedad"
                value={kpis.promedioHumedad}
                unit="%"
                icon={<CheckCircle className="w-5 h-5" />}
                status={kpis.promedioHumedad <= 1.0 ? 'verde' : 'rojo'}
                description="Máximo: 1.0%"
              />
              <MetricCard
                title="Grado"
                value={kpis.gradoBateria ? 'Batería' : kpis.estado === 'rechazado' ? 'N/A' : 'Estándar'}
                icon={<Award className="w-5 h-5" />}
                status={kpis.estado === 'rechazado' ? 'rojo' : kpis.gradoBateria ? 'verde' : 'amarillo'}
              />
            </>
          )}
        </div>

        {/* Detalle de impurezas para lote individual */}
        {vistaMode === 'lote' && loteActual && (
          <Card className="p-4 mb-6" variant="gradient">
            <h3 className="text-sm font-medium text-industrial-400 mb-3">Detalle de Impurezas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${kpis.promedioFe <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.promedioFe.toFixed(1)}
                </div>
                <div className="text-xs text-industrial-400">Fe (ppm)</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${kpis.promedioCu <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.promedioCu.toFixed(1)}
                </div>
                <div className="text-xs text-industrial-400">Cu (ppm)</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${kpis.promedioZn <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.promedioZn.toFixed(1)}
                </div>
                <div className="text-xs text-industrial-400">Zn (ppm)</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${kpis.promedioHumedad <= 1.0 ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.promedioHumedad.toFixed(2)}
                </div>
                <div className="text-xs text-industrial-400">Humedad (%)</div>
              </div>
            </div>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <InfoCard
            title="Tendencia de Calidad"
            icon={<FlaskConical className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            {trendCalidad.length > 0 ? (
              <TrendLineChart
                data={trendCalidad}
                lines={[
                  { dataKey: 'Ni', color: '#4caf50', name: '% Níquel' },
                  { dataKey: 'Fe', color: '#ff9800', name: 'Fe (ppm)' },
                ]}
                height={280}
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos de calidad'}
              </div>
            )}
          </InfoCard>

          <InfoCard
            title="Distribución por Grado"
            icon={<Award className="w-5 h-5" />}
          >
            {lotes.length > 0 ? (
              <DonutChart
                data={distribucionGrados}
                height={280}
                centerValue={`${gradoBateriaCount}`}
                centerLabel="Grado Batería"
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos'}
              </div>
            )}
          </InfoCard>
        </div>

        {/* Comparación de impurezas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InfoCard
            title={vistaMode === 'lote' ? 'Impurezas del Lote vs Límites' : 'Impurezas Promedio vs Límites'}
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            {(vistaMode === 'promedio' && lotesConCalidad.length > 0) || (vistaMode === 'lote' && loteActual) ? (
              <ComparisonBarChart
                data={impurezasComparacion}
                bars={[
                  { dataKey: 'actual', color: '#4caf50', name: vistaMode === 'lote' ? 'Valor del Lote (ppm)' : 'Valor Promedio (ppm)' },
                  { dataKey: 'limite', color: '#ff9800', name: 'Límite Máximo (ppm)' },
                ]}
                height={250}
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : vistaMode === 'lote' ? 'Selecciona un lote' : 'No hay datos'}
              </div>
            )}
          </InfoCard>

          <InfoCard
            title="Especificaciones Grado Batería"
            icon={<Award className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-industrial-800/50 rounded-lg p-4">
                  <div className="text-sm text-industrial-400 mb-1">Níquel Mínimo</div>
                  <div className="text-2xl font-bold text-green-400 font-mono">≥ 22.0%</div>
                </div>
                <div className="bg-industrial-800/50 rounded-lg p-4">
                  <div className="text-sm text-industrial-400 mb-1">Humedad Máxima</div>
                  <div className="text-2xl font-bold text-green-400 font-mono">≤ 1.0%</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-industrial-300">Límites de Impurezas (ppm)</h4>
                <StatRow label="Hierro (Fe)" value={10} unit="máx" status="verde" />
                <StatRow label="Cobre (Cu)" value={10} unit="máx" status="verde" />
                <StatRow label="Zinc (Zn)" value={10} unit="máx" status="verde" />
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Tabla de lotes */}
        <Card className="p-6" variant="gradient">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-nickel-400" />
              Lotes Recientes
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-industrial-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
                className="bg-industrial-800/50 border border-industrial-600/50 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                <option value="todos">Todos</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
                <option value="en_proceso">En Proceso</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-industrial-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Cargando...
            </div>
          ) : lotesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-industrial-400">
              No hay lotes para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Lote</th>
                    <th>Fecha</th>
                    <th>% Ni</th>
                    <th>Fe (ppm)</th>
                    <th>Cu (ppm)</th>
                    <th>Zn (ppm)</th>
                    <th>Humedad</th>
                    <th>Grado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesFiltrados.slice(0, 10).map((lote) => {
                    const cal = lote.datosCalidad[0]
                    const isSelected = vistaMode === 'lote' && loteSeleccionado === lote.id
                    return (
                      <tr 
                        key={lote.id} 
                        className={isSelected ? 'bg-nickel-600/20' : ''}
                        onClick={() => {
                          setVistaMode('lote')
                          setLoteSeleccionado(lote.id)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-mono font-semibold text-nickel-400">{lote.numeroLote}</td>
                        <td>{new Date(lote.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className={`font-mono ${(cal?.porcentajeNi || 0) >= 22 ? 'text-green-400' : 'text-red-400'}`}>
                          {(cal?.porcentajeNi || 0).toFixed(1)}%
                        </td>
                        <td className={`font-mono ${(cal?.impurezaFe || 0) <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                          {(cal?.impurezaFe || 0).toFixed(1)}
                        </td>
                        <td className={`font-mono ${(cal?.impurezaCu || 0) <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                          {(cal?.impurezaCu || 0).toFixed(1)}
                        </td>
                        <td className={`font-mono ${(cal?.impurezaZn || 0) <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                          {(cal?.impurezaZn || 0).toFixed(1)}
                        </td>
                        <td className={`font-mono ${(cal?.humedad || 0) <= 1.0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(cal?.humedad || 0).toFixed(2)}%
                        </td>
                        <td>
                          {lote.estado === 'rechazado' || lote.estado === 'en_proceso' ? (
                            <span className="text-industrial-400 text-sm">-</span>
                          ) : lote.calculos[0]?.gradoBateria ? (
                            <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                              <Award className="w-4 h-4" />
                              Batería
                            </span>
                          ) : (
                            <span className="text-industrial-400 text-sm">Estándar</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge
                            status={lote.estado === 'aprobado' ? 'verde' : lote.estado === 'en_proceso' ? 'amarillo' : 'rojo'}
                            label={lote.estado === 'aprobado' ? 'Aprobado' : lote.estado === 'en_proceso' ? 'En Proceso' : 'Rechazado'}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-industrial-500 mt-3">
            💡 Haz clic en una fila para ver los datos de ese lote
          </p>
        </Card>
      </ContentSection>
    </DashboardLayout>
  )
}
