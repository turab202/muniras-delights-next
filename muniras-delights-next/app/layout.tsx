'use client'

import { Inter, Dancing_Script } from 'next/font/google'
import './globals.css'
import { useState } from 'react'
import { Language } from './types'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing-script',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [lang, setLang] = useState<Language>('en')

  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${dancingScript.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}