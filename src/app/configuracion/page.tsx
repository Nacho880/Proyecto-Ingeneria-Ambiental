'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader, ContentSection } from '@/components/layout/DashboardLayout'
import { Card, InfoCard } from '@/components/ui/Card'
import { Input, Button } from '@/components/ui/Form'
import {
  Save,
  Shield,
  Gauge,
  AlertTriangle,
  Scale,
  Info,
  CheckCircle,
} from 'lucide-react'

// Límites según normativa chilena
const NORMATIVAS = {
  ds609: {
    nombre: 'DS 609/1998',
    descripcion: 'Descarga a Alcantarillado',
    limites: {
      pH_min: '5.5',
      pH_max: '9.0',
      Ni_max: '4.0',
      Fe_max: '10.0', // No regulado, límite interno
      Cu_max: '3.0',
      Zn_max: '5.0',
    }
  },
  ds90: {
    nombre: 'DS 90/2000',
    descripcion: 'Descarga a Aguas Superficiales (Río, Lago, Mar)',
    limites: {
      pH_min: '6.0',
      pH_max: '8.5',
      Ni_max: '0.2',
      Fe_max: '10.0', // No regulado, límite interno
      Cu_max: '1.0',
      Zn_max: '3.0',
    }
  },
  personalizado: {
    nombre: 'Personalizado',
    descripcion: 'Configurar límites manualmente',
    limites: {
      pH_min: '6.0',
      pH_max: '9.0',
      Ni_max: '2.0',
      Fe_max: '10.0',
      Cu_max: '1.0',
      Zn_max: '5.0',
    }
  }
}

type NormativaKey = keyof typeof NORMATIVAS

// Especificaciones de grado batería
const GRADOS_BATERIA = {
  estandar: {
    nombre: 'Grado Batería Estándar',
    descripcion: 'Baterías de consumo general',
    specs: {
      Ni_min: '22.0',
      Fe_max: '10',
      Cu_max: '10',
      Zn_max: '10',
      Humedad_max: '1.0',
    }
  },
  premium: {
    nombre: 'Grado Batería Premium',
    descripcion: 'Baterías EV de alta performance',
    specs: {
      Ni_min: '22.3',
      Fe_max: '5',
      Cu_max: '5',
      Zn_max: '5',
      Humedad_max: '0.5',
    }
  },
  personalizado: {
    nombre: 'Personalizado',
    descripcion: 'Según especificaciones del cliente',
    specs: {
      Ni_min: '22.0',
      Fe_max: '10',
      Cu_max: '10',
      Zn_max: '10',
      Humedad_max: '1.0',
    }
  }
}

type GradoBateriaKey = keyof typeof GRADOS_BATERIA

export default function ConfiguracionPage() {
  const [normativaSeleccionada, setNormativaSeleccionada] = useState<NormativaKey>('ds609')
  const [limitesAmbientales, setLimitesAmbientales] = useState(NORMATIVAS.ds609.limites)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)

  const [gradoSeleccionado, setGradoSeleccionado] = useState<GradoBateriaKey>('estandar')
  const [especificacionesCalidad, setEspecificacionesCalidad] = useState(GRADOS_BATERIA.estandar.specs)

  const [rangosOptimos, setRangosOptimos] = useState({
    pH_min: '1.3',
    pH_max: '2.0',
    temp_min: '80',
    temp_max: '90',
    rendimiento_min: '90',
    recuperacion_min: '92',
  })

  const [isSaving, setIsSaving] = useState(false)

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const configGuardada = localStorage.getItem('niso4_config')
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada)
        if (config.normativa) setNormativaSeleccionada(config.normativa)
        if (config.limitesAmbientales) setLimitesAmbientales(config.limitesAmbientales)
        if (config.gradoBateria) setGradoSeleccionado(config.gradoBateria)
        if (config.especificacionesCalidad) setEspecificacionesCalidad(config.especificacionesCalidad)
        if (config.rangosOptimos) setRangosOptimos(config.rangosOptimos)
      } catch (e) {
        console.error('Error cargando configuración:', e)
      }
    }
  }, [])

  // Cambiar límites cuando se selecciona una normativa
  const handleNormativaChange = (normativa: NormativaKey) => {
    setNormativaSeleccionada(normativa)
    if (normativa !== 'personalizado') {
      setLimitesAmbientales(NORMATIVAS[normativa].limites)
    }
  }

  // Cambiar especificaciones cuando se selecciona un grado de batería
  const handleGradoChange = (grado: GradoBateriaKey) => {
    setGradoSeleccionado(grado)
    if (grado !== 'personalizado') {
      setEspecificacionesCalidad(GRADOS_BATERIA[grado].specs)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setGuardadoExitoso(false)
    
    // Guardar en localStorage
    const config = {
      normativa: normativaSeleccionada,
      limitesAmbientales,
      gradoBateria: gradoSeleccionado,
      especificacionesCalidad,
      rangosOptimos,
      fechaGuardado: new Date().toISOString(),
    }
    localStorage.setItem('niso4_config', JSON.stringify(config))
    
    // Simular un pequeño delay
    setTimeout(() => {
      setIsSaving(false)
      setGuardadoExitoso(true)
      setTimeout(() => setGuardadoExitoso(false), 3000)
    }, 500)
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Configuración"
        description="Ajustes de límites, especificaciones y parámetros del sistema"
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Configuración' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            {guardadoExitoso && (
              <span className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Guardado
              </span>
            )}
            <Button
              onClick={handleSave}
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Guardar Cambios
            </Button>
          </div>
        }
      />

      <ContentSection>
        {/* Selector de Normativa */}
        <Card className="p-6 mb-6" variant="gradient">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-nickel-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Normativa Ambiental Aplicable</h3>
              <p className="text-sm text-industrial-400">Selecciona según el destino de descarga de tu planta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(Object.keys(NORMATIVAS) as NormativaKey[]).map((key) => {
              const norm = NORMATIVAS[key]
              const isSelected = normativaSeleccionada === key
              return (
                <button
                  key={key}
                  onClick={() => handleNormativaChange(key)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-nickel-500 bg-nickel-600/20'
                      : 'border-industrial-600/50 bg-industrial-800/30 hover:border-industrial-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold ${isSelected ? 'text-nickel-400' : 'text-white'}`}>
                      {norm.nombre}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-nickel-500 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-industrial-400">{norm.descripcion}</p>
                </button>
              )
            })}
          </div>

          {/* Info de la normativa seleccionada */}
          <div className="p-4 bg-industrial-800/50 rounded-lg border border-industrial-700/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm">
                {normativaSeleccionada === 'ds609' && (
                  <>
                    <p className="text-white font-medium mb-1">DS 609/1998 - Alcantarillado</p>
                    <p className="text-industrial-400">
                      Norma de emisión para descargas de residuos industriales líquidos a sistemas de alcantarillado.
                      Límites más permisivos porque el agua pasa por tratamiento posterior.
                    </p>
                  </>
                )}
                {normativaSeleccionada === 'ds90' && (
                  <>
                    <p className="text-white font-medium mb-1">DS 90/2000 - Aguas Superficiales</p>
                    <p className="text-industrial-400">
                      Norma de emisión para descargas a ríos, lagos y mar.
                      Límites más estrictos para proteger ecosistemas acuáticos.
                      <span className="text-amber-400 block mt-1">
                        ⚠️ Níquel máximo permitido: 0.2 mg/L (muy estricto)
                      </span>
                    </p>
                  </>
                )}
                {normativaSeleccionada === 'personalizado' && (
                  <>
                    <p className="text-white font-medium mb-1">Límites Personalizados</p>
                    <p className="text-industrial-400">
                      Configura tus propios límites según requerimientos específicos de tu RCA (Resolución de Calificación Ambiental)
                      u otras normativas aplicables.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Límites Ambientales */}
          <InfoCard
            title="Límites Ambientales"
            icon={<Shield className="w-5 h-5" />}
          >
            <p className="text-sm text-industrial-400 mb-2">
              Límites según <span className="text-nickel-400 font-medium">{NORMATIVAS[normativaSeleccionada].nombre}</span>
            </p>
            {normativaSeleccionada !== 'personalizado' && (
              <p className="text-xs text-amber-400/70 mb-4">
                💡 Selecciona "Personalizado" para editar estos valores
              </p>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="pH Mínimo"
                  type="number"
                  step="0.1"
                  value={limitesAmbientales.pH_min}
                  onChange={(e) => setLimitesAmbientales(prev => ({ ...prev, pH_min: e.target.value }))}
                  disabled={normativaSeleccionada !== 'personalizado'}
                />
                <Input
                  label="pH Máximo"
                  type="number"
                  step="0.1"
                  value={limitesAmbientales.pH_max}
                  onChange={(e) => setLimitesAmbientales(prev => ({ ...prev, pH_max: e.target.value }))}
                  disabled={normativaSeleccionada !== 'personalizado'}
                />
              </div>
              <Input
                label="Níquel Máximo"
                type="number"
                step="0.1"
                value={limitesAmbientales.Ni_max}
                onChange={(e) => setLimitesAmbientales(prev => ({ ...prev, Ni_max: e.target.value }))}
                unit="mg/L"
                disabled={normativaSeleccionada !== 'personalizado'}
              />
              <Input
                label="Hierro Máximo"
                type="number"
                step="0.1"
                value={limitesAmbientales.Fe_max}
                onChange={(e) => setLimitesAmbientales(prev => ({ ...prev, Fe_max: e.target.value }))}
                unit="mg/L"
                hint="Límite interno (no regulado explícitamente)"
                disabled={normativaSeleccionada !== 'personalizado'}
              />
              <Input
                label="Cobre Máximo"
                type="number"
                step="0.1"
                value={limitesAmbientales.Cu_max}
                onChange={(e) => setLimitesAmbientales(prev => ({ ...prev, Cu_max: e.target.value }))}
                unit="mg/L"
                disabled={normativaSeleccionada !== 'personalizado'}
              />
              <Input
                label="Zinc Máximo"
                type="number"
                step="0.1"
                value={limitesAmbientales.Zn_max}
                onChange={(e) => setLimitesAmbientales(prev => ({ ...prev, Zn_max: e.target.value }))}
                unit="mg/L"
                disabled={normativaSeleccionada !== 'personalizado'}
              />
            </div>
          </InfoCard>

          {/* Especificaciones de Calidad */}
          <InfoCard
            title="Especificaciones Grado Batería"
            icon={<Gauge className="w-5 h-5" />}
          >
            {/* Selector de grado */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(Object.keys(GRADOS_BATERIA) as GradoBateriaKey[]).map((key) => {
                const grado = GRADOS_BATERIA[key]
                const isSelected = gradoSeleccionado === key
                return (
                  <button
                    key={key}
                    onClick={() => handleGradoChange(key)}
                    className={`p-2 rounded-lg border text-center transition-all text-sm ${
                      isSelected
                        ? 'border-nickel-500 bg-nickel-600/20 text-nickel-400'
                        : 'border-industrial-600/50 bg-industrial-800/30 text-industrial-400 hover:border-industrial-500/50'
                    }`}
                  >
                    <div className="font-medium">{key === 'estandar' ? 'Estándar' : key === 'premium' ? 'Premium' : 'Personal'}</div>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-industrial-500 mb-4">
              {GRADOS_BATERIA[gradoSeleccionado].descripcion}
            </p>
            {gradoSeleccionado !== 'personalizado' && (
              <p className="text-xs text-amber-400/70 mb-4">
                💡 Selecciona "Personal" para editar estos valores
              </p>
            )}
            <div className="space-y-4">
              <Input
                label="Níquel Mínimo"
                type="number"
                step="0.1"
                value={especificacionesCalidad.Ni_min}
                onChange={(e) => setEspecificacionesCalidad(prev => ({ ...prev, Ni_min: e.target.value }))}
                unit="%"
                disabled={gradoSeleccionado !== 'personalizado'}
              />
              <Input
                label="Hierro Máximo"
                type="number"
                step="1"
                value={especificacionesCalidad.Fe_max}
                onChange={(e) => setEspecificacionesCalidad(prev => ({ ...prev, Fe_max: e.target.value }))}
                unit="ppm"
                disabled={gradoSeleccionado !== 'personalizado'}
              />
              <Input
                label="Cobre Máximo"
                type="number"
                step="1"
                value={especificacionesCalidad.Cu_max}
                onChange={(e) => setEspecificacionesCalidad(prev => ({ ...prev, Cu_max: e.target.value }))}
                unit="ppm"
                disabled={gradoSeleccionado !== 'personalizado'}
              />
              <Input
                label="Zinc Máximo"
                type="number"
                step="1"
                value={especificacionesCalidad.Zn_max}
                onChange={(e) => setEspecificacionesCalidad(prev => ({ ...prev, Zn_max: e.target.value }))}
                unit="ppm"
                disabled={gradoSeleccionado !== 'personalizado'}
              />
              <Input
                label="Humedad Máxima"
                type="number"
                step="0.1"
                value={especificacionesCalidad.Humedad_max}
                onChange={(e) => setEspecificacionesCalidad(prev => ({ ...prev, Humedad_max: e.target.value }))}
                unit="%"
                disabled={gradoSeleccionado !== 'personalizado'}
              />
            </div>
          </InfoCard>

          {/* Rangos Óptimos de Proceso */}
          <InfoCard
            title="Rangos Óptimos de Proceso"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            <p className="text-sm text-industrial-400 mb-4">
              Rangos para indicadores de semáforo (verde)
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="pH Mínimo Reactor"
                  type="number"
                  step="0.1"
                  value={rangosOptimos.pH_min}
                  onChange={(e) => setRangosOptimos(prev => ({ ...prev, pH_min: e.target.value }))}
                />
                <Input
                  label="pH Máximo Reactor"
                  type="number"
                  step="0.1"
                  value={rangosOptimos.pH_max}
                  onChange={(e) => setRangosOptimos(prev => ({ ...prev, pH_max: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Temp. Mínima"
                  type="number"
                  step="1"
                  value={rangosOptimos.temp_min}
                  onChange={(e) => setRangosOptimos(prev => ({ ...prev, temp_min: e.target.value }))}
                  unit="°C"
                />
                <Input
                  label="Temp. Máxima"
                  type="number"
                  step="1"
                  value={rangosOptimos.temp_max}
                  onChange={(e) => setRangosOptimos(prev => ({ ...prev, temp_max: e.target.value }))}
                  unit="°C"
                />
              </div>
              <Input
                label="Rendimiento Mínimo"
                type="number"
                step="1"
                value={rangosOptimos.rendimiento_min}
                onChange={(e) => setRangosOptimos(prev => ({ ...prev, rendimiento_min: e.target.value }))}
                unit="%"
              />
              <Input
                label="Recuperación Mínima"
                type="number"
                step="1"
                value={rangosOptimos.recuperacion_min}
                onChange={(e) => setRangosOptimos(prev => ({ ...prev, recuperacion_min: e.target.value }))}
                unit="%"
              />
            </div>
          </InfoCard>

        </div>

        {/* Tabla resumen de límites */}
        <Card className="mt-6 p-6" variant="gradient">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-nickel-400" />
            Comparación de Límites por Normativa
          </h3>
          <div className="overflow-x-auto">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>DS 609 (Alcantarillado)</th>
                  <th>DS 90 (Aguas Superficiales)</th>
                  <th className="text-nickel-400">Tu Configuración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>pH</td>
                  <td>5.5 - 9.0</td>
                  <td>6.0 - 8.5</td>
                  <td className="text-nickel-400 font-mono">{limitesAmbientales.pH_min} - {limitesAmbientales.pH_max}</td>
                </tr>
                <tr>
                  <td>Níquel (Ni)</td>
                  <td>≤ 4.0 mg/L</td>
                  <td>≤ 0.2 mg/L</td>
                  <td className="text-nickel-400 font-mono">≤ {limitesAmbientales.Ni_max} mg/L</td>
                </tr>
                <tr>
                  <td>Cobre (Cu)</td>
                  <td>≤ 3.0 mg/L</td>
                  <td>≤ 1.0 mg/L</td>
                  <td className="text-nickel-400 font-mono">≤ {limitesAmbientales.Cu_max} mg/L</td>
                </tr>
                <tr>
                  <td>Zinc (Zn)</td>
                  <td>≤ 5.0 mg/L</td>
                  <td>≤ 3.0 mg/L</td>
                  <td className="text-nickel-400 font-mono">≤ {limitesAmbientales.Zn_max} mg/L</td>
                </tr>
                <tr>
                  <td>Hierro (Fe)</td>
                  <td className="text-industrial-500">No regulado</td>
                  <td className="text-industrial-500">No regulado</td>
                  <td className="text-nickel-400 font-mono">≤ {limitesAmbientales.Fe_max} mg/L *</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-industrial-500 mt-3">
            * Límite interno de buenas prácticas, no exigido por normativa
          </p>
        </Card>

      </ContentSection>
    </DashboardLayout>
  )
}
