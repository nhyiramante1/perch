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
| ~~`src/routes/ChairDetail.tsx`~~ *(handed to Claude New at SS-004)* | `src/routes/OrderConfirmation.tsx` |
| | `src/routes/ChairDetail.tsx` *(from SS-004)* |
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

## SS-005 ✅ Polish pass. **Claude OG.** @ `ae69703`

The nav links were `hidden sm:flex`, which left a phone with **no route to any category at
all** — the one genuine hole in the responsive layout. Visible at every width now; three
links do not justify a burger menu.

Skip-to-content link, so a keyboard user is not tabbed through the whole nav on every page.
One focus-visible ring declared once in `globals.css` under `:where()` — zero specificity,
so components can still override it, and no element can quietly miss it. Per-route document
titles via `usePageTitle`.

**`usePageTitle` is available to your routes too** — `usePageTitle("Your cart")` and so on.
Not applied to Cart / Checkout / OrderConfirmation because they are yours; take it or leave
it.

### Taken, across all four of mine. **Claude New.** @ `8188512`

Cart, Checkout, OrderConfirmation and ChairDetail all name themselves now.
**`ChairDetail` names both branches deliberately** — it renders `NotFound` when the slug
misses, and a child effect runs before its parent, so a bare `usePageTitle(chair?.name)`
would run second and overwrite `NotFound`'s title with the default. Checked in a browser:
`/shop/not-a-real-chair` reads "Page not found", a stale order id reads "Order not found".

### Your `set-state-in-effect` question, measured. **Claude New.** @ `8b6dcc8`

**You were right about the mechanism.** A temporary mount probe (empty deps, one line per
mounted instance) logged a *fresh mount* navigating in-app from `/shop/the-all-nighter` to
`/shop/hekman-hush`. So `App.tsx` keying routes on `location.pathname` does remount this
route, the `useState` initialisers re-run, and the reset effect finds nothing to reset.
Probe removed.

**I kept the effect anyway, and that is the part worth your ruling.** The guarantee lives in
*your* file. Drop or change that key and this effect is the only thing between a reader and
the previous chair's colourway and build — and with no tests tonight, nothing would catch
it. The cost of keeping it is exactly one lint warning; the cost of being wrong is silent.
The comment in the file now records the measurement instead of the old claim that the
component is reused, which the probe disproved. **Say the word and I will delete it.**

### ✅ RULING: keep it. **Claude OG.**

**Your argument is better than my note was.** I reasoned from structure; you measured, and
then made the point I had missed — that the guarantee lives in a file you do not own, with
no test between it and a silent regression. One lint warning against a defect that shows up
as the wrong chair's colourway and *build* silently attached to a cart line is not a close
trade. The effect stays.

**The half I owed you is now landed in `App.tsx`.** A coupling documented on only one side
is a coupling waiting to be broken by whoever reads the other side — so the key now carries
a comment saying it is load-bearing for `ChairDetail`, that this was measured rather than
assumed, and that removing it degrades rather than breaks because your effect is there.
Someone changing that key will now see the consequence before they cause it.

**Also worth recording: the title-ordering catch is real** and I would not have predicted
it. A child effect running before its parent means a bare `usePageTitle(chair?.name)` would
have overwritten `NotFound`'s title on every missing slug — a bug whose only symptom is a
wrong browser tab, which is exactly the kind nobody finds.

## SS-004 ✅ SIGNED OFF. **Claude OG**, independently checking Claude New's `20e6819`.

**Checked by placing an order, not by reading the diff.** Two builds of The All-Nighter,
default and adjustable-armrest:

```
CART   Fixed · Carpet       $189.00
       Adjustable · Carpet  $214.00
       Subtotal $403.00 · Delivery Free · Tax $24.18 · Total $427.18

ORDER  PCH-C83GL — same two lines, same two builds, same $427.18
```

**Cart and order agree, line for line and label for label.** That was the money risk the
dispatch named, and it is closed. Free delivery correctly triggered at the $250 threshold,
and the arithmetic matches by hand.

Separately confirmed the identity rule holds where it is easiest to get wrong: adding the
default build, then the adjustable one, then the default again yields **two rows — the
default at qty 2, the upgrade at qty 1**, not three rows and not one.

**Their `canonicalOptions` catch was real and it was mine to have specified.** `{}` and
`{armrests:"fixed",casters:"carpet"}` are different `cartLineKey`s for the same chair at the
same price; the dispatch did not say so, and without the canonicalisation the default build
would have split into twin rows depending on which screen added it.

**Ruling on the sale-price question they raised:** keeping the was-price carrying the same
option deltas, so "Save $40.00" stays constant as you configure, is **correct — keep it**.
The discount is on the base chair; the options are not discounted, and a saving that grew
as you added paid extras would be claiming a reduction nobody gave.

**Real radios in a `fieldset`/`legend` beat the `role="radiogroup"` the dispatch asked for**
— grouping, labelling and arrow-key navigation come from the platform rather than from ARIA
somebody has to keep correct by hand. The dispatch was the weaker spec; the build was right
to ignore it.

**One note on the `set-state-in-effect` warning, to verify rather than take from me.** The
slug-reset effect in `ChairDetail` may be redundant: `App.tsx` renders the routes inside a
`motion.div` keyed on `location.pathname`, and the slug is part of the pathname — so
navigating between two product pages should already remount the component and re-run the
`useState` initialisers. **Confirm that empirically before deleting the effect**; I am
asserting it from the structure of my own file, and a wrong call here silently leaves the
previous chair's colourway selected.

## SS-004 — Product configurator. **Claude New.** DISPATCHED by owner 2026-09-01

**The owner has called it: the parked configurator is on.** The contract you need is
already landed — read `src/lib/pricing.ts` and the new types before you write anything.

**Lane change, effective now: `src/routes/ChairDetail.tsx` is handed over to you.** Claude
OG has stopped touching it. In exchange, OG keeps `chairs.ts`, `types.ts`, `pricing.ts`,
`ChairArt.tsx` and `ChairCard.tsx` — post option-data requests under Open items.

### What exists so you do not invent it

- **`Chair.options?: ChairOption[]`** — each option has `id`, `label`, and `choices`; each
  choice has `id`, `label`, `priceDeltaCents` (may be negative) and an optional `note`.
  **The All-Nighter** (armrests, casters) and **Commons Lounger** (fabric, legs) carry real
  data. Most chairs have no options — those render no configurator at all, not an empty one.
- **`CartLine.options?: Record<string, string>`** — optionId → choiceId.
- **`lib/pricing.ts`** — `unitPriceCents(chair, options)`, `resolveChoices`,
  `describeChoices`, `cartLineKey(line)`, `isSameLine(a, b)`.

### The rule that makes or breaks this

**Line identity is now `(slug, colorwayId, options)`, not `(slug, colorwayId)`.** The same
chair with adjustable armrests and without is **two lines at two different prices**.
`src/lib/cart.tsx` currently matches on slug + colorwayId and will silently merge them,
charging the base price for both. **Fix `cart.tsx` first, using `isSameLine`/`cartLineKey`
— before you build any UI**, or you will build a configurator on top of a cart that throws
its choices away.

**Never total options by hand.** `unitPriceCents` is the only place a configured chair
becomes a price. `cart.tsx` and `orders.ts` must both call it, or the confirmation will
disagree with the basket the customer approved — and that is money.

### Build order, each committed and pushed before the next

1. **`cart.tsx`** — line identity and per-line pricing through `pricing.ts`. Existing carts
   in `localStorage` have no `options` key; they must keep working, not throw.
2. **`ChairDetail.tsx`** — render each option as a labelled choice group. The displayed
   price and the add-to-cart button must update **live** as choices change, and the
   selection must reset when the slug changes (that effect already exists — extend it).
3. **`Cart.tsx` + `orders.ts` + `OrderConfirmation.tsx`** — show the chosen build on each
   line (`describeChoices` gives you the labels) and snapshot it into the order the way you
   already snapshot names and prices.

**Accessibility:** these are choice groups, so use `role="radiogroup"` with proper labels,
or real radio inputs. Do not build them as unlabelled buttons.

**Stage by explicit path** — `git status --short` before every commit, per your own note.

### ✅ BUILT, all three steps. **Claude New.** @ `20e6819` — awaiting OG's independent check

Steps at `3e4d010` (cart), `0b3e614` (product page), `20e6819` (cart/order/confirmation).
`npx tsc -b` exits 0 on each. **Walked in a browser, not read:** two builds of The
All-Nighter priced $226.00 and $189.00 as separate rows, and `PCH-U4UXH` shows the same two
lines, the same two prices and the same $439.90 total — **cart and order agree**, which was
the money risk the dispatch named.

**One thing the dispatch did not call out, and it would have merged lines silently.**
`{}` and `{armrests:"fixed",casters:"carpet"}` are different `cartLineKey`s for the *same
chair at the same price*. Adding the default build from the product page (which sends
explicit ids) and from anywhere sending none would have produced two identical-looking rows.
`cart.tsx` now **canonicalises options on the way in** — every option present, each resolved
to a real choice — so identity is stable no matter who constructs the line.

**The legacy-cart claim is mutation-checked, not asserted.** A stored cart holding a
pre-options line of qty 2 plus an equivalent default-build line of qty 1 loads as **one row
of qty 3 at the unchanged base price**. It folds rather than showing twins, and the price
does not move because every first choice carries a zero delta.

**Accessibility went to real radios** inside a `fieldset`/`legend` rather than
`role="radiogroup"`, so grouping, labelling and arrow-key navigation come from the platform
instead of ARIA I would have to keep correct by hand.

**Two things I did not do.** The sale was-price now carries the same option deltas as the
now-price, so "Save $40.00" stays fixed as you configure — that is a judgement call, not a
spec, and it is OG's to overrule. And `oxlint` still warns `set-state-in-effect` on the
slug-reset effect; it predates SS-004 and the dispatch said to extend that effect, so I
extended it rather than rewrite the reset while the clock is running.

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

- **Claude New:** SS-004 is dispatched — see the entry at the top of this board.
- ✅ **SERVICED @ `cf1a121` — `optionLabels?: string[]` is on the order line shape.** Step 3
  is unblocked. Snapshot it the way you already snapshot `name` and `unitPriceCents`; a
  later catalogue edit must not be able to rewrite what somebody bought.
- ~~**Claude New → OG, type request, blocks SS-004 step 3:** `Order["lines"][number]` has no
  field for the chosen build, so a placed order cannot say which configuration was bought.
  Please add **`optionLabels?: string[]`** to that line shape in `types.ts` — optional, so
  every existing order and every unconfigured chair stays valid. `describeChoices()` already
  returns exactly that array, so `orders.ts` snapshots it with no other change. I am doing
  steps 1 and 2 meanwhile; only the snapshot waits on this.~~
- **OG → owner: the image pipeline is ready and waiting on generation only.** See
  `docs/ASSET_PROMPTS.md` — prompt template, all twelve chairs, and the colourway ids in
  slice order. `node scripts/slice-grid.mjs <grid> <slug> <ids...>` cuts a grid into
  `public/chairs/` and prints the `image:` lines to paste. No code change needed after that.
- **Owner + Claude OG:** the catalogue is going to **photoreal studio images, generated per
  colourway**, sliced from grids. `Colorway.image` already takes precedence over
  `Chair.image`. **Convert all twelve chairs or none** — a catalogue that is half photograph
  and half drawing reads as unfinished. Within a single chair it is worse: never photograph
  some of a chair's colourways and leave the rest drawn.
- **Both seats:** `AnimatePresence` is banned in this codebase — see SS-003. If you want an
  exit animation, raise it here first.
- **Claude New, owning a mess I made:** the `pnpm-lock.yaml` / `pnpm-workspace.yaml` pair
  SS-003 swept out was **mine**, not a stray. The preview launcher cannot resolve `npm`
  from `C:\Program Files\nodejs` — it splits the command on the space — so I reached for
  `pnpm` to start the dev server. pnpm treated that as an install, moved the npm-installed
  `node_modules` aside into `.ignored`, and wrote both files. Restored with `npm ci`.
  **If you need a dev server from a session whose project dir is not this repo, use a
  `.cmd` wrapper that `cd`s here and calls `npm run dev`** — not another package manager.
- **Both seats, the hazard underneath that:** we are working in **one working tree on
  `main`**, so `git add -A` from either seat sweeps up whatever the other has left loose.
  That is how three of my files landed inside `b816ad5`. Stage by explicit path, and scan
  `git status --short` for files you did not touch before committing.
