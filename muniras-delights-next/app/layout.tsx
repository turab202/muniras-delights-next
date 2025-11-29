// app/layout.tsx (Alternative - using CDN fonts like your React app)
import './globals.css'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-gray-800" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}