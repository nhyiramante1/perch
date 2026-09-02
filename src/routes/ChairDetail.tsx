import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, ChevronLeft, Minus, Plus, Star } from "lucide-react"

import ChairArt from "@/components/ChairArt"
import ChairCard from "@/components/ChairCard"
import { CHAIRS, chairBySlug } from "@/data/chairs"
import { useCart } from "@/lib/cart"
import { CATEGORY_LABEL } from "@/lib/types"
import { cn, formatPrice } from "@/lib/utils"
import NotFound from "@/routes/NotFound"

export default function ChairDetail() {
  const { slug } = useParams()
  const chair = slug ? chairBySlug(slug) : undefined
  const { add } = useCart()

  const [colorwayId, setColorwayId] = useState(() => chair?.colorways[0]?.id ?? "")
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  // Navigating between two product pages reuses this component, so the
  // selection has to follow the slug or you inherit the last chair's colourway.
  useEffect(() => {
    setColorwayId(chair?.colorways[0]?.id ?? "")
    setQty(1)
    setJustAdded(false)
  }, [chair])

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 1800)
    return () => clearTimeout(t)
  }, [justAdded])

  if (!chair) return <NotFound />

  const colorway = chair.colorways.find((c) => c.id === colorwayId) ?? chair.colorways[0]
  const onSale = typeof chair.compareAtCents === "number"
  const related = CHAIRS.filter(
    (c) => c.category === chair.category && c.slug !== chair.slug,
  ).slice(0, 3)

  return (
    <div className="flex flex-col gap-16">
      <Link
        to={`/shop?category=${chair.category}`}
        className="flex w-fit items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft size={13} /> {CATEGORY_LABEL[chair.category]} chairs
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div
          key={colorway?.id}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
          className="surface aspect-square overflow-hidden bg-secondary/40 text-foreground/70"
        >
          <ChairArt chair={chair} color={colorway?.hex} className="p-10" />
        </motion.div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">{CATEGORY_LABEL[chair.category]}</span>
            <h1 className="text-3xl font-semibold tracking-tight">{chair.name}</h1>
            <p className="text-[15px] text-muted-foreground">{chair.tagline}</p>
            <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-current text-accent" />
                {chair.rating.toFixed(1)}
              </span>
              <span>·</span>
              <span>{chair.reviewCount} reviews</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(chair.priceCents)}</span>
            {onSale && (
              <>
                <span className="text-muted-foreground line-through">
                  {formatPrice(chair.compareAtCents!)}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
                  Save {formatPrice(chair.compareAtCents! - chair.priceCents)}
                </span>
              </>
            )}
          </div>

          <p className="text-[15px] leading-relaxed">{chair.description}</p>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">
              Colour — {colorway?.name}
            </span>
            <div className="flex gap-2">
              {chair.colorways.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorwayId(c.id)}
                  aria-label={c.name}
                  aria-pressed={c.id === colorway?.id}
                  className={cn(
                    "h-9 w-9 rounded-full ring-1 ring-black/15 transition-all",
                    c.id === colorway?.id
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                      : "hover:scale-105",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-input bg-card">
              <button
                type="button"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="p-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-35"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-mono text-sm" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((n) => Math.min(9, n + 1))}
                disabled={qty >= 9}
                aria-label="Increase quantity"
                className="p-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-35"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              disabled={!chair.inStock}
              onClick={() => {
                add(chair.slug, colorway!.id, qty)
                setJustAdded(true)
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-all sm:flex-none",
                chair.inStock
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              {!chair.inStock ? (
                "Sold out"
              ) : justAdded ? (
                <>
                  <Check size={15} /> Added to cart
                </>
              ) : (
                `Add to cart — ${formatPrice(chair.priceCents * qty)}`
              )}
            </button>
          </div>

          {justAdded && (
            <Link
              to="/cart"
              className="w-fit text-sm text-primary underline underline-offset-4"
            >
              Go to cart
            </Link>
          )}

          <div className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">What you get</span>
              <ul className="flex flex-col gap-1.5">
                {chair.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <span className="eyebrow">Measured</span>
              <dl className="flex flex-col gap-1.5 font-mono text-[12px]">
                {(
                  [
                    ["Width", chair.dimensions.width],
                    ["Depth", chair.dimensions.depth],
                    ["Height", chair.dimensions.height],
                    ["Weight", chair.dimensions.weight],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="eyebrow">Also fits the room</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((c, i) => (
              <ChairCard key={c.slug} chair={c} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
