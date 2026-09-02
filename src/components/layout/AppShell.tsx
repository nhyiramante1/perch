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
      {/* Visible only once focused. Without it, a keyboard user tabs through
          the whole nav on every page before reaching the products. */}
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>

      <Navbar />

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-8 outline-none sm:px-8"
      >
        {children}
      </main>

      <Footer />
    </div>
  )
}
