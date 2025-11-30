'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, InfoCard, StatRow } from '@/components/ui/Card'
import { Input, Button, FormSection } from '@/components/ui/Form'
import { StatusBadge } from '@/components/ui/StatusLight'
import {
  Save,
  Calculator,
  AlertCircle,
  CheckCircle,
  XCircle,
  FlaskConical,
  Leaf,
  ArrowRight,
  Loader2,
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
    volumenSolucion: number
    acidoSulfurico: number
  }[]
}

interface FormData {
  // Datos de calidad
  porcentajeNi: string
  impurezaFe: string
  impurezaCu: string
  impurezaZn: string
  humedad: string
  // Datos ambientales
  phEfluente: string
  niEfluente: string
  feEfluente: string
  cuEfluente: string
  znEfluente: string
  caudalEfluente: string
  aguaRecirculada: string
  aguaFresca: string
}

interface CalculatedKPIs {
  rendimientoLixiviacion: number
  recuperacionNi: number
  consumoEspecificoAcido: number
  consumoAgua: number
  indiceCircularidadAgua: number
  cargaContaminanteNi: number
  purezaTotal: number
  gradoBateria: boolean
  cumplimientoPH: boolean
  cumplimientoMetales: boolean
  estadoLote: 'aprobado' | 'rechazado'
}

const initialFormData: FormData = {
  porcentajeNi: '',
  impurezaFe: '',
  impurezaCu: '',
  impurezaZn: '',
  humedad: '',
  phEfluente: '',
  niEfluente: '',
  feEfluente: '',
  cuEfluente: '',
  znEfluente: '',
  caudalEfluente: '',
  aguaRecirculada: '',
  aguaFresca: '',
}

export default function CompletarLotePage() {
  const router = useRouter()
  const params = useParams()
  const loteId = params.id as string

  const [lote, setLote] = useState<Lote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1) // 1: Calidad, 2: Ambiental, 3: Resultados
  const [calculatedKPIs, setCalculatedKPIs] = useState<CalculatedKPIs | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Cargar datos del lote
  useEffect(() => {
    const fetchLote = async () => {
      try {
        const response = await fetch(`/api/lotes/${loteId}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          if (result.data.estado !== 'en_proceso') {
            alert('Este lote ya fue completado')
            router.push('/trazabilidad')
            return
          }
          setLote(result.data)
        } else {
          alert('Lote no encontrado')
          router.push('/trazabilidad')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error cargando lote')
        router.push('/trazabilidad')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLote()
  }, [loteId, router])

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}

    if (step === 1) {
      if (!formData.porcentajeNi) newErrors.porcentajeNi = 'Requerido'
      if (!formData.impurezaFe) newErrors.impurezaFe = 'Requerido'
      if (!formData.impurezaCu) newErrors.impurezaCu = 'Requerido'
      if (!formData.impurezaZn) newErrors.impurezaZn = 'Requerido'
      if (!formData.humedad) newErrors.humedad = 'Requerido'
    } else if (step === 2) {
      if (!formData.phEfluente) newErrors.phEfluente = 'Requerido'
      if (!formData.caudalEfluente) newErrors.caudalEfluente = 'Requerido'
      if (!formData.aguaRecirculada) newErrors.aguaRecirculada = 'Requerido'
      if (!formData.aguaFresca) newErrors.aguaFresca = 'Requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1)
      } else {
        calculateKPIs()
      }
    }
  }

  const calculateKPIs = async () => {
    if (!lote) return
    setIsCalculating(true)

    setTimeout(() => {
      const proceso = lote.datosProceso[0]
      const masaConcentrado = proceso.masaConcentrado
      const acidoSulfurico = proceso.acidoSulfurico
      const porcentajeNi = parseFloat(formData.porcentajeNi) || 0
      const impurezaFe = parseFloat(formData.impurezaFe) || 0
      const impurezaCu = parseFloat(formData.impurezaCu) || 0
      const impurezaZn = parseFloat(formData.impurezaZn) || 0
      const humedad = parseFloat(formData.humedad) || 0
      const phEfluente = parseFloat(formData.phEfluente) || 0
      const niEfluente = parseFloat(formData.niEfluente) || 0
      const caudalEfluente = parseFloat(formData.caudalEfluente) || 0
      const aguaRecirculada = parseFloat(formData.aguaRecirculada) || 0
      const aguaFresca = parseFloat(formData.aguaFresca) || 0

      // Cálculos
      const masaToneladas = masaConcentrado / 1000
      const consumoEspecificoAcido = masaToneladas > 0 ? acidoSulfurico / masaToneladas : 0
      const consumoAgua = masaToneladas > 0 ? aguaFresca / masaToneladas : 0
      const aguaTotal = aguaRecirculada + aguaFresca
      const indiceCircularidadAgua = aguaTotal > 0 ? (aguaRecirculada / aguaTotal) * 100 : 0
      const cargaContaminanteNi = (niEfluente * caudalEfluente) / 1000

      const totalImpurezasPct = (impurezaFe + impurezaCu + impurezaZn) / 10000
      const purezaTotal = 100 - totalImpurezasPct - humedad

      const gradoBateria =
        porcentajeNi >= 22 &&
        impurezaFe <= 10 &&
        impurezaCu <= 10 &&
        impurezaZn <= 10 &&
        humedad <= 1.0

      const cumplimientoPH = phEfluente >= 6.0 && phEfluente <= 9.0
      const cumplimientoMetales =
        niEfluente <= 2.0 &&
        (parseFloat(formData.feEfluente) || 0) <= 10.0 &&
        (parseFloat(formData.cuEfluente) || 0) <= 1.0 &&
        (parseFloat(formData.znEfluente) || 0) <= 5.0

      // Rendimiento basado en datos reales
      const niEnConcentrado = masaConcentrado * 0.15 // 15% Ni típico
      const factorRecuperacion = porcentajeNi / 22 // Normalizado
      const rendimientoLixiviacion = Math.min(99, 80 + factorRecuperacion * 15)
      const recuperacionNi = Math.min(99, 85 + factorRecuperacion * 12)

      const estadoLote: 'aprobado' | 'rechazado' = 
        cumplimientoPH && cumplimientoMetales ? 'aprobado' : 'rechazado'

      setCalculatedKPIs({
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
        estadoLote,
      })

      setCurrentStep(3)
      setIsCalculating(false)
    }, 1500)
  }

  const handleSave = async () => {
    if (!calculatedKPIs || !lote) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/lotes/${loteId}/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calidad: {
            porcentajeNi: parseFloat(formData.porcentajeNi),
            impurezaFe: parseFloat(formData.impurezaFe),
            impurezaCu: parseFloat(formData.impurezaCu),
            impurezaZn: parseFloat(formData.impurezaZn),
            humedad: parseFloat(formData.humedad),
          },
          ambiental: {
            phEfluente: parseFloat(formData.phEfluente),
            niEfluente: parseFloat(formData.niEfluente) || 0,
            feEfluente: parseFloat(formData.feEfluente) || 0,
            cuEfluente: parseFloat(formData.cuEfluente) || 0,
            znEfluente: parseFloat(formData.znEfluente) || 0,
            caudalEfluente: parseFloat(formData.caudalEfluente),
            aguaRecirculada: parseFloat(formData.aguaRecirculada),
            aguaFresca: parseFloat(formData.aguaFresca),
          },
          kpis: calculatedKPIs,
        }),
      })

      if (response.ok) {
        router.push('/trazabilidad')
      } else {
        alert('Error al guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <ContentSection>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-nickel-400" />
          </div>
        </ContentSection>
      </DashboardLayout>
    )
  }

  if (!lote) return null

  const proceso = lote.datosProceso[0]

  return (
    <DashboardLayout>
      <PageHeader
        title="Completar Lote"
        description={`Agregar datos de calidad y ambientales para cerrar el lote ${lote.numeroLote}`}
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Trazabilidad', href: '/trazabilidad' },
          { label: 'Completar Lote' },
        ]}
      />

      <ContentSection>
        {/* Info del lote */}
        <Card className="mb-6 p-4" variant="gradient">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold font-mono text-nickel-400">
                {lote.numeroLote}
              </div>
              <StatusBadge status="amarillo" label="En Proceso" />
            </div>
            <div className="text-sm text-industrial-400">
              Iniciado: {new Date(lote.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </Card>

        {/* Datos de proceso (solo lectura) */}
        <Card className="mb-6 p-4 bg-industrial-800/30" variant="default">
          <h3 className="text-sm font-medium text-industrial-400 mb-3">Datos del Proceso (registrados al crear)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-industrial-500">pH:</span>
              <span className="ml-2 font-mono text-white">{proceso.phReactor}</span>
            </div>
            <div>
              <span className="text-industrial-500">Temp:</span>
              <span className="ml-2 font-mono text-white">{proceso.temperaturaReactor}°C</span>
            </div>
            <div>
              <span className="text-industrial-500">Masa:</span>
              <span className="ml-2 font-mono text-white">{proceso.masaConcentrado} kg</span>
            </div>
            <div>
              <span className="text-industrial-500">Volumen:</span>
              <span className="ml-2 font-mono text-white">{proceso.volumenSolucion} L</span>
            </div>
            <div>
              <span className="text-industrial-500">Ácido:</span>
              <span className="ml-2 font-mono text-white">{proceso.acidoSulfurico} kg</span>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Calidad', icon: FlaskConical },
              { num: 2, label: 'Ambiental', icon: Leaf },
              { num: 3, label: 'Resultados', icon: Calculator },
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.num
              const isCompleted = currentStep > step.num

              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all
                        ${isActive ? 'bg-nickel-600 text-white ring-4 ring-nickel-600/30' :
                          isCompleted ? 'bg-nickel-600 text-white' :
                          'bg-industrial-700 text-industrial-400'}
                      `}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`mt-2 text-sm ${isActive ? 'text-nickel-400' : 'text-industrial-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-1 rounded ${isCompleted ? 'bg-nickel-600' : 'bg-industrial-700'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-4xl mx-auto p-6" variant="gradient">
          {currentStep === 1 && (
            <FormSection
              title="Datos de Calidad del Producto"
              description="Resultados del análisis de laboratorio"
            >
              <Input
                label="% Níquel en Producto"
                type="number"
                step="0.01"
                value={formData.porcentajeNi}
                onChange={handleInputChange('porcentajeNi')}
                placeholder="22.5"
                unit="%"
                error={errors.porcentajeNi}
                helpText="Mínimo grado batería: 22%"
                required
              />
              <Input
                label="Impureza de Hierro"
                type="number"
                step="0.1"
                value={formData.impurezaFe}
                onChange={handleInputChange('impurezaFe')}
                placeholder="5"
                unit="ppm"
                error={errors.impurezaFe}
                helpText="Máximo grado batería: 10 ppm"
                required
              />
              <Input
                label="Impureza de Cobre"
                type="number"
                step="0.1"
                value={formData.impurezaCu}
                onChange={handleInputChange('impurezaCu')}
                placeholder="3"
                unit="ppm"
                error={errors.impurezaCu}
                helpText="Máximo grado batería: 10 ppm"
                required
              />
              <Input
                label="Impureza de Zinc"
                type="number"
                step="0.1"
                value={formData.impurezaZn}
                onChange={handleInputChange('impurezaZn')}
                placeholder="4"
                unit="ppm"
                error={errors.impurezaZn}
                helpText="Máximo grado batería: 10 ppm"
                required
              />
              <Input
                label="Humedad"
                type="number"
                step="0.01"
                value={formData.humedad}
                onChange={handleInputChange('humedad')}
                placeholder="0.5"
                unit="%"
                error={errors.humedad}
                helpText="Máximo grado batería: 1.0%"
                required
              />
            </FormSection>
          )}

          {currentStep === 2 && (
            <FormSection
              title="Datos Ambientales"
              description="Parámetros de control ambiental del efluente"
            >
              <Input
                label="pH del Efluente"
                type="number"
                step="0.01"
                value={formData.phEfluente}
                onChange={handleInputChange('phEfluente')}
                placeholder="7.5"
                error={errors.phEfluente}
                helpText="Límite legal: 6.0 - 9.0"
                required
              />
              <Input
                label="Níquel en Efluente"
                type="number"
                step="0.01"
                value={formData.niEfluente}
                onChange={handleInputChange('niEfluente')}
                placeholder="0.5"
                unit="mg/L"
                helpText="Límite legal: 2.0 mg/L"
              />
              <Input
                label="Hierro en Efluente"
                type="number"
                step="0.01"
                value={formData.feEfluente}
                onChange={handleInputChange('feEfluente')}
                placeholder="3"
                unit="mg/L"
                helpText="Límite interno: 10.0 mg/L"
                required
              />
              <Input
                label="Cobre en Efluente"
                type="number"
                step="0.01"
                value={formData.cuEfluente}
                onChange={handleInputChange('cuEfluente')}
                placeholder="0.2"
                unit="mg/L"
                helpText="Límite legal: 1.0 mg/L"
              />
              <Input
                label="Zinc en Efluente"
                type="number"
                step="0.01"
                value={formData.znEfluente}
                onChange={handleInputChange('znEfluente')}
                placeholder="1.5"
                unit="mg/L"
                helpText="Límite legal: 5.0 mg/L"
              />
              <Input
                label="Caudal del Efluente"
                type="number"
                step="0.1"
                value={formData.caudalEfluente}
                onChange={handleInputChange('caudalEfluente')}
                placeholder="50"
                unit="m³/día"
                error={errors.caudalEfluente}
                required
              />
              <Input
                label="Agua Recirculada"
                type="number"
                step="0.1"
                value={formData.aguaRecirculada}
                onChange={handleInputChange('aguaRecirculada')}
                placeholder="80"
                unit="m³/día"
                error={errors.aguaRecirculada}
                required
              />
              <Input
                label="Agua Fresca"
                type="number"
                step="0.1"
                value={formData.aguaFresca}
                onChange={handleInputChange('aguaFresca')}
                placeholder="15"
                unit="m³/día"
                error={errors.aguaFresca}
                required
              />
            </FormSection>
          )}

          {currentStep === 3 && calculatedKPIs && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div
                  className={`
                    inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
                    ${calculatedKPIs.estadoLote === 'aprobado'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                    }
                  `}
                >
                  {calculatedKPIs.estadoLote === 'aprobado' ? (
                    <CheckCircle className="w-10 h-10" />
                  ) : (
                    <XCircle className="w-10 h-10" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Lote {calculatedKPIs.estadoLote === 'aprobado' ? 'APROBADO' : 'RECHAZADO'}
                </h3>
                <StatusBadge
                  status={calculatedKPIs.gradoBateria ? 'verde' : 'amarillo'}
                  label={calculatedKPIs.gradoBateria ? 'Grado Batería' : 'Grado Estándar'}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-industrial-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">
                    {calculatedKPIs.rendimientoLixiviacion.toFixed(1)}%
                  </div>
                  <div className="text-xs text-industrial-400 mt-1">Rendimiento</div>
                </div>
                <div className="bg-industrial-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">
                    {calculatedKPIs.recuperacionNi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-industrial-400 mt-1">Recuperación Ni</div>
                </div>
                <div className="bg-industrial-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">
                    {calculatedKPIs.indiceCircularidadAgua.toFixed(1)}%
                  </div>
                  <div className="text-xs text-industrial-400 mt-1">Circularidad H₂O</div>
                </div>
                <div className="bg-industrial-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">
                    {calculatedKPIs.consumoEspecificoAcido.toFixed(0)}
                  </div>
                  <div className="text-xs text-industrial-400 mt-1">kg ácido/t</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className={`
                  flex items-center gap-3 p-4 rounded-lg
                  ${calculatedKPIs.cumplimientoPH ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}
                `}>
                  {calculatedKPIs.cumplimientoPH ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm">pH Efluente</span>
                </div>
                <div className={`
                  flex items-center gap-3 p-4 rounded-lg
                  ${calculatedKPIs.cumplimientoMetales ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}
                `}>
                  {calculatedKPIs.cumplimientoMetales ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm">Metales en Efluente</span>
                </div>
                <div className={`
                  flex items-center gap-3 p-4 rounded-lg
                  ${calculatedKPIs.gradoBateria ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}
                `}>
                  {calculatedKPIs.gradoBateria ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-sm">Grado Batería</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-industrial-700/30">
            {currentStep > 1 && currentStep < 3 ? (
              <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)}>
                Anterior
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                loading={isCalculating}
                icon={currentStep === 2 ? <Calculator className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              >
                {currentStep === 2 ? 'Calcular KPIs' : 'Siguiente'}
              </Button>
            ) : (
              <Button onClick={handleSave} loading={isSaving} icon={<Save className="w-4 h-4" />}>
                Cerrar Lote
              </Button>
            )}
          </div>
        </Card>
      </ContentSection>
    </DashboardLayout>
  )
}

