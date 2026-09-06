# NiSO₄ - Sistema de Monitoreo de Lixiviación de Sulfato de Níquel

Sistema de dashboard industrial para monitoreo ambiental y de calidad del proceso de lixiviación de níquel para producción de sulfato de níquel grado batería.

![Dashboard Preview](https://via.placeholder.com/800x400/0a1929/4caf50?text=NiSO₄+Dashboard)

## 🚀 Características

### Panel de Proceso
- Monitoreo en tiempo real de pH, temperatura, presión
- Gráficos de tendencia con actualización automática
- Semáforos de estado (verde/amarillo/rojo)
- Control de parámetros operativos

### Panel de Calidad (QC)
- Análisis de % Níquel e impurezas
- Clasificación automática grado batería vs estándar
- Estado de lotes (aprobado/rechazado)
- Tendencias históricas de calidad

### Panel Ambiental
- pH y metales en efluente vs límites legales
- Índice de circularidad del agua
- Consumo de recursos (agua, ácido, energía)
- Carga contaminante descargada

### Panel de Trazabilidad
- Historial completo de todos los lotes
- Búsqueda y filtrado avanzado
- Certificados descargables
- Auditoría de datos

### Cálculos Automáticos de KPIs
- Rendimiento de lixiviación (%)
- Recuperación de níquel (%)
- Consumo específico de ácido (kg/t)
- Consumo de agua (m³/t)
- Índice de circularidad del agua (%)
- Carga contaminante del efluente (kg Ni/día)

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm o yarn

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la base de datos**
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push

# (Opcional) Cargar datos de ejemplo
npm run db:seed
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   │   ├── lotes/     # CRUD de lotes
│   │   │   └── estadisticas/
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── nuevo-lote/    # Formulario de registro
│   │   ├── proceso/       # Panel de proceso
│   │   ├── calidad/       # Panel de calidad
│   │   ├── ambiental/     # Panel ambiental
│   │   ├── trazabilidad/  # Historial de lotes
│   │   ├── reportes/      # Análisis y KPIs
│   │   └── configuracion/ # Ajustes del sistema
│   ├── components/
│   │   ├── ui/            # Componentes reutilizables
│   │   │   ├── Card.tsx
│   │   │   ├── Charts.tsx
│   │   │   ├── Form.tsx
│   │   │   └── StatusLight.tsx
│   │   └── layout/        # Layout del dashboard
│   │       ├── Sidebar.tsx
│   │       └── DashboardLayout.tsx
│   └── lib/
│       ├── prisma.ts      # Cliente de base de datos
│       └── calculos.ts    # Lógica de KPIs
└── package.json
```

## 🔧 Configuración

### Variables de Entorno (opcional)

Crear un archivo `.env` en la raíz:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### Límites Configurables

Los límites ambientales y de calidad se pueden ajustar desde:
- **Panel de Configuración** en la aplicación
- **Base de datos** en las tablas `LimiteAmbiental` y `EspecificacionCalidad`

## 📊 API Endpoints

### Lotes
- `GET /api/lotes` - Listar todos los lotes
- `POST /api/lotes` - Crear nuevo lote
- `GET /api/lotes/[id]` - Obtener lote específico
- `PUT /api/lotes/[id]` - Actualizar lote
- `DELETE /api/lotes/[id]` - Eliminar lote
- `GET /api/lotes/[id]/certificado` - Descargar certificado

### Estadísticas
- `GET /api/estadisticas?periodo=mes` - Obtener KPIs del período

## 🧮 Fórmulas de Cálculo

### Rendimiento de Lixiviación
```
Rendimiento (%) = (Ni recuperado / Ni en concentrado) × 100
```

### Consumo Específico de Ácido
```
Consumo (kg/t) = Ácido sulfúrico (kg) / Masa concentrado (t)
```

### Índice de Circularidad del Agua
```
Circularidad (%) = (Agua recirculada / Agua total) × 100
```

### Carga Contaminante
```
Carga (kg/día) = Concentración (mg/L) × Caudal (m³/día) / 1000
```

## 🎨 Personalización

### Colores del Tema
Editar `tailwind.config.ts` para modificar la paleta de colores:

```typescript
colors: {
  industrial: { ... },
  nickel: { ... },
  sulfur: { ... },
}
```

### Límites de Semáforo
Editar `src/lib/calculos.ts`:

```typescript
export const RANGOS_SEMAFORO = {
  phReactor: { verde: { min: 1.3, max: 2.0 }, ... },
  temperatura: { verde: { min: 80, max: 90 }, ... },
  // ...
}
```

## 📱 Responsive

El dashboard es completamente responsivo:
- **Desktop**: Sidebar fijo + contenido principal
- **Tablet**: Sidebar colapsable
- **Móvil**: Menú hamburguesa + cards apiladas

## 🔒 Seguridad

Para producción, considerar:
1. Añadir autenticación (NextAuth.js)
2. Validación de entrada con Zod
3. Rate limiting en APIs
4. HTTPS obligatorio

## 📄 Licencia

MIT License - Proyecto para uso educativo y de demostración.

## 🤝 Soporte

Para preguntas o mejoras, crear un issue o contactar al equipo de desarrollo.

---

Desarrollado con ❤️ para la industria del níquel


