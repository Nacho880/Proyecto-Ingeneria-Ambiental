'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, MetricCard, InfoCard } from '@/components/ui/Card'
import { TrendLineChart, ComparisonBarChart, DonutChart } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Form'
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Leaf,
  FlaskConical,
  RefreshCw,
} from 'lucide-react'

interface Lote {
  id: string
  numeroLote: string
  fechaCreacion: string
  estado: string
  datosProceso: {
    masaConcentrado: number
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
    aguaRecirculada: number
    aguaFresca: number
  }[]
  calculos: {
    rendimientoLixiviacion: number
    recuperacionNi: number
    consumoEspecificoAcido: number
    indiceCircularidadAgua: number
    gradoBateria: boolean
  }[]
}

export default function ReportesPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Filtrar lotes completados (excluir en proceso)
  const lotesCompletados = lotes.filter(l => l.estado === 'aprobado' || l.estado === 'rechazado')
  const lotesConCalculos = lotesCompletados.filter(l => l.calculos && l.calculos.length > 0)
  const lotesConCalidad = lotesCompletados.filter(l => l.datosCalidad && l.datosCalidad.length > 0)
  const lotesAprobados = lotes.filter(l => l.estado === 'aprobado')
  const lotesRechazados = lotes.filter(l => l.estado === 'rechazado')
  const lotesEnProceso = lotes.filter(l => l.estado === 'en_proceso')

  // Calcular KPIs (solo lotes completados)
  const calcularPromedio = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const kpis = {
    rendimientoPromedio: calcularPromedio(lotesConCalculos.map(l => l.calculos[0]?.rendimientoLixiviacion || 0)),
    recuperacionPromedio: calcularPromedio(lotesConCalculos.map(l => l.calculos[0]?.recuperacionNi || 0)),
    circularidadPromedio: calcularPromedio(lotesConCalculos.map(l => l.calculos[0]?.indiceCircularidadAgua || 0)),
    consumoAcidoPromedio: calcularPromedio(lotesConCalculos.map(l => l.calculos[0]?.consumoEspecificoAcido || 0)),
    tasaAprobacion: lotesCompletados.length > 0 ? (lotesAprobados.length / lotesCompletados.length) * 100 : 0,
    tasaGradoBateria: lotesAprobados.length > 0 
      ? (lotesAprobados.filter(l => l.calculos[0]?.gradoBateria).length / lotesAprobados.length) * 100 
      : 0,
    niPromedio: calcularPromedio(lotesConCalidad.map(l => l.datosCalidad[0]?.porcentajeNi || 0)),
  }

  // Datos para gráfico de tendencia de KPIs por lote
  const tendenciaKPIs = lotesConCalculos
    .slice(0, 10)
    .reverse()
    .map(lote => ({
      name: lote.numeroLote.split('-').pop() || '',
      rendimiento: lote.calculos[0]?.rendimientoLixiviacion || 0,
      recuperacion: lote.calculos[0]?.recuperacionNi || 0,
      circularidad: lote.calculos[0]?.indiceCircularidadAgua || 0,
    }))

  // Datos para gráfico de producción (aprobados vs rechazados)
  const produccionData = [
    { name: 'Aprobados', cantidad: lotesAprobados.length },
    { name: 'Rechazados', cantidad: lotesRechazados.length },
    { name: 'En Proceso', cantidad: lotesEnProceso.length },
  ]

  // Distribución por grado
  const gradoBateriaCount = lotesAprobados.filter(l => l.calculos[0]?.gradoBateria).length
  const gradoEstandarCount = lotesAprobados.filter(l => !l.calculos[0]?.gradoBateria).length

  const distribucionCalidad = [
    { name: 'Grado Batería', value: gradoBateriaCount, color: '#4caf50' },
    { name: 'Grado Estándar', value: gradoEstandarCount, color: '#2196f3' },
    { name: 'Rechazados', value: lotesRechazados.length, color: '#f44336' },
  ]

  // Consumo de recursos por lote
  const consumoRecursos = lotesConCalculos
    .slice(0, 8)
    .reverse()
    .map(lote => ({
      name: lote.numeroLote.split('-').pop() || '',
      acido: lote.calculos[0]?.consumoEspecificoAcido || 0,
      circularidad: lote.calculos[0]?.indiceCircularidadAgua || 0,
    }))

  return (
    <DashboardLayout>
      <PageHeader
        title="Reportes y Análisis"
        description="Análisis detallado de KPIs y métricas de rendimiento"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reportes' },
        ]}
      />

      <ContentSection>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error} - <button onClick={fetchLotes} className="underline">Reintentar</button>
          </div>
        )}

        {/* Resumen de lotes */}
        <div className="mb-6 p-4 bg-industrial-800/30 rounded-lg">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-industrial-400">Analizando:</span>
              <span className="ml-2 font-bold text-white">{lotesCompletados.length} lotes</span>
            </div>
            <div>
              <span className="text-industrial-400">Aprobados:</span>
              <span className="ml-2 font-bold text-green-400">{lotesAprobados.length}</span>
            </div>
            <div>
              <span className="text-industrial-400">Rechazados:</span>
              <span className="ml-2 font-bold text-red-400">{lotesRechazados.length}</span>
            </div>
            {lotesEnProceso.length > 0 && (
              <div>
                <span className="text-industrial-400">En Proceso:</span>
                <span className="ml-2 font-bold text-amber-400">{lotesEnProceso.length}</span>
                <span className="ml-1 text-industrial-500 text-xs">(no incluidos)</span>
              </div>
            )}
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Rendimiento Promedio"
            value={kpis.rendimientoPromedio}
            unit="%"
            icon={<TrendingUp className="w-5 h-5" />}
            status={kpis.rendimientoPromedio >= 90 ? 'verde' : kpis.rendimientoPromedio >= 80 ? 'amarillo' : 'rojo'}
            description="Meta: ≥ 90%"
          />
          <MetricCard
            title="Recuperación Ni Promedio"
            value={kpis.recuperacionPromedio}
            unit="%"
            icon={<Activity className="w-5 h-5" />}
            status={kpis.recuperacionPromedio >= 92 ? 'verde' : kpis.recuperacionPromedio >= 85 ? 'amarillo' : 'rojo'}
            description="Meta: ≥ 92%"
          />
          <MetricCard
            title="Tasa de Aprobación"
            value={kpis.tasaAprobacion}
            unit="%"
            icon={<Award className="w-5 h-5" />}
            status={kpis.tasaAprobacion >= 90 ? 'verde' : kpis.tasaAprobacion >= 80 ? 'amarillo' : 'rojo'}
            description={`${lotesAprobados.length} de ${lotesCompletados.length} completados`}
          />
          <MetricCard
            title="Grado Batería"
            value={kpis.tasaGradoBateria}
            unit="%"
            icon={<Leaf className="w-5 h-5" />}
            status={kpis.tasaGradoBateria >= 70 ? 'verde' : kpis.tasaGradoBateria >= 50 ? 'amarillo' : 'rojo'}
            description={`${gradoBateriaCount} de ${lotesAprobados.length} aprobados`}
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InfoCard
            title="Evolución de KPIs por Lote"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            {tendenciaKPIs.length > 0 ? (
              <TrendLineChart
                data={tendenciaKPIs}
                lines={[
                  { dataKey: 'rendimiento', color: '#4caf50', name: 'Rendimiento (%)' },
                  { dataKey: 'recuperacion', color: '#2196f3', name: 'Recuperación (%)' },
                  { dataKey: 'circularidad', color: '#ff9800', name: 'Circularidad H₂O (%)' },
                ]}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos suficientes'}
              </div>
            )}
          </InfoCard>

          <InfoCard
            title="Estado de Lotes"
            icon={<Activity className="w-5 h-5" />}
          >
            {lotes.length > 0 ? (
              <ComparisonBarChart
                data={produccionData}
                bars={[
                  { dataKey: 'cantidad', color: '#4caf50', name: 'Cantidad' },
                ]}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay lotes'}
              </div>
            )}
          </InfoCard>
        </div>

        {/* Segunda fila de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <InfoCard
            title="Distribución por Calidad"
            icon={<FlaskConical className="w-5 h-5" />}
          >
            {lotes.length > 0 ? (
              <DonutChart
                data={distribucionCalidad}
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

          <InfoCard
            title="Consumo por Lote"
            icon={<Leaf className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            {consumoRecursos.length > 0 ? (
              <TrendLineChart
                data={consumoRecursos}
                lines={[
                  { dataKey: 'acido', color: '#ff9800', name: 'Consumo Ácido (kg/t)' },
                  { dataKey: 'circularidad', color: '#4caf50', name: 'Circularidad Agua (%)' },
                ]}
                height={280}
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos'}
              </div>
            )}
          </InfoCard>
        </div>

        {/* Tabla de resumen */}
        <Card className="p-6" variant="gradient">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-nickel-400" />
            Resumen de Métricas
          </h3>
          <div className="overflow-x-auto">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor Actual</th>
                  <th>Meta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rendimiento de Lixiviación</td>
                  <td className="font-mono">{kpis.rendimientoPromedio.toFixed(1)}%</td>
                  <td className="text-industrial-400">≥ 90%</td>
                  <td>
                    <span className={kpis.rendimientoPromedio >= 90 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.rendimientoPromedio >= 90 ? '✓ Cumple' : '⚠ Bajo meta'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Recuperación de Níquel</td>
                  <td className="font-mono">{kpis.recuperacionPromedio.toFixed(1)}%</td>
                  <td className="text-industrial-400">≥ 92%</td>
                  <td>
                    <span className={kpis.recuperacionPromedio >= 92 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.recuperacionPromedio >= 92 ? '✓ Cumple' : '⚠ Bajo meta'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Circularidad del Agua</td>
                  <td className="font-mono">{kpis.circularidadPromedio.toFixed(1)}%</td>
                  <td className="text-industrial-400">≥ 85%</td>
                  <td>
                    <span className={kpis.circularidadPromedio >= 85 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.circularidadPromedio >= 85 ? '✓ Cumple' : '⚠ Bajo meta'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Consumo de Ácido</td>
                  <td className="font-mono">{kpis.consumoAcidoPromedio.toFixed(0)} kg/t</td>
                  <td className="text-industrial-400">≤ 200 kg/t</td>
                  <td>
                    <span className={kpis.consumoAcidoPromedio <= 200 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.consumoAcidoPromedio <= 200 ? '✓ Cumple' : '⚠ Sobre meta'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Tasa de Aprobación</td>
                  <td className="font-mono">{kpis.tasaAprobacion.toFixed(1)}%</td>
                  <td className="text-industrial-400">≥ 90%</td>
                  <td>
                    <span className={kpis.tasaAprobacion >= 90 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.tasaAprobacion >= 90 ? '✓ Cumple' : '⚠ Bajo meta'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Lotes Grado Batería</td>
                  <td className="font-mono">{kpis.tasaGradoBateria.toFixed(1)}%</td>
                  <td className="text-industrial-400">≥ 70%</td>
                  <td>
                    <span className={kpis.tasaGradoBateria >= 70 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.tasaGradoBateria >= 70 ? '✓ Cumple' : '⚠ Bajo meta'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>% Níquel Promedio</td>
                  <td className="font-mono">{kpis.niPromedio.toFixed(2)}%</td>
                  <td className="text-industrial-400">≥ 22%</td>
                  <td>
                    <span className={kpis.niPromedio >= 22 ? 'text-green-400' : 'text-amber-400'}>
                      {kpis.niPromedio >= 22 ? '✓ Cumple' : '⚠ Bajo meta'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mensaje si no hay datos */}
        {!isLoading && lotes.length === 0 && (
          <Card className="mt-6 p-8 text-center" variant="gradient">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-industrial-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay datos para reportes</h3>
            <p className="text-industrial-400 mb-4">Crea algunos lotes para ver las estadísticas</p>
            <a href="/nuevo-lote">
              <Button>Crear Nuevo Lote</Button>
            </a>
          </Card>
        )}
      </ContentSection>
    </DashboardLayout>
  )
}
