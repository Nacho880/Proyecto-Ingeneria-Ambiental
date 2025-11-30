import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener estadísticas generales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'mes' // dia, semana, mes, año

    // Calcular fecha de inicio según el período
    const now = new Date()
    let startDate = new Date()
    
    switch (periodo) {
      case 'dia':
        startDate.setDate(now.getDate() - 1)
        break
      case 'semana':
        startDate.setDate(now.getDate() - 7)
        break
      case 'mes':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'año':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Obtener estadísticas de lotes
    const [totalLotes, lotesAprobados, lotesRechazados, lotesEnProceso] = await Promise.all([
      prisma.lote.count({
        where: { fechaCreacion: { gte: startDate } },
      }),
      prisma.lote.count({
        where: { fechaCreacion: { gte: startDate }, estado: 'aprobado' },
      }),
      prisma.lote.count({
        where: { fechaCreacion: { gte: startDate }, estado: 'rechazado' },
      }),
      prisma.lote.count({
        where: { fechaCreacion: { gte: startDate }, estado: 'en_proceso' },
      }),
    ])

    // Obtener promedios de KPIs
    const calculos = await prisma.calculo.findMany({
      where: {
        lote: {
          fechaCreacion: { gte: startDate },
        },
      },
      select: {
        rendimientoLixiviacion: true,
        recuperacionNi: true,
        consumoEspecificoAcido: true,
        indiceCircularidadAgua: true,
        purezaTotal: true,
        gradoBateria: true,
      },
    })

    const promedios = {
      rendimientoLixiviacion: 0,
      recuperacionNi: 0,
      consumoEspecificoAcido: 0,
      indiceCircularidadAgua: 0,
      purezaTotal: 0,
      tasaGradoBateria: 0,
    }

    if (calculos.length > 0) {
      const sum = calculos.reduce((acc, calc) => ({
        rendimientoLixiviacion: acc.rendimientoLixiviacion + (calc.rendimientoLixiviacion || 0),
        recuperacionNi: acc.recuperacionNi + (calc.recuperacionNi || 0),
        consumoEspecificoAcido: acc.consumoEspecificoAcido + (calc.consumoEspecificoAcido || 0),
        indiceCircularidadAgua: acc.indiceCircularidadAgua + (calc.indiceCircularidadAgua || 0),
        purezaTotal: acc.purezaTotal + (calc.purezaTotal || 0),
        gradoBateria: acc.gradoBateria + (calc.gradoBateria ? 1 : 0),
      }), {
        rendimientoLixiviacion: 0,
        recuperacionNi: 0,
        consumoEspecificoAcido: 0,
        indiceCircularidadAgua: 0,
        purezaTotal: 0,
        gradoBateria: 0,
      })

      promedios.rendimientoLixiviacion = sum.rendimientoLixiviacion / calculos.length
      promedios.recuperacionNi = sum.recuperacionNi / calculos.length
      promedios.consumoEspecificoAcido = sum.consumoEspecificoAcido / calculos.length
      promedios.indiceCircularidadAgua = sum.indiceCircularidadAgua / calculos.length
      promedios.purezaTotal = sum.purezaTotal / calculos.length
      promedios.tasaGradoBateria = (sum.gradoBateria / calculos.length) * 100
    }

    // Promedios de calidad
    const datosCalidad = await prisma.datoCalidad.findMany({
      where: {
        lote: {
          fechaCreacion: { gte: startDate },
        },
      },
      select: {
        porcentajeNi: true,
        impurezaFe: true,
        impurezaCu: true,
        impurezaZn: true,
        humedad: true,
      },
    })

    const promediosCalidad = {
      porcentajeNi: 0,
      impurezaFe: 0,
      impurezaCu: 0,
      impurezaZn: 0,
      humedad: 0,
    }

    if (datosCalidad.length > 0) {
      const sumCalidad = datosCalidad.reduce((acc, dato) => ({
        porcentajeNi: acc.porcentajeNi + dato.porcentajeNi,
        impurezaFe: acc.impurezaFe + dato.impurezaFe,
        impurezaCu: acc.impurezaCu + dato.impurezaCu,
        impurezaZn: acc.impurezaZn + dato.impurezaZn,
        humedad: acc.humedad + dato.humedad,
      }), promediosCalidad)

      promediosCalidad.porcentajeNi = sumCalidad.porcentajeNi / datosCalidad.length
      promediosCalidad.impurezaFe = sumCalidad.impurezaFe / datosCalidad.length
      promediosCalidad.impurezaCu = sumCalidad.impurezaCu / datosCalidad.length
      promediosCalidad.impurezaZn = sumCalidad.impurezaZn / datosCalidad.length
      promediosCalidad.humedad = sumCalidad.humedad / datosCalidad.length
    }

    // Promedios ambientales
    const datosAmbientales = await prisma.datoAmbiental.findMany({
      where: {
        lote: {
          fechaCreacion: { gte: startDate },
        },
      },
      select: {
        phEfluente: true,
        niEfluente: true,
        caudalEfluente: true,
        aguaRecirculada: true,
        aguaFresca: true,
      },
    })

    const promediosAmbientales = {
      phEfluente: 0,
      niEfluente: 0,
      caudalEfluente: 0,
      aguaRecirculada: 0,
      aguaFresca: 0,
    }

    if (datosAmbientales.length > 0) {
      const sumAmbiental = datosAmbientales.reduce((acc, dato) => ({
        phEfluente: acc.phEfluente + dato.phEfluente,
        niEfluente: acc.niEfluente + dato.niEfluente,
        caudalEfluente: acc.caudalEfluente + dato.caudalEfluente,
        aguaRecirculada: acc.aguaRecirculada + dato.aguaRecirculada,
        aguaFresca: acc.aguaFresca + dato.aguaFresca,
      }), promediosAmbientales)

      promediosAmbientales.phEfluente = sumAmbiental.phEfluente / datosAmbientales.length
      promediosAmbientales.niEfluente = sumAmbiental.niEfluente / datosAmbientales.length
      promediosAmbientales.caudalEfluente = sumAmbiental.caudalEfluente / datosAmbientales.length
      promediosAmbientales.aguaRecirculada = sumAmbiental.aguaRecirculada / datosAmbientales.length
      promediosAmbientales.aguaFresca = sumAmbiental.aguaFresca / datosAmbientales.length
    }

    return NextResponse.json({
      success: true,
      data: {
        periodo,
        fechaInicio: startDate.toISOString(),
        fechaFin: now.toISOString(),
        lotes: {
          total: totalLotes,
          aprobados: lotesAprobados,
          rechazados: lotesRechazados,
          enProceso: lotesEnProceso,
          tasaAprobacion: totalLotes > 0 ? (lotesAprobados / totalLotes) * 100 : 0,
        },
        kpis: promedios,
        calidad: promediosCalidad,
        ambiental: promediosAmbientales,
      },
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo estadísticas' },
      { status: 500 }
    )
  }
}


