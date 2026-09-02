import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  // Route changes should land at the top, not wherever the last page was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-8 sm:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
