import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularTodosLosKPIs } from '@/lib/calculos'

// GET - Obtener todos los lotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const limite = searchParams.get('limite')

    const where = estado && estado !== 'todos' ? { estado } : {}

    const lotes = await prisma.lote.findMany({
      where,
      include: {
        datosProceso: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        datosCalidad: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        datosAmbientales: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        calculos: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
      take: limite ? parseInt(limite) : undefined,
    })

    return NextResponse.json({ success: true, data: lotes })
  } catch (error) {
    console.error('Error obteniendo lotes:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo lotes' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo lote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proceso, calidad, ambiental, kpis } = body

    // Generar número de lote
    const year = new Date().getFullYear()
    const countLotes = await prisma.lote.count({
      where: {
        numeroLote: {
          startsWith: `LOT-${year}`,
        },
      },
    })
    const numeroLote = `LOT-${year}-${String(countLotes + 1).padStart(3, '0')}`

    // Determinar estado del lote basado en KPIs
    let estado = 'en_proceso'
    if (kpis) {
      if (kpis.cumplimientoPH && kpis.cumplimientoMetales && kpis.gradoBateria) {
        estado = 'aprobado'
      } else if (!kpis.cumplimientoPH || !kpis.cumplimientoMetales) {
        estado = 'rechazado'
      }
    }

    // Crear lote con todos los datos relacionados
    const lote = await prisma.lote.create({
      data: {
        numeroLote,
        estado,
        fechaCierre: estado !== 'en_proceso' ? new Date() : null,
        datosProceso: proceso ? {
          create: {
            phReactor: proceso.phReactor,
            temperaturaReactor: proceso.temperaturaReactor,
            masaConcentrado: proceso.masaConcentrado,
            volumenSolucion: proceso.volumenSolucion,
            acidoSulfurico: proceso.acidoSulfurico,
          },
        } : undefined,
        datosCalidad: calidad ? {
          create: {
            porcentajeNi: calidad.porcentajeNi,
            impurezaFe: calidad.impurezaFe,
            impurezaCu: calidad.impurezaCu,
            impurezaZn: calidad.impurezaZn,
            humedad: calidad.humedad,
          },
        } : undefined,
        datosAmbientales: ambiental ? {
          create: {
            phEfluente: ambiental.phEfluente,
            niEfluente: ambiental.niEfluente,
            feEfluente: ambiental.feEfluente,
            cuEfluente: ambiental.cuEfluente,
            znEfluente: ambiental.znEfluente,
            caudalEfluente: ambiental.caudalEfluente,
            aguaRecirculada: ambiental.aguaRecirculada,
            aguaFresca: ambiental.aguaFresca,
          },
        } : undefined,
        calculos: kpis ? {
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
            cumplimientoGeneral: kpis.cumplimientoGeneral,
          },
        } : undefined,
      },
      include: {
        datosProceso: true,
        datosCalidad: true,
        datosAmbientales: true,
        calculos: true,
      },
    })

    return NextResponse.json({ success: true, data: lote }, { status: 201 })
  } catch (error) {
    console.error('Error creando lote:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando lote' },
      { status: 500 }
    )
  }
}


