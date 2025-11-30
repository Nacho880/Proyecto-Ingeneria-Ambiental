import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Completar un lote con datos de calidad y ambientales
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { calidad, ambiental, kpis } = body

    // Verificar que el lote existe y está en proceso
    const lote = await prisma.lote.findUnique({
      where: { id: params.id },
    })

    if (!lote) {
      return NextResponse.json(
        { success: false, error: 'Lote no encontrado' },
        { status: 404 }
      )
    }

    if (lote.estado !== 'en_proceso') {
      return NextResponse.json(
        { success: false, error: 'El lote ya fue completado' },
        { status: 400 }
      )
    }

    // Determinar estado final
    const estado = kpis?.estadoLote || 'aprobado'

    // Actualizar lote con todos los datos
    const loteActualizado = await prisma.lote.update({
      where: { id: params.id },
      data: {
        estado,
        fechaCierre: new Date(),
        datosCalidad: {
          create: {
            porcentajeNi: calidad.porcentajeNi,
            impurezaFe: calidad.impurezaFe,
            impurezaCu: calidad.impurezaCu,
            impurezaZn: calidad.impurezaZn,
            humedad: calidad.humedad,
          },
        },
        datosAmbientales: {
          create: {
            phEfluente: ambiental.phEfluente,
            niEfluente: ambiental.niEfluente || 0,
            feEfluente: ambiental.feEfluente || 0,
            cuEfluente: ambiental.cuEfluente || 0,
            znEfluente: ambiental.znEfluente || 0,
            caudalEfluente: ambiental.caudalEfluente,
            aguaRecirculada: ambiental.aguaRecirculada,
            aguaFresca: ambiental.aguaFresca,
          },
        },
        calculos: {
          create: {
            rendimientoLixiviacion: kpis.rendimientoLixiviacion,
            recuperacionNi: kpis.recuperacionNi,
            consumoEspecificoAcido: kpis.consumoEspecificoAcido,
            consumoAgua: kpis.consumoAgua,
            indiceCircularidadAgua: kpis.indiceCircularidadAgua,
            cargaContaminanteNi: kpis.cargaContaminanteNi,
            purezaTotal: kpis.purezaTotal,
            gradoBateria: kpis.gradoBateria,
            cumplimientoPH: kpis.cumplimientoPH,
            cumplimientoMetales: kpis.cumplimientoMetales,
            cumplimientoGeneral: kpis.cumplimientoPH && kpis.cumplimientoMetales,
          },
        },
      },
      include: {
        datosProceso: true,
        datosCalidad: true,
        datosAmbientales: true,
        calculos: true,
      },
    })

    return NextResponse.json({ success: true, data: loteActualizado })
  } catch (error) {
    console.error('Error completando lote:', error)
    return NextResponse.json(
      { success: false, error: 'Error completando lote' },
      { status: 500 }
    )
  }
}

