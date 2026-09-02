# Perch

An online chair shop for students in small rooms — dorm desks, library carrels, lofted
beds, and the quad in April. Built as an ungraded CS 336 coursework demo.

**Perch is a fictional independent shop.** It is not affiliated with Calvin University,
uses none of its marks, and takes no real orders or payments — checkout is simulated end
to end.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 (CSS-first tokens, no config file) ·
React Router · Framer Motion · Lucide. Client-only: the catalog is typed TS data and the
cart persists to `localStorage`.

Every chair in the catalog is **drawn in code** — `src/components/ChairArt.tsx` renders an
SVG from the product's `shape`, tinted by the selected colorway, so a new product needs no
asset. A chair carrying an `image` renders that photo instead.

## Getting started

```bash
npm install
npm run dev
```

Serves on <http://127.0.0.1:3200>.

```bash
npx tsc -b
npm run build
```

## Layout

```
src/
  components/     ChairArt, ChairCard, layout/, cart/
  data/chairs.ts  the catalog — integer cents, never floats
  lib/            types (shared contract), cart, theme, utils
  routes/         Home, Shop, ChairDetail, Cart, Checkout, OrderConfirmation
  styles/         globals.css — oklch tokens, light + dark
```

Built by two agent seats working disjoint file lanes on `main` — see
[`WORKPLAN.md`](WORKPLAN.md) for the dispatch board and
[`docs/agents/`](docs/agents) for the per-seat handoffs.
