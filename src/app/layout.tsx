import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Monitoreo',
  description: 'Dashboard industrial para monitoreo ambiental y de calidad del proceso de lixiviación de níquel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-grid-pattern min-h-screen">
        {children}
      </body>
    </html>
  )
}


