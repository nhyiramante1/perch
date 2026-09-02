import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { chairBySlug } from "@/data/chairs"
import type { CartLine } from "@/lib/types"

const KEY = "perch-cart"

/** Flat $19 delivery on campus, waived over $250. Tax is Michigan's 6%. */
export const SHIPPING_CENTS = 1900
export const FREE_SHIPPING_THRESHOLD_CENTS = 25000
export const TAX_RATE = 0.06

interface CartCtx {
  lines: CartLine[]
  count: number
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  add: (slug: string, colorwayId: string, qty?: number) => void
  setQty: (slug: string, colorwayId: string, qty: number) => void
  remove: (slug: string, colorwayId: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)

function readStored(): CartLine[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Drop anything that no longer matches a real chair, so a catalog edit
    // cannot leave an un-priceable line sitting in somebody's cart.
    return parsed.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).slug === "string" &&
        Boolean(chairBySlug((l as CartLine).slug)),
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* storage can be unavailable in private mode; the cart still works in memory */
    }
  }, [lines])

  const add = useCallback((slug: string, colorwayId: string, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug && l.colorwayId === colorwayId)
      if (i === -1) return [...prev, { slug, colorwayId, qty }]
      const next = [...prev]
      next[i] = { ...next[i], qty: next[i].qty + qty }
      return next
    })
  }, [])

  const setQty = useCallback((slug: string, colorwayId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.colorwayId === colorwayId))
        : prev.map((l) =>
            l.slug === slug && l.colorwayId === colorwayId ? { ...l, qty } : l,
          ),
    )
  }, [])

  const remove = useCallback((slug: string, colorwayId: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.colorwayId === colorwayId)))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotalCents = lines.reduce(
      (sum, l) => sum + (chairBySlug(l.slug)?.priceCents ?? 0) * l.qty,
      0,
    )
    const shippingCents =
      subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : SHIPPING_CENTS
    const taxCents = Math.round(subtotalCents * TAX_RATE)
    return {
      lines,
      count,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents: subtotalCents + shippingCents + taxCents,
      add,
      setQty,
      remove,
      clear,
    }
  }, [lines, add, setQty, remove, clear])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
