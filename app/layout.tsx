import { Geist_Mono, Poppins } from "next/font/google"

import "./globals.css"
import { AppProviders } from "@/components/providers/app-providers"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", poppins.variable, fontMono.variable, "font-sans")}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
