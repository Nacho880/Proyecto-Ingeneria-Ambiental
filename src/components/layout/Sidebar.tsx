'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  FlaskConical,
  Leaf,
  FileCheck,
  Settings,
  LayoutDashboard,
  PlusCircle,
  Database,
  BarChart3,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    name: 'Nuevo Lote',
    href: '/nuevo-lote',
    icon: PlusCircle,
    description: 'Registrar datos',
  },
  {
    name: 'Calidad',
    href: '/calidad',
    icon: FlaskConical,
    description: 'Control de calidad',
  },
  {
    name: 'Ambiental',
    href: '/ambiental',
    icon: Leaf,
    description: 'Gestión ambiental',
  },
  {
    name: 'Comparador',
    href: '/proceso',
    icon: Activity,
    description: 'Comparar lotes',
  },
  {
    name: 'Registro',
    href: '/trazabilidad',
    icon: FileCheck,
    description: 'Historial de lotes',
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: BarChart3,
    description: 'KPIs y métricas',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-industrial-900/80 backdrop-blur-xl border-r border-industrial-700/50 flex flex-col z-50">
      {/* Logo y título */}
      <div className="p-6 border-b border-industrial-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nickel-500 to-nickel-700 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-industrial tracking-wide">
              NiSO₄
            </h1>
            <p className="text-xs text-industrial-400">
              Monitoreo de Sulfato de Níquel
            </p>
          </div>
        </div>
      </div>
      
      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                group relative
                ${isActive 
                  ? 'bg-nickel-600/20 text-nickel-400' 
                  : 'text-industrial-300 hover:bg-industrial-800/50 hover:text-white'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-nickel-500 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-nickel-400' : 'text-industrial-500 group-hover:text-industrial-300'}`} />
              <div>
                <span className="font-medium block">{item.name}</span>
                <span className={`text-xs ${isActive ? 'text-nickel-400/70' : 'text-industrial-500'}`}>
                  {item.description}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-industrial-700/50">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-industrial-400 hover:bg-industrial-800/50 hover:text-white transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configuración</span>
        </Link>
        
      </div>
    </aside>
  )
}

export function MobileHeader() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  
  return (
    <>
      {/* Header móvil */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-industrial-900/90 backdrop-blur-xl border-b border-industrial-700/50 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nickel-500 to-nickel-700 flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">NiSO₄</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-industrial-800/50 text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>
      
      {/* Menú móvil */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-industrial-900/95 backdrop-blur-xl pt-16">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-nickel-600/20 text-nickel-400' 
                      : 'text-industrial-300 hover:bg-industrial-800/50'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <div>
                    <span className="font-medium block text-lg">{item.name}</span>
                    <span className="text-sm text-industrial-500">{item.description}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}


