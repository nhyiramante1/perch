# Handoff — Claude New

> **Written 2026-09-01 by Claude OG at project start.** Read **`WORKPLAN.md` first** — it is
> the board and it wins wherever this file disagrees with it. This file is context; the
> board is instruction.

## The situation

**One night, about two hours, ungraded.** The point is to demonstrate web-dev skill, not to
ship a product. The owner is driving from the Claude OG seat and may issue instructions to
either seat.

**Two seats only.** Claude OG (driver, board, foundation, catalog pages) and you. There is
**no review gate tonight** — you commit straight to `main`. That trust is the reason the
lane rule matters more than usual: nobody is going to catch a cross-lane edit before it
lands on top of someone's in-flight work.

## The three rules

1. **Stay in your lane.** The table in `WORKPLAN.md` is exhaustive. Need something outside
   it? Write it under **Open items** on the board and keep moving. Do not edit across, do
   not block.
2. **`git pull --rebase` before every push, and push every 10–15 minutes.** Both seats are
   writing to `main` at once.
3. **Write what you finished on the board.** An entry per step, not one at the end.

## What already exists, so you do not rebuild it

- **`src/lib/cart.tsx` works and is now yours.** Provider is already mounted in `App.tsx`,
  and `Navbar` already renders the badge off `count`. Read it before writing anything.
- **`src/lib/types.ts`** holds `Chair`, `CartLine`, `Order`, `Colorway`, `Category`. `Order`
  is already shaped for what you need to build.
- **`src/data/chairs.ts`** — 12 chairs. `chairBySlug(slug)` is exported.
- **`ChairArt`** renders any chair: `<ChairArt chair={chair} color={hex} />`. Use it for
  cart thumbnails. It handles its own sizing off the parent box.
- **`formatPrice(cents)`** in `lib/utils.ts`. **Prices are integer cents everywhere.** The
  only float in the codebase is the tax rate, and it is rounded on the way out.
- **`.surface` and `.eyebrow`** classes in `globals.css`, plus the full Tailwind token set.
  You should not need to write new CSS.

## Hazards specific to your lane

**The confirmation page must read from the order store, not from cart state.** Checkout
clears the cart; a confirmation that reads cart state renders empty. This breaks more
checkout flows than anything else.

**Refreshing `/order/:id` must work**, and an unknown id must render something honest
rather than crashing or blanking. Someone will refresh that page while looking at it.

**A cart line is keyed by `(slug, colorwayId)`.** Two colorways of one chair are two lines.

**No card fields.** Checkout is simulated and must say so. A realistic-looking payment form
is the one thing that would make this demo worse rather than better — do not build one,
even with dummy values.

## Dev

```bash
npm run dev
```

Serves on `http://127.0.0.1:3200`. `npx tsc -b` must exit 0 before you push.
