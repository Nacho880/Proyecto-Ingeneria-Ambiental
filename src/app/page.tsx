'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, MetricCard, InfoCard, StatRow } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusLight'
import { TrendLineChart, TrendAreaChart, DonutChart, GaugeChart } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Form'
import {
  Activity,
  Droplets,
  FlaskConical,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileCheck,
} from 'lucide-react'

interface Lote {
  id: string
  numeroLote: string
  estado: string
  fechaCreacion: string
  datosProceso: {
    phReactor: number
    temperaturaReactor: number
    masaConcentrado: number
  }[]
  datosCalidad: {
    porcentajeNi: number
    impurezaFe: number
    impurezaCu: number
    impurezaZn: number
  }[]
  calculos: {
    rendimientoLixiviacion: number
    recuperacionNi: number
    consumoEspecificoAcido: number
    indiceCircularidadAgua: number
    gradoBateria: boolean
  }[]
}

interface DashboardData {
  lotes: Lote[]
  estadisticas: {
    total: number
    aprobados: number
    rechazados: number
    enProceso: number
  }
  kpis: {
    rendimiento: number
    recuperacion: number
    circularidadAgua: number
    consumoAcido: number
  }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Obtener lotes de la API
      const response = await fetch('/api/lotes?limite=10')
      const result = await response.json()
      
      if (result.success && result.data) {
        const lotes: Lote[] = result.data
        
        // Calcular estadísticas
        const aprobados = lotes.filter(l => l.estado === 'aprobado').length
        const rechazados = lotes.filter(l => l.estado === 'rechazado').length
        const enProceso = lotes.filter(l => l.estado === 'en_proceso').length
        
        // Calcular promedios de KPIs
        const lotesConCalculos = lotes.filter(l => l.calculos && l.calculos.length > 0)
        
        let kpis = {
          rendimiento: 0,
          recuperacion: 0,
          circularidadAgua: 0,
          consumoAcido: 0,
        }
        
        if (lotesConCalculos.length > 0) {
          const sumas = lotesConCalculos.reduce((acc, lote) => {
            const calc = lote.calculos[0]
            return {
              rendimiento: acc.rendimiento + (calc.rendimientoLixiviacion || 0),
              recuperacion: acc.recuperacion + (calc.recuperacionNi || 0),
              circularidadAgua: acc.circularidadAgua + (calc.indiceCircularidadAgua || 0),
              consumoAcido: acc.consumoAcido + (calc.consumoEspecificoAcido || 0),
            }
          }, kpis)
          
          kpis = {
            rendimiento: sumas.rendimiento / lotesConCalculos.length,
            recuperacion: sumas.recuperacion / lotesConCalculos.length,
            circularidadAgua: sumas.circularidadAgua / lotesConCalculos.length,
            consumoAcido: sumas.consumoAcido / lotesConCalculos.length,
          }
        }
        
        setData({
          lotes,
          estadisticas: {
            total: lotes.length,
            aprobados,
            rechazados,
            enProceso,
          },
          kpis,
        })
      } else {
        setError('No se pudieron cargar los datos')
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])

  // Preparar datos para gráficos
  const lotesEstado = data ? [
    { name: 'Aprobados', value: data.estadisticas.aprobados, color: '#4caf50' },
    { name: 'Rechazados', value: data.estadisticas.rechazados, color: '#f44336' },
    { name: 'En Proceso', value: data.estadisticas.enProceso, color: '#ff9800' },
  ] : []

  // Tendencias de los últimos lotes
  const tendenciaLotes = data?.lotes
    .slice(0, 6)
    .reverse()
    .map(lote => ({
      name: lote.numeroLote.split('-').pop() || '',
      ph: lote.datosProceso[0]?.phReactor || 0,
      temp: lote.datosProceso[0]?.temperaturaReactor || 0,
      ni: lote.datosCalidad[0]?.porcentajeNi || 0,
    })) || []

  // Lote más reciente
  const loteActual = data?.lotes[0]

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Principal"
        description="Vista general del proceso de lixiviación de sulfato de níquel"
      />
      
      <ContentSection>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error} - <button onClick={fetchData} className="underline">Reintentar</button>
          </div>
        )}

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Rendimiento Lixiviación"
            value={data?.kpis.rendimiento ?? 0}
            unit="%"
            icon={<TrendingUp className="w-5 h-5" />}
            status={data ? (data.kpis.rendimiento >= 90 ? 'verde' : data.kpis.rendimiento >= 80 ? 'amarillo' : 'rojo') : 'apagado'}
            description="Promedio de lotes"
            className="animate-fade-in-up"
          />
          <MetricCard
            title="Recuperación Níquel"
            value={data?.kpis.recuperacion ?? 0}
            unit="%"
            icon={<FlaskConical className="w-5 h-5" />}
            status={data ? (data.kpis.recuperacion >= 92 ? 'verde' : data.kpis.recuperacion >= 85 ? 'amarillo' : 'rojo') : 'apagado'}
            description="Promedio de lotes"
            className="animate-fade-in-up delay-100"
          />
          <MetricCard
            title="Circularidad Agua"
            value={data?.kpis.circularidadAgua ?? 0}
            unit="%"
            icon={<Droplets className="w-5 h-5" />}
            status={data ? (data.kpis.circularidadAgua >= 85 ? 'verde' : data.kpis.circularidadAgua >= 70 ? 'amarillo' : 'rojo') : 'apagado'}
            description="Promedio de lotes"
            className="animate-fade-in-up delay-200"
          />
          <MetricCard
            title="Consumo Ácido"
            value={data?.kpis.consumoAcido ?? 0}
            unit="kg/t"
            icon={<Activity className="w-5 h-5" />}
            status={data ? (data.kpis.consumoAcido <= 200 ? 'verde' : data.kpis.consumoAcido <= 250 ? 'amarillo' : 'rojo') : 'apagado'}
            description="Promedio de lotes"
            className="animate-fade-in-up delay-300"
          />
        </div>
        
        {/* Fila de gráficos y estado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tendencias de proceso */}
          <InfoCard
            title="Tendencias por Lote"
            icon={<Activity className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            {tendenciaLotes.length > 0 ? (
              <TrendLineChart
                data={tendenciaLotes}
                lines={[
                  { dataKey: 'ph', color: '#4caf50', name: 'pH Reactor' },
                  { dataKey: 'ni', color: '#2196f3', name: '% Níquel' },
                ]}
                height={280}
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos de lotes'}
              </div>
            )}
          </InfoCard>
          
          {/* Estado del lote actual */}
          <InfoCard
            title="Último Lote"
            icon={<FlaskConical className="w-5 h-5" />}
            headerAction={
              loteActual && (
                <StatusBadge
                  status={loteActual.estado === 'aprobado' ? 'verde' : loteActual.estado === 'rechazado' ? 'rojo' : 'amarillo'}
                  label={loteActual.estado === 'aprobado' ? 'Aprobado' : loteActual.estado === 'rechazado' ? 'Rechazado' : 'En Proceso'}
                />
              )
            }
          >
            {loteActual ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-mono mb-4">
                  {loteActual.numeroLote}
                </div>
                <StatRow 
                  label="pH Reactor" 
                  value={loteActual.datosProceso[0]?.phReactor ?? 0} 
                  status={loteActual.datosProceso[0]?.phReactor >= 1.3 && loteActual.datosProceso[0]?.phReactor <= 2.0 ? 'verde' : 'amarillo'} 
                />
                <StatRow 
                  label="Temperatura" 
                  value={loteActual.datosProceso[0]?.temperaturaReactor ?? 0} 
                  unit="°C" 
                  status={loteActual.datosProceso[0]?.temperaturaReactor >= 80 && loteActual.datosProceso[0]?.temperaturaReactor <= 90 ? 'verde' : 'amarillo'} 
                />
                <StatRow 
                  label="% Níquel" 
                  value={loteActual.datosCalidad[0]?.porcentajeNi ?? 0} 
                  unit="%" 
                  status={loteActual.datosCalidad[0]?.porcentajeNi >= 22 ? 'verde' : 'rojo'} 
                />
                <StatRow 
                  label="Rendimiento" 
                  value={loteActual.calculos[0]?.rendimientoLixiviacion ?? 0} 
                  unit="%" 
                  status={loteActual.calculos[0]?.rendimientoLixiviacion >= 90 ? 'verde' : 'amarillo'} 
                />
              </div>
            ) : (
              <div className="text-industrial-400 text-center py-8">
                {isLoading ? 'Cargando...' : 'No hay lotes registrados'}
              </div>
            )}
          </InfoCard>
        </div>
        
        {/* Segunda fila */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Estado de lotes */}
          <InfoCard
            title="Estado de Lotes"
            icon={<FileCheck className="w-5 h-5" />}
          >
            {data && data.estadisticas.total > 0 ? (
              <DonutChart
                data={lotesEstado}
                height={220}
                centerValue={`${data.estadisticas.total}`}
                centerLabel="Total Lotes"
              />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay lotes'}
              </div>
            )}
          </InfoCard>
          
          {/* Tabla de últimos lotes */}
          <InfoCard
            title="Últimos Lotes"
            icon={<Activity className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            {data && data.lotes.length > 0 ? (
              <div className="overflow-x-auto max-h-[220px]">
                <table className="table-industrial text-sm">
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Fecha</th>
                      <th>% Ni</th>
                      <th>Rendimiento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lotes.slice(0, 5).map((lote) => (
                      <tr key={lote.id}>
                        <td className="font-mono text-nickel-400">{lote.numeroLote}</td>
                        <td>{new Date(lote.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className={`font-mono ${(lote.datosCalidad[0]?.porcentajeNi ?? 0) >= 22 ? 'text-green-400' : 'text-red-400'}`}>
                          {(lote.datosCalidad[0]?.porcentajeNi ?? 0).toFixed(1)}%
                        </td>
                        <td className="font-mono">
                          {(lote.calculos[0]?.rendimientoLixiviacion ?? 0).toFixed(1)}%
                        </td>
                        <td>
                          <StatusBadge
                            status={lote.estado === 'aprobado' ? 'verde' : lote.estado === 'rechazado' ? 'rojo' : 'amarillo'}
                            label={lote.estado === 'aprobado' ? '✓' : lote.estado === 'rechazado' ? '✗' : '...'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay lotes registrados'}
              </div>
            )}
          </InfoCard>
        </div>
        
        {/* Gauges de proceso */}
        {data && data.lotes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 flex justify-center" variant="gradient">
              <GaugeChart
                value={data.kpis.rendimiento}
                label="Rendimiento"
                thresholds={{ green: 90, yellow: 80 }}
              />
            </Card>
            <Card className="p-6 flex justify-center" variant="gradient">
              <GaugeChart
                value={data.kpis.recuperacion}
                label="Recuperación Ni"
                thresholds={{ green: 92, yellow: 85 }}
              />
            </Card>
            <Card className="p-6 flex justify-center" variant="gradient">
              <GaugeChart
                value={data.kpis.circularidadAgua}
                label="Circularidad H₂O"
                thresholds={{ green: 85, yellow: 70 }}
              />
            </Card>
            <Card className="p-6 flex justify-center" variant="gradient">
              <GaugeChart
                value={Math.max(0, 100 - (data.kpis.consumoAcido / 3))}
                label="Eficiencia Ácido"
                thresholds={{ green: 80, yellow: 60 }}
              />
            </Card>
          </div>
        )}

        {/* Mensaje si no hay datos */}
        {!isLoading && (!data || data.lotes.length === 0) && (
          <Card className="p-8 text-center" variant="gradient">
            <div className="text-industrial-400 mb-4">
              <FlaskConical className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay lotes registrados</h3>
              <p>Comienza creando tu primer lote de producción</p>
            </div>
            <a href="/nuevo-lote">
              <Button icon={<Activity className="w-4 h-4" />}>
                Crear Nuevo Lote
              </Button>
            </a>
          </Card>
        )}
      </ContentSection>
    </DashboardLayout>
  )
}
