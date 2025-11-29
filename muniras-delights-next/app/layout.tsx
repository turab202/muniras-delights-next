import { Inter, Dancing_Script } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing-script',
})

// Add this metadata export
export const metadata = {
  title: "Munira's Delights",
  description: "Baking Happiness for Every Occasion",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dancingScript.variable} ${inter.className} bg-background text-gray-800`}>
        {children}
      </body>
    </html>
  )
}