import type { CartLine, Chair, OptionChoice } from "@/lib/types"

/**
 * One place where a configured chair becomes a price, and one place where a
 * cart line becomes an identity.
 *
 * Both matter more than they look. If the cart totalled options one way and the
 * order snapshot totalled them another, the confirmation would quietly disagree
 * with the basket the customer approved — the kind of bug nobody notices until
 * it is money. Cart, checkout and order all call these.
 */

/** The choices a line actually selected, defaulting to each option's first. */
export function resolveChoices(
  chair: Chair,
  options?: Record<string, string>,
): OptionChoice[] {
  if (!chair.options) return []
  return chair.options.map((opt) => {
    const chosenId = options?.[opt.id]
    return opt.choices.find((c) => c.id === chosenId) ?? opt.choices[0]
  })
}

/** Base price plus every selected option's delta. Integer cents. */
export function unitPriceCents(chair: Chair, options?: Record<string, string>): number {
  return resolveChoices(chair, options).reduce(
    (total, choice) => total + choice.priceDeltaCents,
    chair.priceCents,
  )
}

/** Human-readable build, e.g. "Adjustable armrests · Castors". */
export function describeChoices(
  chair: Chair,
  options?: Record<string, string>,
): string[] {
  return resolveChoices(chair, options).map((c) => c.label)
}

/**
 * Stable identity for a cart line.
 *
 * Option keys are sorted so `{a,b}` and `{b,a}` are the same line — object key
 * order is an accident of construction and must not split a line in two.
 */
export function cartLineKey(line: Pick<CartLine, "slug" | "colorwayId" | "options">): string {
  const opts = line.options ?? {}
  const serialised = Object.keys(opts)
    .sort()
    .map((k) => `${k}=${opts[k]}`)
    .join(",")
  return `${line.slug}|${line.colorwayId}|${serialised}`
}

/** True when two lines are the same configured product. */
export function isSameLine(
  a: Pick<CartLine, "slug" | "colorwayId" | "options">,
  b: Pick<CartLine, "slug" | "colorwayId" | "options">,
): boolean {
  return cartLineKey(a) === cartLineKey(b)
}
