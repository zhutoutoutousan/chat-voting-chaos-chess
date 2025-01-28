"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        routing="hash"
        appearance={{
          baseTheme: theme === 'dark' ? dark : undefined,
          elements: {
            card: "bg-background",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-muted text-foreground",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-muted border-input",
          }
        }}
      />
    </div>
  )
}

