import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

import ChairArt from "@/components/ChairArt"
import { CATEGORY_LABEL, type Chair } from "@/lib/types"
import { cn, formatPrice } from "@/lib/utils"

export default function ChairCard({ chair, index = 0 }: { chair: Chair; index?: number }) {
  const onSale = typeof chair.compareAtCents === "number"

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      // Stagger caps at 8 so a filter that returns twelve results does not make
      // the last card wait most of a second to appear.
      transition={{ duration: 0.34, delay: Math.min(index, 8) * 0.04, ease: "easeOut" }}
    >
      <Link
        to={`/shop/${chair.slug}`}
        className="group surface flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="relative aspect-4/3 bg-secondary/40 text-foreground/70">
          <ChairArt
            chair={chair}
            className="p-4 transition-transform duration-300 group-hover:scale-[1.04]"
          />

          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge>{CATEGORY_LABEL[chair.category]}</Badge>
            {onSale && <Badge tone="accent">Sale</Badge>}
            {!chair.inStock && <Badge tone="muted">Sold out</Badge>}
          </div>

          <div className="absolute bottom-3 right-3 flex gap-1">
            {chair.colorways.map((c) => (
              <span
                key={c.id}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className="h-3 w-3 rounded-full ring-1 ring-black/15"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-semibold leading-tight tracking-tight">{chair.name}</h3>
            <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <Star size={11} className="fill-current text-accent" />
              {chair.rating.toFixed(1)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{chair.tagline}</p>

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="font-semibold">{formatPrice(chair.priceCents)}</span>
            {onSale && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(chair.compareAtCents!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode
  tone?: "default" | "accent" | "muted"
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm",
        tone === "default" && "bg-background/85 text-muted-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        tone === "muted" && "bg-foreground/80 text-background",
      )}
    >
      {children}
    </span>
  )
}
