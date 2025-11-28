import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Updated metadata for the zombie game
export const metadata: Metadata = {
  title: "Undead Survival - 2D Zombie Shooter",
  description:
    "A 2D zombie shooter game inspired by Black Ops Zombies. Survive endless waves, buy weapons, and collect power-ups!",
  generator: "Dustin Loring",
  icons: {
    icon: "/game.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
