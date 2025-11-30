'use client'

import React from 'react'
import { Sidebar, MobileHeader } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-industrial-950">
      {/* Sidebar para desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Header móvil */}
      <MobileHeader />
      
      {/* Contenido principal */}
      <main className="lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: { label: string; href?: string }[]
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="bg-industrial-900/50 border-b border-industrial-700/30">
      <div className="px-6 py-6">
        {breadcrumb && (
          <nav className="flex items-center gap-2 text-sm text-industrial-400 mb-2">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <span className="text-industrial-600">/</span>}
                {item.href ? (
                  <a href={item.href} className="hover:text-nickel-400 transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-industrial-300">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-industrial tracking-wide">
              {title}
            </h1>
            {description && (
              <p className="text-industrial-400 mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ContentSectionProps {
  children: React.ReactNode
  className?: string
}

export function ContentSection({ children, className = '' }: ContentSectionProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}


