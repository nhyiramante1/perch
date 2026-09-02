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
  /**
   * Optional photo of *this* colourway. Takes precedence over `Chair.image`,
   * so a photographed catalogue keeps the colourway picker meaningful — the
   * preview changes when you switch colour, exactly as the drawn version does.
   * Without it a photographed chair shows one fixed image for every colour.
   */
  image?: string
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
  /** Configurable choices. A chair without these is sold as one fixed build. */
  options?: ChairOption[]
  /**
   * Optional photo. When present `ChairArt` renders this instead of the
   * code-drawn SVG, so swapping in generated imagery later is a data change
   * only — put files in `public/chairs/` and set the path here.
   */
  image?: string
}

/** A configurable choice on a chair, e.g. "Armrests" → "None" / "Fixed" / "Adjustable". */
export interface OptionChoice {
  id: string
  label: string
  /** Added to the chair's base price. May be 0, and may be negative. */
  priceDeltaCents: number
  /** Shown under the choice when it needs a word of explanation. */
  note?: string
}

export interface ChairOption {
  id: string
  label: string
  choices: OptionChoice[]
}

/**
 * One line in the cart. Quantity lives here; the chair is looked up by slug.
 *
 * Identity is `(slug, colorwayId, options)` — the same chair configured two
 * ways is two lines, because they are two different products at two different
 * prices. Use `cartLineKey()` from `lib/pricing` rather than comparing fields
 * by hand.
 */
export interface CartLine {
  slug: string
  colorwayId: string
  qty: number
  /** optionId → choiceId. Absent or empty means the chair's default build. */
  options?: Record<string, string>
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
    /**
     * The configuration that was bought, as display labels — what
     * `describeChoices()` returns. Snapshotted like the name and price, so a
     * later catalogue edit cannot rewrite what somebody ordered.
     *
     * Optional: orders placed before options existed, and chairs sold as one
     * fixed build, have none.
     */
    optionLabels?: string[]
  }>
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  customer: { name: string; email: string; dorm: string; room: string }
}
