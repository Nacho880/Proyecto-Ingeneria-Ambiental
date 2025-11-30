'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, MetricCard, InfoCard, StatRow } from '@/components/ui/Card'
import { StatusLight, StatusBadge } from '@/components/ui/StatusLight'
import { TrendLineChart, TrendAreaChart, ComparisonBarChart, GaugeChart } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Form'
import {
  Leaf,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle,
  Recycle,
  RefreshCw,
  Filter,
  BarChart3,
  FileText,
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
  datosAmbientales: {
    phEfluente: number
    niEfluente: number
    feEfluente: number
    cuEfluente: number
    znEfluente: number
    caudalEfluente: number
    aguaRecirculada: number
    aguaFresca: number
  }[]
  calculos: {
    consumoEspecificoAcido: number
    consumoAgua: number
    indiceCircularidadAgua: number
    cargaContaminanteNi: number
  }[]
}

type VistaMode = 'promedio' | 'lote'

export default function AmbientalPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modo de vista y lote seleccionado
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

  // Filtrar lotes con datos ambientales
  const lotesConAmbiental = lotes.filter(l => l.datosAmbientales && l.datosAmbientales.length > 0)
  const lotesConCalculos = lotes.filter(l => l.calculos && l.calculos.length > 0)

  // Obtener lote específico si está seleccionado
  const loteActual = vistaMode === 'lote' && loteSeleccionado 
    ? lotesConAmbiental.find(l => l.id === loteSeleccionado)
    : null

  // Calcular KPIs (promedio o lote específico)
  const calcularKPIs = () => {
    if (vistaMode === 'lote' && loteActual) {
      const amb = loteActual.datosAmbientales[0]
      const calc = loteActual.calculos[0]
      return {
        phEfluente: amb?.phEfluente || 0,
        niEfluente: amb?.niEfluente || 0,
        feEfluente: amb?.feEfluente || 0,
        cuEfluente: amb?.cuEfluente || 0,
        znEfluente: amb?.znEfluente || 0,
        caudalEfluente: amb?.caudalEfluente || 0,
        aguaRecirculada: amb?.aguaRecirculada || 0,
        aguaFresca: amb?.aguaFresca || 0,
        circularidadAgua: calc?.indiceCircularidadAgua || 0,
        cargaNi: calc?.cargaContaminanteNi || 0,
        consumoAgua: calc?.consumoAgua || 0,
        consumoAcido: calc?.consumoEspecificoAcido || 0,
        esLoteIndividual: true,
      }
    }

    // Modo promedio
    const calcPromedio = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    
    return {
      phEfluente: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.phEfluente || 0)),
      niEfluente: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.niEfluente || 0)),
      feEfluente: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.feEfluente || 0)),
      cuEfluente: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.cuEfluente || 0)),
      znEfluente: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.znEfluente || 0)),
      caudalEfluente: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.caudalEfluente || 0)),
      aguaRecirculada: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.aguaRecirculada || 0)),
      aguaFresca: calcPromedio(lotesConAmbiental.map(l => l.datosAmbientales[0]?.aguaFresca || 0)),
      circularidadAgua: calcPromedio(lotesConCalculos.map(l => l.calculos[0]?.indiceCircularidadAgua || 0)),
      cargaNi: calcPromedio(lotesConCalculos.map(l => l.calculos[0]?.cargaContaminanteNi || 0)),
      consumoAgua: calcPromedio(lotesConCalculos.map(l => l.calculos[0]?.consumoAgua || 0)),
      consumoAcido: calcPromedio(lotesConCalculos.map(l => l.calculos[0]?.consumoEspecificoAcido || 0)),
      esLoteIndividual: false,
    }
  }

  const kpis = calcularKPIs()

  // Datos para gráfico de tendencia de efluente
  const tendenciaEfluente = lotesConAmbiental
    .slice(0, 8)
    .reverse()
    .map(lote => ({
      name: lote.numeroLote.split('-').pop() || '',
      ph: lote.datosAmbientales[0]?.phEfluente || 0,
      Ni: lote.datosAmbientales[0]?.niEfluente || 0,
    }))

  // Datos para balance de agua
  const balanceAgua = lotesConAmbiental
    .slice(0, 6)
    .reverse()
    .map(lote => {
      const amb = lote.datosAmbientales[0]
      const total = (amb?.aguaRecirculada || 0) + (amb?.aguaFresca || 0)
      return {
        name: lote.numeroLote.split('-').pop() || '',
        recirculada: total > 0 ? ((amb?.aguaRecirculada || 0) / total) * 100 : 0,
        fresca: total > 0 ? ((amb?.aguaFresca || 0) / total) * 100 : 0,
      }
    })

  // Datos para comparación de metales vs límites
  const metalesVsLimites = [
    { name: 'Ni', actual: kpis.niEfluente, limite: 2.0 },
    { name: 'Fe', actual: kpis.feEfluente, limite: 10.0 },
    { name: 'Cu', actual: kpis.cuEfluente, limite: 1.0 },
    { name: 'Zn', actual: kpis.znEfluente, limite: 5.0 },
  ]

  // Verificar cumplimiento
  const cumplePH = kpis.phEfluente >= 6.0 && kpis.phEfluente <= 9.0
  const cumpleNi = kpis.niEfluente <= 2.0
  const cumpleFe = kpis.feEfluente <= 10.0
  const cumpleCu = kpis.cuEfluente <= 1.0
  const cumpleZn = kpis.znEfluente <= 5.0
  const cumpleTodo = cumplePH && cumpleNi && cumpleFe && cumpleCu && cumpleZn

  return (
    <DashboardLayout>
      <PageHeader
        title="Panel Ambiental"
        description="Gestión ambiental y cumplimiento normativo del proceso"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Ambiental' },
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
                {lotesConAmbiental.map(lote => (
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
              Mostrando promedios de {lotesConAmbiental.length} lotes con datos ambientales
            </p>
          )}
          {vistaMode === 'lote' && loteActual && (
            <p className="text-xs text-industrial-500 mt-2">
              Mostrando datos del lote {loteActual.numeroLote} - {new Date(loteActual.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </Card>

        {/* KPIs ambientales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title={vistaMode === 'lote' ? 'pH Efluente' : 'pH Efluente Promedio'}
            value={kpis.phEfluente}
            icon={<Droplets className="w-5 h-5" />}
            status={kpis.phEfluente >= 6 && kpis.phEfluente <= 9 ? 'verde' : 'rojo'}
            description="Límite: 6.0 - 9.0"
          />
          <MetricCard
            title={vistaMode === 'lote' ? 'Circularidad Agua' : 'Circularidad Agua Promedio'}
            value={kpis.circularidadAgua}
            unit="%"
            icon={<Recycle className="w-5 h-5" />}
            status={kpis.circularidadAgua >= 85 ? 'verde' : kpis.circularidadAgua >= 70 ? 'amarillo' : 'rojo'}
            description="Meta: ≥ 85%"
          />
          <MetricCard
            title={vistaMode === 'lote' ? 'Carga Ni Efluente' : 'Carga Ni Promedio'}
            value={kpis.cargaNi}
            unit="kg/día"
            icon={<Wind className="w-5 h-5" />}
            status={kpis.cargaNi <= 0.1 ? 'verde' : kpis.cargaNi <= 0.2 ? 'amarillo' : 'rojo'}
            description="Meta: < 0.1 kg/día"
          />
        </div>

        {/* Segunda fila de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MetricCard
            title={vistaMode === 'lote' ? 'Consumo de Agua' : 'Consumo de Agua Promedio'}
            value={kpis.consumoAgua}
            unit="m³/t"
            icon={<Droplets className="w-5 h-5" />}
            status={kpis.consumoAgua <= 4 ? 'verde' : kpis.consumoAgua <= 5 ? 'amarillo' : 'rojo'}
            description="Meta: ≤ 4 m³/t"
          />
          <MetricCard
            title={vistaMode === 'lote' ? 'Consumo de Ácido' : 'Consumo de Ácido Promedio'}
            value={kpis.consumoAcido}
            unit="kg/t"
            icon={<AlertTriangle className="w-5 h-5" />}
            status={kpis.consumoAcido <= 200 ? 'verde' : kpis.consumoAcido <= 250 ? 'amarillo' : 'rojo'}
            description="Meta: ≤ 200 kg/t"
          />
        </div>

        {/* Detalle de metales para lote individual */}
        {vistaMode === 'lote' && loteActual && (
          <Card className="p-4 mb-6" variant="gradient">
            <h3 className="text-sm font-medium text-industrial-400 mb-3">Detalle de Metales en Efluente</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${cumplePH ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.phEfluente.toFixed(2)}
                </div>
                <div className="text-xs text-industrial-400">pH</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${cumpleNi ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.niEfluente.toFixed(2)}
                </div>
                <div className="text-xs text-industrial-400">Ni (mg/L)</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${cumpleFe ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.feEfluente.toFixed(2)}
                </div>
                <div className="text-xs text-industrial-400">Fe (mg/L)</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${cumpleCu ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.cuEfluente.toFixed(2)}
                </div>
                <div className="text-xs text-industrial-400">Cu (mg/L)</div>
              </div>
              <div className="bg-industrial-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold font-mono ${cumpleZn ? 'text-green-400' : 'text-red-400'}`}>
                  {kpis.znEfluente.toFixed(2)}
                </div>
                <div className="text-xs text-industrial-400">Zn (mg/L)</div>
              </div>
            </div>
          </Card>
        )}

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InfoCard
            title="Tendencia Calidad Efluente"
            icon={<Droplets className="w-5 h-5" />}
          >
            {tendenciaEfluente.length > 0 ? (
              <TrendLineChart
                data={tendenciaEfluente}
                lines={[
                  { dataKey: 'ph', color: '#4caf50', name: 'pH' },
                  { dataKey: 'Ni', color: '#ff9800', name: 'Ni (mg/L)' },
                ]}
                height={280}
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos ambientales'}
              </div>
            )}
          </InfoCard>

          <InfoCard
            title="Balance de Agua"
            icon={<Recycle className="w-5 h-5" />}
          >
            {balanceAgua.length > 0 ? (
              <TrendAreaChart
                data={balanceAgua}
                areas={[
                  { dataKey: 'recirculada', color: '#4caf50', name: 'Recirculada (%)' },
                  { dataKey: 'fresca', color: '#2196f3', name: 'Fresca (%)' },
                ]}
                height={280}
                stacked
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-industrial-400">
                {isLoading ? 'Cargando...' : 'No hay datos'}
              </div>
            )}
          </InfoCard>
        </div>

        {/* Cumplimiento y límites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <InfoCard
            title={vistaMode === 'lote' ? 'Metales del Lote vs Límites' : 'Metales Promedio vs Límites'}
            icon={<AlertTriangle className="w-5 h-5" />}
            className="lg:col-span-2"
          >
            {(vistaMode === 'promedio' && lotesConAmbiental.length > 0) || (vistaMode === 'lote' && loteActual) ? (
              <ComparisonBarChart
                data={metalesVsLimites}
                bars={[
                  { dataKey: 'actual', color: '#4caf50', name: vistaMode === 'lote' ? 'Valor del Lote (mg/L)' : 'Valor Promedio (mg/L)' },
                  { dataKey: 'limite', color: '#f44336', name: 'Límite Legal (mg/L)' },
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
            title="Estado de Cumplimiento"
            icon={<CheckCircle className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div className={`text-center p-4 rounded-lg border ${
                cumpleTodo 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                {cumpleTodo ? (
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                )}
                <div className={`text-lg font-semibold ${cumpleTodo ? 'text-green-400' : 'text-red-400'}`}>
                  {cumpleTodo ? 'CUMPLE' : 'NO CUMPLE'}
                </div>
                <div className="text-sm text-industrial-400">
                  {vistaMode === 'lote' ? 'Este lote' : 'Promedio general'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-industrial-800/30">
                  <span className="text-sm">pH Efluente</span>
                  <StatusBadge status={cumplePH ? 'verde' : 'rojo'} label={cumplePH ? 'OK' : 'Falla'} />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-industrial-800/30">
                  <span className="text-sm">Níquel</span>
                  <StatusBadge status={cumpleNi ? 'verde' : 'rojo'} label={cumpleNi ? 'OK' : 'Falla'} />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-industrial-800/30">
                  <span className="text-sm">Hierro</span>
                  <StatusBadge status={cumpleFe ? 'verde' : 'rojo'} label={cumpleFe ? 'OK' : 'Falla'} />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-industrial-800/30">
                  <span className="text-sm">Cobre</span>
                  <StatusBadge status={cumpleCu ? 'verde' : 'rojo'} label={cumpleCu ? 'OK' : 'Falla'} />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-industrial-800/30">
                  <span className="text-sm">Zinc</span>
                  <StatusBadge status={cumpleZn ? 'verde' : 'rojo'} label={cumpleZn ? 'OK' : 'Falla'} />
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Gauges de indicadores */}
        {((vistaMode === 'promedio' && lotesConCalculos.length > 0) || (vistaMode === 'lote' && loteActual)) && (
          <Card className="p-6" variant="gradient">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-nickel-400" />
              Indicadores de Sostenibilidad {vistaMode === 'lote' && loteActual ? `- ${loteActual.numeroLote}` : '(Promedio)'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <GaugeChart
                  value={kpis.circularidadAgua}
                  label="Circularidad H₂O"
                  thresholds={{ green: 85, yellow: 70 }}
                />
              </div>
              <div className="flex flex-col items-center">
                <GaugeChart
                  value={Math.max(0, 100 - (kpis.cargaNi / 0.2) * 100)}
                  label="Eficiencia Descarga"
                  thresholds={{ green: 70, yellow: 50 }}
                />
              </div>
              <div className="flex flex-col items-center">
                <GaugeChart
                  value={Math.max(0, 100 - (kpis.consumoAgua / 6) * 100)}
                  label="Eficiencia Hídrica"
                  thresholds={{ green: 70, yellow: 50 }}
                />
              </div>
              <div className="flex flex-col items-center">
                <GaugeChart
                  value={Math.max(0, 100 - (kpis.consumoAcido / 300) * 100)}
                  label="Eficiencia Ácido"
                  thresholds={{ green: 70, yellow: 50 }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tabla de límites */}
        <Card className="mt-6 p-6" variant="gradient">
          <h3 className="text-lg font-semibold text-white mb-4">
            Límites de Descarga {vistaMode === 'lote' && loteActual ? `- ${loteActual.numeroLote}` : '(Valores Promedio)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Valor {vistaMode === 'lote' ? 'del Lote' : 'Promedio'}</th>
                  <th>Límite Mínimo</th>
                  <th>Límite Máximo</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>pH</td>
                  <td className="font-mono">{kpis.phEfluente.toFixed(2)}</td>
                  <td className="text-industrial-400">6.0</td>
                  <td className="text-industrial-400">9.0</td>
                  <td>-</td>
                  <td><StatusLight status={cumplePH ? 'verde' : 'rojo'} showLabel /></td>
                </tr>
                <tr>
                  <td>Níquel (Ni)</td>
                  <td className="font-mono">{kpis.niEfluente.toFixed(2)}</td>
                  <td className="text-industrial-400">-</td>
                  <td className="text-industrial-400">2.0</td>
                  <td>mg/L</td>
                  <td><StatusLight status={cumpleNi ? 'verde' : 'rojo'} showLabel /></td>
                </tr>
                <tr>
                  <td>Hierro (Fe)</td>
                  <td className="font-mono">{kpis.feEfluente.toFixed(2)}</td>
                  <td className="text-industrial-400">-</td>
                  <td className="text-industrial-400">10.0</td>
                  <td>mg/L</td>
                  <td><StatusLight status={cumpleFe ? 'verde' : 'rojo'} showLabel /></td>
                </tr>
                <tr>
                  <td>Cobre (Cu)</td>
                  <td className="font-mono">{kpis.cuEfluente.toFixed(2)}</td>
                  <td className="text-industrial-400">-</td>
                  <td className="text-industrial-400">1.0</td>
                  <td>mg/L</td>
                  <td><StatusLight status={cumpleCu ? 'verde' : 'rojo'} showLabel /></td>
                </tr>
                <tr>
                  <td>Zinc (Zn)</td>
                  <td className="font-mono">{kpis.znEfluente.toFixed(2)}</td>
                  <td className="text-industrial-400">-</td>
                  <td className="text-industrial-400">5.0</td>
                  <td>mg/L</td>
                  <td><StatusLight status={cumpleZn ? 'verde' : 'rojo'} showLabel /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </ContentSection>
    </DashboardLayout>
  )
}
