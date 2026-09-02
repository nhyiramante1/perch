import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Package, Ruler, Undo2 } from "lucide-react"

import ChairArt from "@/components/ChairArt"
import ChairCard from "@/components/ChairCard"
import { CHAIRS } from "@/data/chairs"
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

const HERO_CHAIR = CHAIRS.find((c) => c.slug === "commons-lounger")!
const FEATURED = ["the-all-nighter", "beanbag-theology", "quad-hammock", "loft-stool"]

export default function Home() {
  const featured = FEATURED.map((s) => CHAIRS.find((c) => c.slug === s)!).filter(Boolean)
  const cheapest = Math.min(...CHAIRS.map((c) => c.priceCents))

  return (
    <div className="flex flex-col gap-20">
      <Hero cheapest={cheapest} />

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="eyebrow">By room</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const sample = CHAIRS.find((c) => c.category === cat)!
            const n = CHAIRS.filter((c) => c.category === cat).length
            return (
              <Link
                key={cat}
                to={`/shop?category=${cat}`}
                className="surface group flex flex-col items-center gap-1 p-4 transition-colors hover:border-primary/40"
              >
                <div className="h-16 w-16 text-foreground/60 transition-transform group-hover:scale-110">
                  <ChairArt chair={sample} />
                </div>
                <span className="text-sm font-medium">{CATEGORY_LABEL[cat]}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {n} chair{n === 1 ? "" : "s"}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="eyebrow">Most carried up the stairs</span>
          <div className="h-px flex-1 bg-border/60" />
          <Link
            to="/shop"
            className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((chair, i) => (
            <ChairCard key={chair.slug} chair={chair} index={i} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Promise
          icon={<Ruler size={18} />}
          title="Measured for dorm rooms"
          body="Every listing carries real dimensions, because the question is always whether it fits between the bed and the desk."
        />
        <Promise
          icon={<Package size={18} />}
          title="Carried up, not delivered to the kerb"
          body="Campus delivery goes to your floor. Flat $19, free over $250."
        />
        <Promise
          icon={<Undo2 size={18} />}
          title="Returns until the drop deadline"
          body="If it does not work in the room, send it back. You had two weeks to decide about the class, too."
        />
      </section>
    </div>
  )
}

function Hero({ cheapest }: { cheapest: number }) {
  return (
    <section className="grid items-center gap-8 pt-6 sm:grid-cols-2 sm:gap-10 sm:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-start gap-5"
      >
        <span className="eyebrow">Chairs for small rooms</span>
        <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          You will sit in it for
          <span className="text-primary"> nine hundred hours</span> this year.
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Perch sells chairs built for the rooms students actually get — a desk against a
          wall, a lofted bed, a corner, and a quad in April. Every one is measured, and
          every one fits up a stairwell.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/shop"
            className="group flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Shop all chairs
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            From {formatPrice(cheapest)}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="surface relative aspect-square overflow-hidden bg-secondary/40 text-foreground/70"
      >
        <ChairArt chair={HERO_CHAIR} className="p-8" />
        <Link
          to={`/shop/${HERO_CHAIR.slug}`}
          className="absolute bottom-4 left-4 rounded-md bg-background/90 px-3 py-2 text-xs backdrop-blur-sm transition-colors hover:bg-background"
        >
          <span className="font-medium">{HERO_CHAIR.name}</span>
          <span className="text-muted-foreground">
            {" "}
            · {formatPrice(HERO_CHAIR.priceCents)}
          </span>
        </Link>
      </motion.div>
    </section>
  )
}

function Promise({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="surface flex flex-col gap-2 p-5">
      <span className="text-primary">{icon}</span>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
