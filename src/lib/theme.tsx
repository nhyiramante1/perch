import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type Theme = "light" | "dark"

const KEY = "perch-theme"

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {} })

/** Holds the light/dark choice, persists it, and drives the `.dark` class. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    const saved = window.localStorage.getItem(KEY)
    if (saved === "dark" || saved === "light") return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  useEffect(() => {
    window.localStorage.setItem(KEY, theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  )

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(Ctx)
