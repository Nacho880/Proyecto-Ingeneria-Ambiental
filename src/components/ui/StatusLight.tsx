'use client'

import React from 'react'

type StatusType = 'verde' | 'amarillo' | 'rojo' | 'apagado'

interface StatusLightProps {
  status: StatusType
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showLabel?: boolean
}

const statusColors: Record<StatusType, string> = {
  verde: 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]',
  amarillo: 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]',
  rojo: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
  apagado: 'bg-gray-600',
}

const statusLabels: Record<StatusType, string> = {
  verde: 'Normal',
  amarillo: 'Precaución',
  rojo: 'Alarma',
  apagado: 'Sin datos',
}

const sizes: Record<string, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function StatusLight({ status, size = 'md', label, showLabel = false }: StatusLightProps) {
  const displayLabel = label || statusLabels[status]
  
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizes[size]} 
          ${statusColors[status]} 
          rounded-full 
          ${status !== 'apagado' ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
        title={displayLabel}
      />
      {showLabel && (
        <span className={`text-sm font-medium ${
          status === 'verde' ? 'text-green-400' :
          status === 'amarillo' ? 'text-amber-400' :
          status === 'rojo' ? 'text-red-400' :
          'text-gray-500'
        }`}>
          {displayLabel}
        </span>
      )}
    </div>
  )
}

export function StatusBadge({ status, label }: { status: StatusType; label?: string }) {
  const displayLabel = label || statusLabels[status]
  
  const badgeColors: Record<StatusType, string> = {
    verde: 'bg-green-500/20 text-green-400 border-green-500/30',
    amarillo: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    rojo: 'bg-red-500/20 text-red-400 border-red-500/30',
    apagado: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  
  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border
      ${badgeColors[status]}
    `}>
      <StatusLight status={status} size="sm" />
      {displayLabel}
    </span>
  )
}


