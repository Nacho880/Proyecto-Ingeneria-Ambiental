'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  unit?: string
  helpText?: string
}

export function Input({
  label,
  error,
  unit,
  helpText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-industrial-200 mb-2">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          className={`
            w-full px-4 py-3 bg-industrial-900/50 border rounded-lg text-white 
            placeholder-industrial-500 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-nickel-500/30
            ${error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-industrial-600/50 focus:border-nickel-500'
            }
            ${unit ? 'pr-16' : ''}
          `}
          {...props}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-industrial-400 font-medium">
            {unit}
          </span>
        )}
      </div>
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-industrial-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  error?: string
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-industrial-200 mb-2">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        className={`
          w-full px-4 py-3 bg-industrial-900/50 border rounded-lg text-white 
          appearance-none cursor-pointer transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-nickel-500/30
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-industrial-600/50 focus:border-nickel-500'
          }
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239fb3c8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
        }}
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-nickel-600 hover:bg-nickel-500 text-white shadow-lg hover:shadow-glow-green',
    secondary: 'bg-industrial-600 hover:bg-industrial-500 text-white border border-industrial-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'bg-transparent hover:bg-industrial-700/50 text-industrial-200 border border-industrial-600/50',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg 
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-industrial-600/30 pb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-industrial-400 mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}


