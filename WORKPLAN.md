# Perch — Dispatch Board

**One-night build, 2026-09-01.** Two seats: **Claude OG** (driver, owns the board) and
**Claude New**. Ticket IDs are `SS-nnn`. Newest entries go at the **top**.

> **Read this file before you act, every time you resume.** Where this file and a handoff
> doc disagree, **this file wins**.

## How tonight differs from campus-ball

This is deliberately the light version of that system. **No branches, no review gate, no
sign-off ceremony.** Both seats commit directly to `main` in **disjoint file lanes** — the
lane table below is the only thing keeping two agents out of each other's diffs, so it is
the one rule that actually binds.

**Do not edit a file outside your lane.** If you need something changed in the other seat's
lane, write it under **Open items** at the bottom of this file and keep going — do not
reach across and edit it yourself, and do not block waiting.

**Commit small and push often** — every 10–15 minutes, not at the end. `git pull --rebase`
before every push. A conflict tonight means a lane was crossed; say so on the board rather
than resolving it silently.

## Lanes

| Claude OG (driver) | Claude New |
|---|---|
| `src/routes/Home.tsx` | `src/routes/Cart.tsx` |
| `src/routes/Shop.tsx` | `src/routes/Checkout.tsx` |
| `src/routes/ChairDetail.tsx` | `src/routes/OrderConfirmation.tsx` |
| `src/routes/NotFound.tsx` | `src/lib/cart.tsx` |
| `src/components/ChairArt.tsx` | `src/lib/orders.ts` *(new — yours to create)* |
| `src/components/ChairCard.tsx` | `src/components/cart/**` *(new — yours to create)* |
| `src/components/layout/**` | |
| `src/data/chairs.ts` | |
| `src/styles/globals.css` | |
| `src/lib/types.ts`, `src/lib/utils.ts` | |
| `App.tsx`, `main.tsx`, config, this board | |

**Shared, read-only to both:** `src/lib/types.ts`, `src/data/chairs.ts`, `src/lib/utils.ts`.
Claude OG owns writes to those. **Need a new field on `Chair` or `Order`?** Post it under
Open items — OG adds it within a few minutes. Do not widen a type at the use site.

`src/lib/cart.tsx` is **handed over**: OG wrote the initial version and will not touch it
again. It is Claude New's file from now on.

## Definition of done for tonight

`npx tsc -b` exits 0 and `npm run dev` serves a site you can walk end to end: browse →
filter → open a chair → add to cart → checkout → confirmation. **Working beats complete.**

---

## SS-003 ✅ NAVIGATION WAS BROKEN SITE-WIDE — fixed. **Claude OG.** 2026-09-01 @ `3da9c43`

**Every in-app link changed the URL and left the view frozen on the previous page.** Not a
cart bug, not a checkout bug — `AnimatePresence mode="wait"` in `App.tsx` never completed
its exit under React 19's StrictMode, so the outgoing route was held mounted forever.

**This is the failure mode worth remembering: hard reloads worked perfectly.** Browsing the
site by typing URLs looked flawless, which is exactly why it survived two seats and four
commits unnoticed. It only surfaced when I clicked cart → checkout like a user would.

Route transitions are now entry-only on a keyed `motion.div` — same fade in, no exit
animation, and nothing that can wedge. Same pattern removed from the `Shop` grid, whose
cards had no exit animation to lose anyway.

Two smaller fixes in the same push: `--font-heading` is now defined (the cart and checkout
pages ask for it by name, and it was silently resolving to nothing), and a stray
`pnpm-lock.yaml` / `pnpm-workspace.yaml` pair is out of what is an npm project, plus
`.gitignore`d so they cannot come back.

**Navbar active state** followed in a second push: `NavLink` matches on pathname only, so
Shop / Desk / Lounge all highlighted simultaneously on `/shop`. Active state now reads the
`category` query param.

## SS-002 ✅ VERIFIED END TO END. **Claude OG**, checking Claude New's work.

Walked it as a user, in a browser, not by reading it. **Both hazards the dispatch called
out are handled, and handled for the stated reason:**

- Confirmation reads from the order store, never cart state. Placed `PCH-YZ7PT`, cart went
  to 0, confirmation rendered in full.
- Unknown id renders its own state rather than blanking, and a **refresh of a real order id
  still resolves** — checked both.

**Validation genuinely blocks.** An invalid submit produced four inline errors, set
`aria-invalid` on all four fields, and did not navigate. `role="alert"` and
`aria-describedby` are wired, which is more than the brief asked for.

**`orders.ts` is better than it needed to be**, and two decisions are worth keeping:
line names, colourway names and unit prices are **snapshotted at placement**, so a later
catalogue edit cannot rewrite somebody's placed order; and an in-memory mirror sits in front
of `localStorage`, so an order still reads back on the next screen when a private-mode
browser refuses the write. The id alphabet drops O/0, I/1 and S/5 because these get read
aloud.

**No card fields anywhere** — grepped for it. Checkout says plainly that it is simulated.

Totals verified against the cart: $189.00 + $19.00 delivery + $11.34 tax = **$219.34**.

Nothing here needed changing.

## SS-001 ✅ Home, Shop, ChairDetail landed. **Claude OG.** @ `b816ad5`

Filter state lives in the URL, so a filtered view is shareable and the navbar links
straight into a category. **Search requires every term rather than any** — "cheap folding"
narrows instead of widening. Verified: "loft" returns Loft Stool by name and Floor Rocker
because its description says lofted bed.

`featured` sorts in-stock first, then by review count — a featured rail should never lead
with something you cannot buy.

**Verified in both themes and at 375px.** All eight drawn shapes read as chairs; the SVG
strokes use `currentColor`, so the line art inverts correctly in dark mode rather than
going muddy.

---

## SS-000 — Foundation landed. **Claude OG.** 2026-09-01

Vite 8 + React 19 + TS 6 + Tailwind v4 (`@tailwindcss/vite`, tokens in `globals.css`, no
config file), react-router 7, framer-motion, lucide, Geist via fontsource, `@/` alias in
both `vite.config.ts` and `tsconfig.app.json`. Typecheck 0.

Ported from `nhyira-os`: the oklch token system and `.dark` variant, the grid-paper body,
`cn()`, the theme provider, the `AppShell`/`Navbar`/`Footer` shape. Palette retuned warm
paper + forest green + clay, so it reads as its own brand rather than a recolour.

**Catalog is 12 chairs in `src/data/chairs.ts`.** Prices are **integer cents** everywhere —
`formatPrice()` in `lib/utils.ts` is the only place they become a string. Never a float.

**`ChairArt` draws every chair in code from its `shape`**, tinted by the selected colorway,
so no product needs an asset. Each `Chair` also has an optional `image` field: **when set,
the photo renders and the SVG is skipped.** That is the seam for swapping in generated
imagery later — a data edit, not a refactor. Do not build a second image path.

**Notes on the brand, which are not negotiable:** Perch is an independent shop that sells
*to* Calvin students. It is not Calvin University's store, never speaks in the university's
voice, and uses none of its marks. The footer says so. Checkout is simulated — no payment
processor, no real order, and the UI must say that plainly rather than implying otherwise.

---

## SS-002 — Cart, checkout, confirmation. **Claude New.** DISPATCHED 2026-09-01

**Your lane, top to bottom. `src/lib/cart.tsx` already works — read it first.** It holds
lines as `{ slug, colorwayId, qty }`, persists to `localStorage`, drops lines whose slug no
longer matches a chair, and exposes `count`, `subtotalCents`, `shippingCents`, `taxCents`,
`totalCents`, `add`, `setQty`, `remove`, `clear`. Shipping is $19 flat, **free at $250+**;
tax is 6%. Extend it if you need to; you own it now.

Build, in this order — **each step committed and pushed before you start the next**, so a
half-finished checkout never blocks the cart from being demoed:

1. **`src/routes/Cart.tsx`** — line items with `ChairArt` thumb, colorway name, quantity
   stepper, remove, live totals, an empty state that links to `/shop`, and a button to
   `/checkout`.
2. **`src/lib/orders.ts`** — create an `Order` (see `lib/types.ts`), persist it to
   `localStorage` keyed by id, read one back by id. Order ids should be short and readable
   (`PCH-4K2M9`), not a uuid.
3. **`src/routes/Checkout.tsx`** — name, email, dorm, room number. **Real validation with
   real inline errors**, not `required` alone; an invalid submit must not navigate. On
   submit: build the order, clear the cart, navigate to `/order/:id`.
4. **`src/routes/OrderConfirmation.tsx`** — read the order by id and show it. **Handle the
   unknown-id case** — someone will refresh or paste a stale link, and a blank page there
   is the bug a grader finds first.

**Three things worth getting right rather than fast:**

- **The cart is cleared before the confirmation page reads the order.** Confirmation must
  read from the order store, never from cart state — otherwise it renders empty. This is
  the single most common way this feature breaks.
- **A cart line is `(slug, colorwayId)`, not `slug`.** The same chair in two colorways is
  two lines. Do not collapse them.
- **Say it is simulated.** One quiet line on the checkout form that no payment is taken and
  no order is really placed. The footer says it too. Do not build a fake card-number field
  — no card inputs anywhere, even dummy ones.

**Do not touch** `Home.tsx`, `Shop.tsx`, `ChairDetail.tsx`, `ChairArt.tsx`, `chairs.ts`,
`types.ts`, `App.tsx`, or `globals.css` — all OG's, all being edited right now. Use
`.surface` and `.eyebrow` from `globals.css` and the existing Tailwind tokens
(`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`) so it matches without
you adding CSS.

**Post progress here as `## SS-002 …` entries as you land each step.** A finished feature
nobody wrote down is a feature the project does not have.

---

## SS-001 — Home, Shop, ChairDetail. **Claude OG.** IN PROGRESS 2026-09-01

Landing with hero + featured, catalog with category filter / price sort / instant search
(URL-synced via `?category=`, which `Navbar` already links into), and the product page with
colorway switching and add-to-cart.

---

## Open items

*(Cross-lane requests and blockers go here. Name the seat you need, keep it to one line.)*

- **Claude New:** the site is feature-complete and verified — do not start new work without
  a board entry dispatching it. The product configurator is **parked by owner decision**,
  not dropped; it becomes SS-004 only if the owner calls for it.
- **Both seats:** `AnimatePresence` is banned in this codebase — see SS-003. If you want an
  exit animation, raise it here first.
