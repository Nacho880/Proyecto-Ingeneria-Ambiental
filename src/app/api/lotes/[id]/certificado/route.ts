import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Generar certificado PDF del lote
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lote = await prisma.lote.findUnique({
      where: { id: params.id },
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
    })

    if (!lote) {
      return NextResponse.json(
        { success: false, error: 'Lote no encontrado' },
        { status: 404 }
      )
    }

    // Generar HTML del certificado para conversión a PDF
    // En una implementación real, usaríamos jsPDF o puppeteer
    const proceso = lote.datosProceso[0]
    const calidad = lote.datosCalidad[0]
    const ambiental = lote.datosAmbientales[0]
    const kpis = lote.calculos[0]

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificado ${lote.numeroLote}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #4caf50; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #4caf50; }
    .title { font-size: 28px; margin: 10px 0; }
    .lote-number { font-size: 20px; color: #666; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; color: #4caf50; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .item { padding: 10px; background: #f5f5f5; border-radius: 4px; }
    .item-label { font-size: 12px; color: #666; }
    .item-value { font-size: 18px; font-weight: bold; }
    .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .status-aprobado { background: #e8f5e9; color: #2e7d32; }
    .status-rechazado { background: #ffebee; color: #c62828; }
    .status-proceso { background: #fff3e0; color: #ef6c00; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NiSO₄</div>
    <div class="title">CERTIFICADO DE ANÁLISIS</div>
    <div class="lote-number">${lote.numeroLote}</div>
    <div class="status status-${lote.estado}">
      ${lote.estado === 'aprobado' ? 'APROBADO' : lote.estado === 'rechazado' ? 'RECHAZADO' : 'EN PROCESO'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">INFORMACIÓN GENERAL</div>
    <div class="grid">
      <div class="item">
        <div class="item-label">Fecha de Creación</div>
        <div class="item-value">${new Date(lote.fechaCreacion).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div class="item">
        <div class="item-label">Fecha de Cierre</div>
        <div class="item-value">${lote.fechaCierre ? new Date(lote.fechaCierre).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
      </div>
      <div class="item">
        <div class="item-label">Grado</div>
        <div class="item-value">${kpis?.gradoBateria ? 'Batería' : 'Estándar'}</div>
      </div>
    </div>
  </div>

  ${proceso ? `
  <div class="section">
    <div class="section-title">DATOS DE PROCESO</div>
    <div class="grid">
      <div class="item">
        <div class="item-label">pH Reactor</div>
        <div class="item-value">${proceso.phReactor.toFixed(2)}</div>
      </div>
      <div class="item">
        <div class="item-label">Temperatura</div>
        <div class="item-value">${proceso.temperaturaReactor.toFixed(1)} °C</div>
      </div>
      <div class="item">
        <div class="item-label">Masa Concentrado</div>
        <div class="item-value">${proceso.masaConcentrado.toFixed(0)} kg</div>
      </div>
      <div class="item">
        <div class="item-label">Volumen Solución</div>
        <div class="item-value">${proceso.volumenSolucion.toFixed(0)} L</div>
      </div>
      <div class="item">
        <div class="item-label">Ácido Sulfúrico</div>
        <div class="item-value">${proceso.acidoSulfurico.toFixed(1)} kg</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${calidad ? `
  <div class="section">
    <div class="section-title">ANÁLISIS DE CALIDAD</div>
    <div class="grid">
      <div class="item">
        <div class="item-label">Níquel (%)</div>
        <div class="item-value">${calidad.porcentajeNi.toFixed(2)}%</div>
      </div>
      <div class="item">
        <div class="item-label">Hierro (ppm)</div>
        <div class="item-value">${calidad.impurezaFe.toFixed(1)}</div>
      </div>
      <div class="item">
        <div class="item-label">Cobre (ppm)</div>
        <div class="item-value">${calidad.impurezaCu.toFixed(1)}</div>
      </div>
      <div class="item">
        <div class="item-label">Zinc (ppm)</div>
        <div class="item-value">${calidad.impurezaZn.toFixed(1)}</div>
      </div>
      <div class="item">
        <div class="item-label">Humedad (%)</div>
        <div class="item-value">${calidad.humedad.toFixed(2)}%</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${kpis ? `
  <div class="section">
    <div class="section-title">KPIs CALCULADOS</div>
    <div class="grid">
      <div class="item">
        <div class="item-label">Rendimiento Lixiviación</div>
        <div class="item-value">${kpis.rendimientoLixiviacion?.toFixed(1)}%</div>
      </div>
      <div class="item">
        <div class="item-label">Recuperación Ni</div>
        <div class="item-value">${kpis.recuperacionNi?.toFixed(1)}%</div>
      </div>
      <div class="item">
        <div class="item-label">Consumo Ácido</div>
        <div class="item-value">${kpis.consumoEspecificoAcido?.toFixed(0)} kg/t</div>
      </div>
      <div class="item">
        <div class="item-label">Circularidad Agua</div>
        <div class="item-value">${kpis.indiceCircularidadAgua?.toFixed(1)}%</div>
      </div>
      <div class="item">
        <div class="item-label">Pureza Total</div>
        <div class="item-value">${kpis.purezaTotal?.toFixed(2)}%</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${ambiental ? `
  <div class="section">
    <div class="section-title">DATOS AMBIENTALES</div>
    <div class="grid">
      <div class="item">
        <div class="item-label">pH Efluente</div>
        <div class="item-value">${ambiental.phEfluente.toFixed(2)}</div>
      </div>
      <div class="item">
        <div class="item-label">Ni en Efluente</div>
        <div class="item-value">${ambiental.niEfluente.toFixed(2)} mg/L</div>
      </div>
      <div class="item">
        <div class="item-label">Caudal Efluente</div>
        <div class="item-value">${ambiental.caudalEfluente.toFixed(1)} m³/día</div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Este certificado fue generado automáticamente por el Sistema NiSO₄</p>
    <p>Fecha de generación: ${new Date().toLocaleString('es')}</p>
  </div>
</body>
</html>
    `

    // Devolver HTML como PDF (en producción usaríamos puppeteer o similar)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="certificado-${lote.numeroLote}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generando certificado:', error)
    return NextResponse.json(
      { success: false, error: 'Error generando certificado' },
      { status: 500 }
    )
  }
}


