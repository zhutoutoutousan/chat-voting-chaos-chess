import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider"
import Dock from '@/components/Dock'
import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/react"
import { AblyErrorBoundary } from '@/components/AblyErrorBoundary'

export const metadata: Metadata = {
  title: {
    default: 'Chaos Chess - The Most Unpredictable Chess Game',
    template: '%s | Chaos Chess'
  },
  description: 'Experience chess like never before with Chaos Chess. Random events, special powers, and unpredictable gameplay make every match exciting and unique.',
  keywords: ['chess game', 'chaos chess', 'multiplayer chess', 'online chess', 'chess variants', 'random chess', 'chess with powers'],
  authors: [{ name: 'Chaos Chess Team' }],
  openGraph: {
    title: 'Chaos Chess - The Most Unpredictable Chess Game',
    description: 'Experience chess like never before with random events and special powers. Join the chess revolution!',
    url: 'https://chaoschess.com',
    siteName: 'Chaos Chess',
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'Chaos Chess Preview'
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chaos Chess - The Most Unpredictable Chess Game',
    description: 'Experience chess like never before with random events and special powers. Join the chess revolution!',
    images: ['/og-image.jpg'], // Same image as OG
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://getlaunchlist.com/js/widget.js" defer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Chaos Chess",
              "applicationCategory": "GameApplication",
              "genre": "Chess",
              "description": "A revolutionary chess variant with random events and special powers",
              "offers": {
                "@type": "Offer",
                "availability": "ComingSoon"
              }
            })
          }}
        />
      </head>
      <body>
        <AblyErrorBoundary />
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            
            {/* Main content */}
            <main className="relative">
              {children}
            </main>
            
            {/* Dock with highest z-index */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <Dock />
            </div>
            
            <Analytics />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}