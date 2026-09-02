# Perch

An online chair shop for students in small rooms — dorm desks, library carrels, lofted
beds, and the quad in April. Built as an ungraded CS 336 coursework demo.

> **Perch is a fictional independent shop.** It is not affiliated with Calvin University,
> does not speak in its voice, and uses none of its marks. **Checkout is simulated end to
> end**: no payment processor, no card fields anywhere, and no real order is placed. Orders
> exist only in the browser that placed them.

## Running it

Requires **Node 20.19+** (developed on 24). No database, no API keys, no backend — it is a
client-only SPA, so `install` and `dev` is the whole setup.

```bash
npm install
npm run dev
```

Then open **<http://127.0.0.1:3200>**.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR on port 3200 |
| `npm run typecheck` | `tsc -b` — must exit 0 before any commit |
| `npm run build` | Typecheck, then production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | oxlint |

### Trying the whole flow

Browse → filter or search → open a chair → pick a colourway → configure it → add to cart →
checkout → confirmation. Two chairs carry configurable options: **The All-Nighter**
(armrests, casters) and **Commons Lounger** (fabric, legs).

Worth poking at, because these are the parts that usually break:

- Configure the same chair two different ways and add both — they are **two cart lines at
  two prices**, not one merged line.
- Submit the checkout form empty. It refuses to navigate and marks all four fields.
- Refresh the confirmation page, then edit the order id in the URL to something invented.
- Toggle dark mode, and try it at phone width.

Nothing persists server-side. To reset, clear `localStorage` for the origin (the keys are
`perch-cart`, `perch-orders`, `perch-theme`).

## Stack

Vite 8 · React 19 · TypeScript · Tailwind v4 · React Router 7 · Framer Motion · Lucide ·
Geist. Tailwind v4 is **CSS-first — there is no `tailwind.config`**; the design tokens are
oklch custom properties in `src/styles/globals.css`, with a `.dark` block that redefines
them.

## How it is put together

**Every chair is drawn in code.** `src/components/ChairArt.tsx` renders an SVG from the
product's `shape`, tinted by the selected colourway, so adding a product needs no asset and
the line art inverts correctly in dark mode. It resolves in three steps, each independently
adoptable:

1. the selected colourway's own photo (`Colorway.image`)
2. the chair's single photo (`Chair.image`)
3. the drawing

**Money is integer cents everywhere.** `formatPrice()` is the only place it becomes a
string, and `src/lib/pricing.ts` is the only place a configured chair becomes a price — the
cart and the order snapshot both call `unitPriceCents`, so a confirmation cannot disagree
with the basket the customer approved.

**A cart line is `(slug, colourway, options)`.** The same chair configured two ways is two
products at two prices. `cartLineKey()` owns that identity; options are canonicalised on
the way in, so a line added from two different screens cannot split into twin rows.

**Orders snapshot what was bought** — names, colourway, option labels and unit prices are
copied in at placement, so editing the catalogue later cannot rewrite somebody's order.

**Filter state lives in the URL.** `/shop?category=lounge&q=corner&sort=price-asc` is
shareable and back-navigable, and search requires *every* term, so a second word narrows.

**No `AnimatePresence`.** Under React 19's StrictMode its `mode="wait"` exit never
completes, which froze every in-app navigation while the URL changed underneath. Route
transitions are entry-only on a keyed `motion.div`. See `SS-003` on the board.

## Swapping in photography

The catalogue can move to photoreal images without a code change. See
[`docs/ASSET_PROMPTS.md`](docs/ASSET_PROMPTS.md) for the prompts and the reasoning — images
are generated as **one grid per chair containing all its colourways**, because generating
each separately drifts the angle and lighting, and the colourway picker is exactly where
that shows.

```bash
node scripts/slice-grid.mjs <grid.png> the-all-nighter graphite moss clay
```

That cuts the grid into `public/chairs/<slug>-<colourway>.png` using ffmpeg, and prints the
`image:` lines to paste into `src/data/chairs.ts`. **Convert all twelve chairs or none** — a
catalogue that is half photograph and half drawing reads as unfinished.

## Layout

```
src/
  components/
    ChairArt.tsx      one render path for a chair: colourway photo → photo → drawing
    ChairCard.tsx     catalogue card
    layout/           AppShell (skip link, scroll reset), Navbar, Footer
  data/chairs.ts      the catalogue — 12 chairs, integer cents
  lib/
    types.ts          shared contract: Chair, Colorway, CartLine, Order, options
    pricing.ts        unitPriceCents, cartLineKey — the single source for line money
    cart.tsx          cart context, localStorage-persisted
    orders.ts         placed orders, snapshotted
    theme.tsx         light/dark, persisted
    usePageTitle.ts   per-route document titles
  routes/             Home, Shop, ChairDetail, Cart, Checkout, OrderConfirmation, NotFound
  styles/globals.css  oklch tokens, light + dark, focus ring
scripts/
  slice-grid.mjs      cuts a generated image grid into per-colourway files
```

## How it was built

Two Claude Code agent seats worked this repo in parallel on `main` in **disjoint file
lanes** — Claude OG (foundation, catalogue, browse pages, review) and Claude New (cart,
checkout, orders, configurator). [`WORKPLAN.md`](WORKPLAN.md) is the dispatch board: every
ticket, the bugs found and who found them, and the two rulings where one seat's approach
beat the other's. [`docs/agents/`](docs/agents) holds the per-seat handoffs.
