import { Link } from "react-router-dom"
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import ChairArt from "@/components/ChairArt"
import { chairBySlug } from "@/data/chairs"
import { FREE_SHIPPING_THRESHOLD_CENTS, useCart } from "@/lib/cart"
import { cartLineKey, unitPriceCents } from "@/lib/pricing"
import { formatPrice } from "@/lib/utils"
import type { CartLine } from "@/lib/types"

/** One chair can sit in the cart several times — different colourways, or the
 *  same colourway built differently — so every row is keyed on the full line
 *  identity via `cartLineKey`, never on slug alone. */
const MAX_QTY = 99

export default function Cart() {
  const cart = useCart()

  if (cart.lines.length === 0) return <EmptyCart />

  const toFreeShipping = FREE_SHIPPING_THRESHOLD_CENTS - cart.subtotalCents

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="eyebrow">Your cart</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        {cart.count} {cart.count === 1 ? "chair" : "chairs"}
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <ul className="flex flex-col gap-4">
          {cart.lines.map((line) => (
            <CartRow key={cartLineKey(line)} line={line} />
          ))}
        </ul>

        <aside className="surface sticky top-24 p-6">
          <h2 className="font-heading text-lg font-semibold">Summary</h2>

          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <Row label="Subtotal" value={formatPrice(cart.subtotalCents)} />
            <Row
              label="Delivery"
              value={cart.shippingCents === 0 ? "Free" : formatPrice(cart.shippingCents)}
            />
            <Row label="Tax" value={formatPrice(cart.taxCents)} />
            <div className="mt-2 border-t border-border pt-3">
              <Row label="Total" value={formatPrice(cart.totalCents)} strong />
            </div>
          </dl>

          {toFreeShipping > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {formatPrice(toFreeShipping)} more for free campus delivery.
            </p>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">Free campus delivery applied.</p>
          )}

          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Checkout
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            to="/shop"
            className="mt-3 block text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Keep browsing
          </Link>
        </aside>
      </div>
    </div>
  )
}

function CartRow({ line }: { line: CartLine }) {
  const { setQty, remove } = useCart()
  const chair = chairBySlug(line.slug)

  // The cart provider already drops lines whose slug no longer resolves, so this
  // is belt-and-braces — but a row that throws is worse than one that renders nothing.
  if (!chair) return null

  // A colourway can be retired from the catalogue while it sits in a saved cart.
  // Fall back to the first rather than rendering a blank swatch.
  const colorway = chair.colorways.find((c) => c.id === line.colorwayId) ?? chair.colorways[0]
  const unitCents = unitPriceCents(chair, line.options)
  const lineTotal = unitCents * line.qty

  return (
    <li className="surface flex gap-4 p-4">
      <Link
        to={`/shop/${chair.slug}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary"
      >
        <ChairArt chair={chair} color={colorway?.hex} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/shop/${chair.slug}`}
              className="font-heading font-medium underline-offset-4 hover:underline"
            >
              {chair.name}
            </Link>
            {colorway ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: colorway.hex }}
                  aria-hidden="true"
                />
                {colorway.name}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => remove(line)}
            aria-label={`Remove ${chair.name} from cart`}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex items-center gap-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQty(line, line.qty - 1)}
              disabled={line.qty <= 1}
              aria-label={`Decrease quantity of ${chair.name}`}
              className="rounded-l-md px-2 py-1.5 transition hover:bg-secondary disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center font-mono text-sm" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(line, line.qty + 1)}
              disabled={line.qty >= MAX_QTY}
              aria-label={`Increase quantity of ${chair.name}`}
              className="rounded-r-md px-2 py-1.5 transition hover:bg-secondary disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="text-right">
            <p className="font-mono text-sm font-medium">{formatPrice(lineTotal)}</p>
            {line.qty > 1 ? (
              <p className="text-xs text-muted-foreground">
                {formatPrice(unitCents)} each
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={strong ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-mono font-semibold" : "font-mono"}>{value}</dd>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <ShoppingBag className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
        Your cart is empty
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Twelve chairs, all built for small rooms. Go find the one that fits.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Browse chairs
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
