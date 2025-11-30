'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Input, Button, FormSection } from '@/components/ui/Form'
import { StatusBadge } from '@/components/ui/StatusLight'
import {
  Save,
  CheckCircle,
  Beaker,
  Thermometer,
  FlaskConical,
  AlertCircle,
} from 'lucide-react'

interface FormData {
  // Solo datos del proceso de lixiviación
  phReactor: string
  temperaturaReactor: string
  masaConcentrado: string
  volumenSolucion: string
  acidoSulfurico: string
}

const initialFormData: FormData = {
  phReactor: '',
  temperaturaReactor: '',
  masaConcentrado: '',
  volumenSolucion: '',
  acidoSulfurico: '',
}

export default function NuevoLotePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [success, setSuccess] = useState(false)
  const [nuevoLote, setNuevoLote] = useState<string | null>(null)

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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Solo validar que los campos requeridos no estén vacíos
    if (!formData.phReactor) newErrors.phReactor = 'Requerido'
    if (!formData.temperaturaReactor) newErrors.temperaturaReactor = 'Requerido'
    if (!formData.masaConcentrado) newErrors.masaConcentrado = 'Requerido'
    if (!formData.volumenSolucion) newErrors.volumenSolucion = 'Requerido'
    if (!formData.acidoSulfurico) newErrors.acidoSulfurico = 'Requerido'

    // NO bloqueamos valores fuera de rango - en el mundo real puede pasar
    // Solo mostramos advertencias visuales

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proceso: {
            phReactor: parseFloat(formData.phReactor),
            temperaturaReactor: parseFloat(formData.temperaturaReactor),
            masaConcentrado: parseFloat(formData.masaConcentrado),
            volumenSolucion: parseFloat(formData.volumenSolucion),
            acidoSulfurico: parseFloat(formData.acidoSulfurico),
          },
          // Sin datos de calidad ni ambientales - lote queda "en_proceso"
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setNuevoLote(result.data.numeroLote)
      } else {
        alert('Error al guardar el lote')
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setSuccess(false)
    setNuevoLote(null)
    setErrors({})
  }

  // Verificar estado de los parámetros
  const getPhStatus = () => {
    const ph = parseFloat(formData.phReactor)
    if (!ph) return null
    if (ph >= 1.3 && ph <= 2.0) return 'optimo'
    if (ph >= 1.0 && ph <= 2.5) return 'aceptable'
    return 'fuera'
  }

  const getTempStatus = () => {
    const temp = parseFloat(formData.temperaturaReactor)
    if (!temp) return null
    if (temp >= 80 && temp <= 90) return 'optimo'
    if (temp >= 70 && temp <= 95) return 'aceptable'
    return 'fuera'
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Iniciar Nuevo Lote"
        description="Registra los datos iniciales del proceso de lixiviación"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Nuevo Lote' },
        ]}
      />

      <ContentSection>
        {/* Mensaje de éxito */}
        {success && nuevoLote && (
          <Card className="mb-6 p-6 bg-green-500/10 border-green-500/30" variant="default">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  ¡Lote Creado Exitosamente!
                </h3>
                <p className="text-industrial-300 mb-4">
                  El lote <span className="font-mono font-bold text-white">{nuevoLote}</span> ha sido creado y está <StatusBadge status="amarillo" label="En Proceso" />.
                </p>
                <p className="text-industrial-400 text-sm mb-4">
                  Cuando termine la lixiviación y tengas los resultados del laboratorio, 
                  ve a <strong>Registro</strong> para completar los datos de calidad y cerrar el lote.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleReset} variant="secondary">
                    Crear Otro Lote
                  </Button>
                  <Button onClick={() => router.push('/trazabilidad')}>
                    Ir a Registro
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Formulario */}
        {!success && (
          <Card className="max-w-3xl mx-auto p-6" variant="gradient">
            {/* Indicador de paso */}
            <div className="mb-6 p-4 bg-industrial-800/50 rounded-lg border border-industrial-600/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nickel-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Paso 1: Datos del Proceso</h3>
                  <p className="text-sm text-industrial-400">
                    Ingresa los parámetros iniciales de la lixiviación
                  </p>
                </div>
              </div>
              <div className="mt-3 ml-13 pl-10 border-l-2 border-industrial-600/50">
                <div className="flex items-center gap-2 text-industrial-500 text-sm">
                  <div className="w-6 h-6 rounded-full bg-industrial-700 flex items-center justify-center text-xs">2</div>
                  <span>Datos de Calidad → Se agregan al cerrar el lote</span>
                </div>
                <div className="flex items-center gap-2 text-industrial-500 text-sm mt-1">
                  <div className="w-6 h-6 rounded-full bg-industrial-700 flex items-center justify-center text-xs">3</div>
                  <span>Datos Ambientales → Se agregan al cerrar el lote</span>
                </div>
              </div>
            </div>

            <FormSection
              title="Datos del Proceso de Lixiviación"
              description="Parámetros de operación del reactor"
            >
              <div className="relative">
                <Input
                  label="pH del Reactor"
                  type="number"
                  step="0.01"
                  value={formData.phReactor}
                  onChange={handleInputChange('phReactor')}
                  placeholder="1.5"
                  error={errors.phReactor}
                  helpText="Rango óptimo: 1.3 - 2.0"
                  required
                />
                {getPhStatus() && (
                  <div className={`absolute right-2 top-9 text-xs px-2 py-1 rounded ${
                    getPhStatus() === 'optimo' ? 'bg-green-500/20 text-green-400' :
                    getPhStatus() === 'aceptable' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {getPhStatus() === 'optimo' ? '✓ Óptimo' :
                     getPhStatus() === 'aceptable' ? '⚠ Aceptable' : '✗ Fuera de rango'}
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Temperatura del Reactor"
                  type="number"
                  step="0.1"
                  value={formData.temperaturaReactor}
                  onChange={handleInputChange('temperaturaReactor')}
                  placeholder="85"
                  unit="°C"
                  error={errors.temperaturaReactor}
                  helpText="Rango óptimo: 80 - 90°C"
                  required
                />
                {getTempStatus() && (
                  <div className={`absolute right-12 top-9 text-xs px-2 py-1 rounded ${
                    getTempStatus() === 'optimo' ? 'bg-green-500/20 text-green-400' :
                    getTempStatus() === 'aceptable' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {getTempStatus() === 'optimo' ? '✓ Óptimo' :
                     getTempStatus() === 'aceptable' ? '⚠ Aceptable' : '✗ Fuera de rango'}
                  </div>
                )}
              </div>

              <Input
                label="Masa de Concentrado"
                type="number"
                step="1"
                value={formData.masaConcentrado}
                onChange={handleInputChange('masaConcentrado')}
                placeholder="1000"
                unit="kg"
                error={errors.masaConcentrado}
                helpText="Cantidad de mineral a procesar"
                required
              />
              <Input
                label="Volumen de Solución"
                type="number"
                step="1"
                value={formData.volumenSolucion}
                onChange={handleInputChange('volumenSolucion')}
                placeholder="5000"
                unit="L"
                error={errors.volumenSolucion}
                helpText="Volumen total en el reactor"
                required
              />
              <Input
                label="Ácido Sulfúrico Agregado"
                type="number"
                step="0.1"
                value={formData.acidoSulfurico}
                onChange={handleInputChange('acidoSulfurico')}
                placeholder="200"
                unit="kg"
                error={errors.acidoSulfurico}
                helpText="Cantidad de H₂SO₄ utilizado"
                required
              />
            </FormSection>

            {/* Info del proceso */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-industrial-300">
                  <p className="font-medium text-blue-400 mb-1">¿Qué pasa después?</p>
                  <p>El lote quedará en estado <strong>"En Proceso"</strong>. Cuando termine la lixiviación y tengas los resultados del laboratorio, podrás completar el lote desde la sección de Registro.</p>
                </div>
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end mt-6 pt-6 border-t border-industrial-700/30">
              <Button
                onClick={handleSave}
                loading={isSaving}
                icon={<Save className="w-4 h-4" />}
                size="lg"
              >
                Iniciar Lote
              </Button>
            </div>
          </Card>
        )}
      </ContentSection>
    </DashboardLayout>
  )
}
