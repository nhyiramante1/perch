/**
 * Shared contract for the whole app. Both seats import from here — if you need a
 * new field, add it here rather than widening a type at the use site.
 */

export const CATEGORIES = ["desk", "lounge", "floor", "compact", "outdoor"] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABEL: Record<Category, string> = {
  desk: "Desk",
  lounge: "Lounge",
  floor: "Floor",
  compact: "Compact",
  outdoor: "Outdoor",
}

/** Art direction for the code-drawn chair. `ChairArt` switches on this. */
export type ChairShape =
  | "task"
  | "armchair"
  | "stool"
  | "beanbag"
  | "folding"
  | "rocker"
  | "hammock"
  | "bench"

export interface Colorway {
  /** Stable id used in cart lines and URLs. */
  id: string
  name: string
  /** Any CSS colour. Drives the code-drawn SVG's upholstery. */
  hex: string
}

export interface Chair {
  slug: string
  name: string
  tagline: string
  /** Integer cents. Never a float — see `formatPrice`. */
  priceCents: number
  /** Set when the item is on sale; renders as a struck-through was-price. */
  compareAtCents?: number
  category: Category
  shape: ChairShape
  colorways: Colorway[]
  /** Short selling points, 3–5 of them. */
  features: string[]
  description: string
  /** Free-text search corpus beyond name/tagline. */
  tags: string[]
  dimensions: { width: string; depth: string; height: string; weight: string }
  rating: number
  reviewCount: number
  inStock: boolean
  /**
   * Optional photo. When present `ChairArt` renders this instead of the
   * code-drawn SVG, so swapping in generated imagery later is a data change
   * only — put files in `public/chairs/` and set the path here.
   */
  image?: string
}

/** One line in the cart. Quantity lives here; the chair itself is looked up by slug. */
export interface CartLine {
  slug: string
  colorwayId: string
  qty: number
}

export interface Order {
  id: string
  placedAt: string
  lines: Array<{
    slug: string
    name: string
    colorwayName: string
    qty: number
    unitPriceCents: number
  }>
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  customer: { name: string; email: string; dorm: string; room: string }
}
