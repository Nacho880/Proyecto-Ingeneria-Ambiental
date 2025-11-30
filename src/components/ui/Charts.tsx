'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = {
  nickel: '#4caf50',
  sulfur: '#ffc107',
  copper: '#ff7043',
  zinc: '#78909c',
  primary: '#2196f3',
  secondary: '#9c27b0',
  grid: 'rgba(255,255,255,0.1)',
  text: '#90a4ae',
}

interface ChartDataPoint {
  name: string
  [key: string]: number | string
}

interface LineChartProps {
  data: ChartDataPoint[]
  lines: {
    dataKey: string
    color: string
    name: string
  }[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export function TrendLineChart({
  data,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        )}
        <XAxis
          dataKey="name"
          stroke={COLORS.text}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
        />
        <YAxis
          stroke={COLORS.text}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a3a52',
            border: '1px solid #334e68',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ color: COLORS.text }}
            iconType="circle"
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name={line.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface AreaChartProps {
  data: ChartDataPoint[]
  areas: {
    dataKey: string
    color: string
    name: string
  }[]
  height?: number
  stacked?: boolean
}

export function TrendAreaChart({
  data,
  areas,
  height = 300,
  stacked = false,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={COLORS.text}
          fontSize={12}
          tickLine={false}
        />
        <YAxis stroke={COLORS.text} fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a3a52',
            border: '1px solid #334e68',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend wrapperStyle={{ color: COLORS.text }} />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.color}
            fill={`url(#gradient-${area.dataKey})`}
            strokeWidth={2}
            name={area.name}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: ChartDataPoint[]
  bars: {
    dataKey: string
    color: string
    name: string
  }[]
  height?: number
  stacked?: boolean
}

export function ComparisonBarChart({
  data,
  bars,
  height = 300,
  stacked = false,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={COLORS.text}
          fontSize={12}
          tickLine={false}
        />
        <YAxis stroke={COLORS.text} fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a3a52',
            border: '1px solid #334e68',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend wrapperStyle={{ color: COLORS.text }} />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            name={bar.name}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

interface GaugeData {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: GaugeData[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  centerLabel?: string
  centerValue?: string
}

export function DonutChart({
  data,
  height = 250,
  innerRadius = 60,
  outerRadius = 80,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a3a52',
              border: '1px solid #334e68',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend
            wrapperStyle={{ color: COLORS.text }}
            formatter={(value) => <span className="text-industrial-200">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-2xl font-bold text-white">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-industrial-400">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Gauge semicircular para KPIs
interface GaugeProps {
  value: number
  min?: number
  max?: number
  label: string
  unit?: string
  thresholds?: {
    green: number
    yellow: number
  }
}

export function GaugeChart({ value, min = 0, max = 100, label, unit = '%', thresholds }: GaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100
  const rotation = (percentage / 100) * 180 - 90
  
  let color = COLORS.nickel
  if (thresholds) {
    if (value < thresholds.yellow) color = '#f44336'
    else if (value < thresholds.green) color = '#ff9800'
    else color = '#4caf50'
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background arc */}
        <div
          className="absolute w-32 h-32 rounded-full border-8 border-industrial-700"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        />
        {/* Value arc */}
        <div
          className="absolute w-32 h-32 rounded-full border-8 transition-transform duration-1000"
          style={{
            borderColor: color,
            clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
            transform: `rotate(${rotation - 90}deg)`,
            transformOrigin: 'center center',
          }}
        />
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-12 bg-white rounded-full origin-bottom transition-transform duration-1000"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="mt-4 text-center">
        <span className="text-2xl font-bold text-white font-mono">{value.toFixed(1)}</span>
        <span className="text-sm text-industrial-400 ml-1">{unit}</span>
      </div>
      <span className="text-xs text-industrial-400 mt-1">{label}</span>
    </div>
  )
}


