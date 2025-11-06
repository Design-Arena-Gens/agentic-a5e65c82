import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Creator',
  description: 'Create videos with canvas animation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
