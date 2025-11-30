import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.calculo.deleteMany()
  await prisma.datoAmbiental.deleteMany()
  await prisma.datoCalidad.deleteMany()
  await prisma.datoProceso.deleteMany()
  await prisma.lote.deleteMany()

  // ===== LOTE 1 - APROBADO (GRADO BATERÍA) - Enero 2025 =====
  const lote1 = await prisma.lote.create({
    data: {
      numeroLote: 'LOT-2025-001',
      estado: 'aprobado',
      fechaCreacion: new Date('2025-01-15T08:30:00'),
      fechaCierre: new Date('2025-01-15T16:45:00'),
      datosProceso: {
        create: {
          phReactor: 3.2,
          temperaturaReactor: 78,
          masaConcentrado: 1200,
          volumenSolucion: 5500,
          acidoSulfurico: 350,
        }
      },
      datosCalidad: {
        create: {
          porcentajeNi: 22.3,
          impurezaFe: 15,
          impurezaCu: 4,
          impurezaZn: 6,
          humedad: 0.8,
        }
      },
      datosAmbientales: {
        create: {
          phEfluente: 7.1,
          niEfluente: 1.2,
          feEfluente: 0.5,
          cuEfluente: 0.8,
          znEfluente: 1.5,
          caudalEfluente: 12,
          aguaRecirculada: 64,
          aguaFresca: 36,
        }
      },
      calculos: {
        create: {
          rendimientoLixiviacion: 92,
          recuperacionNi: 92,
          consumoEspecificoAcido: 290,
          consumoAgua: 4.6,
          indiceCircularidadAgua: 64,
          cargaContaminanteNi: 0.014,
          gradoBateria: true,
          cumplimientoGeneral: true,
        }
      }
    }
  })
  console.log('✅ Lote 1:', lote1.numeroLote, '- 15 Ene 2025 - APROBADO (Grado Batería)')

  // ===== LOTE 2 - RECHAZADO (EXCESO DE COBRE) - Marzo 2025 =====
  const lote2 = await prisma.lote.create({
    data: {
      numeroLote: 'LOT-2025-002',
      estado: 'rechazado',
      fechaCreacion: new Date('2025-03-08T09:15:00'),
      fechaCierre: new Date('2025-03-08T17:30:00'),
      datosProceso: {
        create: {
          phReactor: 3.5,
          temperaturaReactor: 75,
          masaConcentrado: 1050,
          volumenSolucion: 5200,
          acidoSulfurico: 310,
        }
      },
      datosCalidad: {
        create: {
          porcentajeNi: 22.1,
          impurezaFe: 12,
          impurezaCu: 14, // ❌ Excede límite de 10 ppm
          impurezaZn: 7,
          humedad: 1.1,
        }
      },
      datosAmbientales: {
        create: {
          phEfluente: 6.9,
          niEfluente: 0.9,
          feEfluente: 0.4,
          cuEfluente: 1.5,
          znEfluente: 1.2,
          caudalEfluente: 13,
          aguaRecirculada: 58,
          aguaFresca: 42,
        }
      },
      calculos: {
        create: {
          rendimientoLixiviacion: 89,
          recuperacionNi: 89,
          consumoEspecificoAcido: 295,
          consumoAgua: 5.0,
          indiceCircularidadAgua: 58,
          cargaContaminanteNi: 0.012,
          gradoBateria: false,
          cumplimientoGeneral: true,
        }
      }
    }
  })
  console.log('❌ Lote 2:', lote2.numeroLote, '- 08 Mar 2025 - RECHAZADO (Cu = 14 ppm)')

  // ===== LOTE 3 - APROBADO (EN EL LÍMITE) - Mayo 2025 =====
  const lote3 = await prisma.lote.create({
    data: {
      numeroLote: 'LOT-2025-003',
      estado: 'aprobado',
      fechaCreacion: new Date('2025-05-22T07:00:00'),
      fechaCierre: new Date('2025-05-22T15:20:00'),
      datosProceso: {
        create: {
          phReactor: 3.1,
          temperaturaReactor: 80,
          masaConcentrado: 1300,
          volumenSolucion: 6000,
          acidoSulfurico: 365,
        }
      },
      datosCalidad: {
        create: {
          porcentajeNi: 22.4,
          impurezaFe: 20, // En el límite máximo
          impurezaCu: 9,
          impurezaZn: 9,
          humedad: 0.9,
        }
      },
      datosAmbientales: {
        create: {
          phEfluente: 7.4,
          niEfluente: 1.7,
          feEfluente: 0.6,
          cuEfluente: 1.0,
          znEfluente: 1.9,
          caudalEfluente: 14,
          aguaRecirculada: 62,
          aguaFresca: 38,
        }
      },
      calculos: {
        create: {
          rendimientoLixiviacion: 90,
          recuperacionNi: 90,
          consumoEspecificoAcido: 280,
          consumoAgua: 4.6,
          indiceCircularidadAgua: 62,
          cargaContaminanteNi: 0.024,
          gradoBateria: false, // Fe muy alto para grado batería
          cumplimientoGeneral: true,
        }
      }
    }
  })
  console.log('🟡 Lote 3:', lote3.numeroLote, '- 22 May 2025 - APROBADO (Grado Estándar)')

  // ===== LOTE 4 - RECHAZADO (EFLUENTE FUERA DE NORMA) - Agosto 2025 =====
  const lote4 = await prisma.lote.create({
    data: {
      numeroLote: 'LOT-2025-004',
      estado: 'rechazado',
      fechaCreacion: new Date('2025-08-10T10:00:00'),
      fechaCierre: new Date('2025-08-10T18:15:00'),
      datosProceso: {
        create: {
          phReactor: 3.4,
          temperaturaReactor: 76,
          masaConcentrado: 1100,
          volumenSolucion: 5300,
          acidoSulfurico: 330,
        }
      },
      datosCalidad: {
        create: {
          porcentajeNi: 22.0,
          impurezaFe: 13,
          impurezaCu: 6,
          impurezaZn: 8,
          humedad: 1.0,
        }
      },
      datosAmbientales: {
        create: {
          phEfluente: 4.8, // ❌ Bajo - norma exige ≥ 5.5
          niEfluente: 3.8,
          feEfluente: 0.8,
          cuEfluente: 2.9,
          znEfluente: 5.2, // ❌ Supera límite de 5 mg/L
          caudalEfluente: 12,
          aguaRecirculada: 54,
          aguaFresca: 46,
        }
      },
      calculos: {
        create: {
          rendimientoLixiviacion: 88,
          recuperacionNi: 88,
          consumoEspecificoAcido: 300,
          consumoAgua: 4.8,
          indiceCircularidadAgua: 54,
          cargaContaminanteNi: 0.046,
          gradoBateria: false,
          cumplimientoGeneral: false, // ❌ No cumple norma ambiental
        }
      }
    }
  })
  console.log('❌ Lote 4:', lote4.numeroLote, '- 10 Ago 2025 - RECHAZADO (efluente fuera de norma)')

  // ===== LOTE 5 - APROBADO (ALTA EFICIENCIA) - Noviembre 2025 =====
  const lote5 = await prisma.lote.create({
    data: {
      numeroLote: 'LOT-2025-005',
      estado: 'aprobado',
      fechaCreacion: new Date('2025-11-28T08:00:00'),
      fechaCierre: new Date('2025-11-28T16:30:00'),
      datosProceso: {
        create: {
          phReactor: 3.0,
          temperaturaReactor: 82,
          masaConcentrado: 1450,
          volumenSolucion: 6200,
          acidoSulfurico: 380,
        }
      },
      datosCalidad: {
        create: {
          porcentajeNi: 22.6,
          impurezaFe: 10,
          impurezaCu: 3,
          impurezaZn: 5,
          humedad: 0.7,
        }
      },
      datosAmbientales: {
        create: {
          phEfluente: 7.3,
          niEfluente: 1.0,
          feEfluente: 0.3,
          cuEfluente: 0.6,
          znEfluente: 1.6,
          caudalEfluente: 15,
          aguaRecirculada: 68,
          aguaFresca: 32,
        }
      },
      calculos: {
        create: {
          rendimientoLixiviacion: 94,
          recuperacionNi: 94,
          consumoEspecificoAcido: 260,
          consumoAgua: 4.3,
          indiceCircularidadAgua: 68,
          cargaContaminanteNi: 0.015,
          gradoBateria: true,
          cumplimientoGeneral: true,
        }
      }
    }
  })
  console.log('✅ Lote 5:', lote5.numeroLote, '- 28 Nov 2025 - APROBADO (Grado Batería)')

  console.log('')
  console.log('🎉 Seed completado!')
  console.log('   - 3 lotes aprobados (2 grado batería, 1 estándar)')
  console.log('   - 2 lotes rechazados')
  console.log('   - Fechas: Enero, Marzo, Mayo, Agosto, Noviembre 2025')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
