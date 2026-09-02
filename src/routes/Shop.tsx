import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, X } from "lucide-react"

import ChairCard from "@/components/ChairCard"
import { CHAIRS } from "@/data/chairs"
import { CATEGORIES, CATEGORY_LABEL, type Category, type Chair } from "@/lib/types"
import { cn } from "@/lib/utils"

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Best rated",
} as const
type Sort = keyof typeof SORTS

function isCategory(v: string | null): v is Category {
  return v !== null && (CATEGORIES as readonly string[]).includes(v)
}

function isSort(v: string | null): v is Sort {
  return v !== null && v in SORTS
}

/** Name and tagline are weighted above tags so an exact title match ranks first. */
function matches(chair: Chair, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    chair.name,
    chair.tagline,
    chair.description,
    CATEGORY_LABEL[chair.category],
    ...chair.tags,
    ...chair.colorways.map((c) => c.name),
  ]
    .join(" ")
    .toLowerCase()
  // Every whitespace-separated term must appear, so "cheap folding" narrows
  // rather than widening the way an OR would.
  return needle.split(/\s+/).every((term) => haystack.includes(term))
}

export default function Shop() {
  // The URL is the source of truth for filter state — it makes the view
  // shareable and back-navigable, and the navbar links straight into it.
  const [params, setParams] = useSearchParams()

  const category = isCategory(params.get("category")) ? (params.get("category") as Category) : null
  const sort: Sort = isSort(params.get("sort")) ? (params.get("sort") as Sort) : "featured"
  const q = params.get("q") ?? ""

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value === null || value === "") next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const list = CHAIRS.filter(
      (c) => (!category || c.category === category) && matches(c, q),
    )
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.priceCents - b.priceCents)
      case "price-desc":
        return [...list].sort((a, b) => b.priceCents - a.priceCents)
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating)
      case "featured":
        // In-stock first, then by review count — "featured" should never lead
        // with something you cannot buy.
        return [...list].sort(
          (a, b) => Number(b.inStock) - Number(a.inStock) || b.reviewCount - a.reviewCount,
        )
    }
  }, [category, q, sort])

  const filtered = Boolean(category) || q.trim() !== ""

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">The catalog</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {category ? `${CATEGORY_LABEL[category]} chairs` : "Every chair"}
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search chairs, rooms, or colours…"
            aria-label="Search chairs"
            className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={!category} onClick={() => update("category", null)}>
            All
          </FilterChip>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              active={category === cat}
              onClick={() => update("category", category === cat ? null : cat)}
            >
              {CATEGORY_LABEL[cat]}
            </FilterChip>
          ))}

          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            aria-label="Sort chairs"
            className="ml-auto rounded-full border border-input bg-card px-3 py-1.5 text-xs outline-none transition-colors focus:border-ring"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] text-muted-foreground">
            {results.length} of {CHAIRS.length} chairs
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="surface flex flex-col items-center gap-2 px-6 py-20 text-center">
          <p className="font-medium">Nothing matches that.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a room instead of a product name — “loft”, “corner”, “outdoor” — or clear
            the filters and browse all {CHAIRS.length}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((chair, i) => (
            <ChairCard key={chair.slug} chair={chair} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
