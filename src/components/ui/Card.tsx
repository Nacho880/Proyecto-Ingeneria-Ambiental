'use client'

import React from 'react'
import { StatusLight } from './StatusLight'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-industrial-800/60 backdrop-blur-sm border border-industrial-600/30',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10',
    gradient: 'bg-gradient-to-br from-industrial-800/80 to-industrial-900/80 backdrop-blur-sm border border-industrial-600/20',
  }
  
  return (
    <div className={`rounded-xl shadow-industrial ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  icon?: React.ReactNode
  status?: 'verde' | 'amarillo' | 'rojo' | 'apagado'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  description?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  status,
  trend,
  description,
  className = '',
}: MetricCardProps) {
  return (
    <Card className={`p-6 ${className}`} variant="gradient">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-industrial-700/50 text-nickel-400">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-industrial-300 uppercase tracking-wider">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-industrial-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {status && <StatusLight status={status} size="md" />}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white font-mono tracking-tight">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && (
          <span className="text-lg text-industrial-400 font-medium">{unit}</span>
        )}
      </div>
      
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${
          trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value.toFixed(1)}%</span>
          <span className="text-industrial-500 ml-1">vs anterior</span>
        </div>
      )}
    </Card>
  )
}

interface InfoCardProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  headerAction?: React.ReactNode
  className?: string
}

export function InfoCard({ title, children, icon, headerAction, className = '' }: InfoCardProps) {
  return (
    <Card className={className} variant="gradient">
      <div className="flex items-center justify-between p-4 border-b border-industrial-600/30">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-industrial-700/50 text-nickel-400">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {headerAction}
      </div>
      <div className="p-4">
        {children}
      </div>
    </Card>
  )
}

interface StatRowProps {
  label: string
  value: string | number
  unit?: string
  status?: 'verde' | 'amarillo' | 'rojo'
}

export function StatRow({ label, value, unit, status }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-industrial-700/30 last:border-0">
      <span className="text-sm text-industrial-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold text-white">
          {typeof value === 'number' ? value.toFixed(2) : value}
          {unit && <span className="text-industrial-400 text-sm ml-1">{unit}</span>}
        </span>
        {status && <StatusLight status={status} size="sm" />}
      </div>
    </div>
  )
}


