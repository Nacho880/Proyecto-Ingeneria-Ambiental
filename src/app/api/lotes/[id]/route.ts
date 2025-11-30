import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un lote específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lote = await prisma.lote.findUnique({
      where: { id: params.id },
      include: {
        datosProceso: {
          orderBy: { timestamp: 'desc' },
        },
        datosCalidad: {
          orderBy: { timestamp: 'desc' },
        },
        datosAmbientales: {
          orderBy: { timestamp: 'desc' },
        },
        calculos: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!lote) {
      return NextResponse.json(
        { success: false, error: 'Lote no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: lote })
  } catch (error) {
    console.error('Error obteniendo lote:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo lote' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un lote
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { estado, fechaCierre } = body

    const lote = await prisma.lote.update({
      where: { id: params.id },
      data: {
        estado,
        fechaCierre: fechaCierre ? new Date(fechaCierre) : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: lote })
  } catch (error) {
    console.error('Error actualizando lote:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando lote' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un lote
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lote.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Lote eliminado' })
  } catch (error) {
    console.error('Error eliminando lote:', error)
    return NextResponse.json(
      { success: false, error: 'Error eliminando lote' },
      { status: 500 }
    )
  }
}


