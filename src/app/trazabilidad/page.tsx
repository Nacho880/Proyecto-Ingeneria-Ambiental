'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, InfoCard, StatRow } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusLight'
import { Button } from '@/components/ui/Form'
import {
  FileCheck,
  Search,
  Download,
  Eye,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  PlayCircle,
} from 'lucide-react'

interface Lote {
  id: string
  numeroLote: string
  fechaCreacion: string
  fechaCierre: string | null
  estado: 'en_proceso' | 'aprobado' | 'rechazado'
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
    caudalEfluente: number
  }[]
  calculos: {
    rendimientoLixiviacion: number
    recuperacionNi: number
    consumoEspecificoAcido: number
    indiceCircularidadAgua: number
    gradoBateria: boolean
  }[]
}

export default function TrazabilidadPage() {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchLotes = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/lotes')
      const result = await response.json()
      
      if (result.success && result.data) {
        setLotes(result.data)
      } else {
        setError('No se pudieron cargar los lotes')
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

  // Filtrar lotes
  const lotesFiltrados = lotes.filter(lote => {
    const matchSearch = lote.numeroLote.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === 'todos' || lote.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const totalPages = Math.ceil(lotesFiltrados.length / itemsPerPage)
  const paginatedLotes = lotesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDownloadPDF = async (lote: Lote) => {
    try {
      const response = await fetch(`/api/lotes/${lote.id}/certificado`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${lote.numeroLote}.html`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando certificado:', error)
      setSelectedLote(lote)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Registro de Lotes"
        description="Historial completo y certificados de todos los lotes procesados"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Registro' },
        ]}
      />

      <ContentSection>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error} - <button onClick={fetchLotes} className="underline">Reintentar</button>
          </div>
        )}

        {/* Filtros */}
        <Card className="p-4 mb-6" variant="gradient">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-industrial-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-industrial-900/50 border border-industrial-600/50 rounded-lg text-white placeholder-industrial-500 focus:outline-none focus:border-nickel-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-industrial-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2.5 bg-industrial-900/50 border border-industrial-600/50 rounded-lg text-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="en_proceso">En Proceso</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tabla de lotes */}
        <Card className="p-6" variant="gradient">
          {isLoading ? (
            <div className="text-center py-12 text-industrial-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Cargando lotes...
            </div>
          ) : lotesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-industrial-400">
              <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay lotes</h3>
              <p>No se encontraron lotes con los filtros seleccionados</p>
              <a href="/nuevo-lote" className="inline-block mt-4">
                <Button>Crear Nuevo Lote</Button>
              </a>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Fecha Creación</th>
                      <th>Fecha Cierre</th>
                      <th>Rendimiento</th>
                      <th>% Ni</th>
                      <th>Grado</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLotes.map((lote) => (
                      <tr key={lote.id}>
                        <td className="font-mono font-semibold text-nickel-400">
                          {lote.numeroLote}
                        </td>
                        <td>
                          {new Date(lote.fechaCreacion).toLocaleString('es', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          {lote.fechaCierre
                            ? new Date(lote.fechaCierre).toLocaleString('es', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="font-mono">
                          {(lote.calculos[0]?.rendimientoLixiviacion ?? 0).toFixed(1)}%
                        </td>
                        <td className={`font-mono ${(lote.datosCalidad[0]?.porcentajeNi ?? 0) >= 22 ? 'text-green-400' : 'text-red-400'}`}>
                          {(lote.datosCalidad[0]?.porcentajeNi ?? 0).toFixed(1)}%
                        </td>
                        <td>
                          {lote.estado === 'rechazado' ? (
                            <span className="text-red-400 text-sm">-</span>
                          ) : lote.estado === 'en_proceso' ? (
                            <span className="text-industrial-500 text-sm">Pendiente</span>
                          ) : lote.calculos[0]?.gradoBateria ? (
                            <span className="text-green-400 text-sm">Batería</span>
                          ) : (
                            <span className="text-industrial-400 text-sm">Estándar</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge
                            status={
                              lote.estado === 'aprobado' ? 'verde' :
                              lote.estado === 'rechazado' ? 'rojo' : 'amarillo'
                            }
                            label={
                              lote.estado === 'aprobado' ? 'Aprobado' :
                              lote.estado === 'rechazado' ? 'Rechazado' : 'En Proceso'
                            }
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {lote.estado === 'en_proceso' ? (
                              <a
                                href={`/completar-lote/${lote.id}`}
                                className="p-2 rounded-lg bg-nickel-600/50 hover:bg-nickel-500/50 text-nickel-300 hover:text-white transition-colors"
                                title="Completar lote"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </a>
                            ) : (
                              <>
                                <button
                                  onClick={() => setSelectedLote(lote)}
                                  className="p-2 rounded-lg bg-industrial-700/50 hover:bg-industrial-600/50 text-industrial-300 hover:text-white transition-colors"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(lote)}
                                  className="p-2 rounded-lg bg-industrial-700/50 hover:bg-nickel-600/50 text-industrial-300 hover:text-white transition-colors"
                                  title="Descargar certificado"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-industrial-700/30">
                  <div className="text-sm text-industrial-400">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                    {Math.min(currentPage * itemsPerPage, lotesFiltrados.length)} de{' '}
                    {lotesFiltrados.length} lotes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-industrial-700/50 hover:bg-industrial-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg ${
                          currentPage === page
                            ? 'bg-nickel-600 text-white'
                            : 'bg-industrial-700/50 hover:bg-industrial-600/50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-industrial-700/50 hover:bg-industrial-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Modal de detalles */}
        {selectedLote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-industrial-900 rounded-xl border border-industrial-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-industrial-900 p-6 border-b border-industrial-700/30 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Certificado de Lote
                  </h2>
                  <p className="text-industrial-400">{selectedLote.numeroLote}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => handleDownloadPDF(selectedLote)}
                  >
                    Descargar PDF
                  </Button>
                  <button
                    onClick={() => setSelectedLote(null)}
                    className="p-2 rounded-lg bg-industrial-700/50 hover:bg-industrial-600/50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-industrial-800/50 rounded-lg p-4">
                    <div className="text-xs text-industrial-400 mb-1">Estado</div>
                    <StatusBadge
                      status={
                        selectedLote.estado === 'aprobado' ? 'verde' :
                        selectedLote.estado === 'rechazado' ? 'rojo' : 'amarillo'
                      }
                      label={
                        selectedLote.estado === 'aprobado' ? 'Aprobado' :
                        selectedLote.estado === 'rechazado' ? 'Rechazado' : 'En Proceso'
                      }
                    />
                  </div>
                  <div className="bg-industrial-800/50 rounded-lg p-4">
                    <div className="text-xs text-industrial-400 mb-1">Grado</div>
                    <div className={`font-semibold ${
                      selectedLote.estado === 'rechazado' ? 'text-red-400' :
                      selectedLote.calculos[0]?.gradoBateria ? 'text-green-400' : 'text-industrial-300'
                    }`}>
                      {selectedLote.estado === 'rechazado' ? 'No aplica' :
                       selectedLote.calculos[0]?.gradoBateria ? 'Grado Batería' : 'Grado Estándar'}
                    </div>
                  </div>
                  <div className="bg-industrial-800/50 rounded-lg p-4">
                    <div className="text-xs text-industrial-400 mb-1">Fecha Inicio</div>
                    <div className="font-semibold text-white">
                      {new Date(selectedLote.fechaCreacion).toLocaleString('es', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="bg-industrial-800/50 rounded-lg p-4">
                    <div className="text-xs text-industrial-400 mb-1">Fecha Cierre</div>
                    <div className="font-semibold text-white">
                      {selectedLote.fechaCierre 
                        ? new Date(selectedLote.fechaCierre).toLocaleString('es', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'En proceso'}
                    </div>
                  </div>
                </div>

                {/* Datos de proceso */}
                {selectedLote.datosProceso[0] && (
                  <InfoCard title="Datos de Proceso" icon={<FileText className="w-5 h-5" />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatRow label="pH Reactor" value={selectedLote.datosProceso[0].phReactor} />
                      <StatRow label="Temperatura" value={selectedLote.datosProceso[0].temperaturaReactor} unit="°C" />
                      <StatRow label="Masa Concentrado" value={selectedLote.datosProceso[0].masaConcentrado} unit="kg" />
                      <StatRow label="Volumen Solución" value={selectedLote.datosProceso[0].volumenSolucion} unit="L" />
                      <StatRow label="Ácido Sulfúrico" value={selectedLote.datosProceso[0].acidoSulfurico} unit="kg" />
                    </div>
                  </InfoCard>
                )}

                {/* Datos de calidad */}
                {selectedLote.datosCalidad[0] && (
                  <InfoCard title="Datos de Calidad" icon={<FileText className="w-5 h-5" />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatRow 
                        label="% Níquel" 
                        value={selectedLote.datosCalidad[0].porcentajeNi} 
                        unit="%" 
                        status={selectedLote.datosCalidad[0].porcentajeNi >= 22 ? 'verde' : 'rojo'}
                      />
                      <StatRow 
                        label="Hierro" 
                        value={selectedLote.datosCalidad[0].impurezaFe} 
                        unit="ppm"
                        status={selectedLote.datosCalidad[0].impurezaFe <= 10 ? 'verde' : 'rojo'}
                      />
                      <StatRow 
                        label="Cobre" 
                        value={selectedLote.datosCalidad[0].impurezaCu} 
                        unit="ppm"
                        status={selectedLote.datosCalidad[0].impurezaCu <= 10 ? 'verde' : 'rojo'}
                      />
                      <StatRow 
                        label="Zinc" 
                        value={selectedLote.datosCalidad[0].impurezaZn} 
                        unit="ppm"
                        status={selectedLote.datosCalidad[0].impurezaZn <= 10 ? 'verde' : 'rojo'}
                      />
                      <StatRow 
                        label="Humedad" 
                        value={selectedLote.datosCalidad[0].humedad} 
                        unit="%"
                        status={selectedLote.datosCalidad[0].humedad <= 1.0 ? 'verde' : 'rojo'}
                      />
                    </div>
                  </InfoCard>
                )}

                {/* KPIs calculados */}
                {selectedLote.calculos[0] && (
                  <InfoCard title="KPIs Calculados" icon={<FileText className="w-5 h-5" />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatRow 
                        label="Rendimiento Lixiviación" 
                        value={selectedLote.calculos[0].rendimientoLixiviacion} 
                        unit="%" 
                        status={selectedLote.calculos[0].rendimientoLixiviacion >= 90 ? 'verde' : 'amarillo'}
                      />
                      <StatRow 
                        label="Recuperación Ni" 
                        value={selectedLote.calculos[0].recuperacionNi} 
                        unit="%"
                        status={selectedLote.calculos[0].recuperacionNi >= 92 ? 'verde' : 'amarillo'}
                      />
                      <StatRow 
                        label="Consumo Ácido" 
                        value={selectedLote.calculos[0].consumoEspecificoAcido} 
                        unit="kg/t"
                        status={selectedLote.calculos[0].consumoEspecificoAcido <= 200 ? 'verde' : 'amarillo'}
                      />
                      <StatRow 
                        label="Circularidad Agua" 
                        value={selectedLote.calculos[0].indiceCircularidadAgua} 
                        unit="%"
                        status={selectedLote.calculos[0].indiceCircularidadAgua >= 85 ? 'verde' : 'amarillo'}
                      />
                    </div>
                  </InfoCard>
                )}

                {/* Datos ambientales */}
                {selectedLote.datosAmbientales[0] && (
                  <InfoCard title="Datos Ambientales" icon={<FileText className="w-5 h-5" />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatRow 
                        label="pH Efluente" 
                        value={selectedLote.datosAmbientales[0].phEfluente}
                        status={selectedLote.datosAmbientales[0].phEfluente >= 6 && selectedLote.datosAmbientales[0].phEfluente <= 9 ? 'verde' : 'rojo'}
                      />
                      <StatRow 
                        label="Ni en Efluente" 
                        value={selectedLote.datosAmbientales[0].niEfluente} 
                        unit="mg/L"
                        status={selectedLote.datosAmbientales[0].niEfluente <= 2.0 ? 'verde' : 'rojo'}
                      />
                      <StatRow 
                        label="Caudal Efluente" 
                        value={selectedLote.datosAmbientales[0].caudalEfluente} 
                        unit="m³/día"
                      />
                    </div>
                  </InfoCard>
                )}
              </div>
            </div>
          </div>
        )}
      </ContentSection>
    </DashboardLayout>
  )
}
