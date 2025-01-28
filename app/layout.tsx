import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider"
import Dock from '@/components/Dock'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://getlaunchlist.com/js/widget.js" defer />
      </head>
      <body>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Dock />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}