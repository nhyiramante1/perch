import { Link, useLocation, useSearchParams } from "react-router-dom"
import { Moon, ShoppingBag, Sun } from "lucide-react"

import { useCart } from "@/lib/cart"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

const LINKS = [
  { to: "/shop", label: "Shop", category: null },
  { to: "/shop?category=desk", label: "Desk", category: "desk" },
  { to: "/shop?category=lounge", label: "Lounge", category: "lounge" },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { count } = useCart()
  const { pathname } = useLocation()
  const [params] = useSearchParams()

  // NavLink matches on pathname alone, so all three of these would light up at
  // once on /shop. The category lives in the query string, so active state has
  // to be read from there.
  const activeCategory = params.get("category")
  const isActive = (link: (typeof LINKS)[number]) =>
    pathname === "/shop" && activeCategory === link.category

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <PerchMark />
          <span className="text-base font-semibold tracking-tight">Perch</span>
        </Link>

        {/* Visible at every width. Hiding these below `sm` left a phone with no
            route to a category at all — the burger menu that would have
            replaced them is not worth the code for three links. */}
        <div className="ml-1 flex items-center gap-0.5 sm:ml-4 sm:gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              aria-current={isActive(l) ? "page" : undefined}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm transition-colors sm:px-3",
                isActive(l)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Link
            to="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ShoppingBag size={17} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}

/** Wordmark glyph: a chair reduced to a seat, a back, and two legs. */
function PerchMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 4v9M17 4v9" />
        <path d="M5 13h14" />
        <path d="M8 13l-1 7M16 13l1 7" />
      </g>
    </svg>
  )
}
