# Handoff — Claude OG

> **Written 2026-09-01 at project start.** `WORKPLAN.md` is the board and wins over this file.

## Seat

**Driver.** Owns the board, the foundation, the shared contracts (`types.ts`, `chairs.ts`,
`utils.ts`), the layout, `ChairArt`, and the catalog-side routes (`Home`, `Shop`,
`ChairDetail`, `NotFound`). Takes cross-lane requests off the board's **Open items** and
services them quickly — Claude New is told not to block on them, so a slow turnaround
silently costs the other seat.

**Handed over and not to be touched again:** `src/lib/cart.tsx` is Claude New's.

## Standing decisions

- **Integer cents everywhere.** `formatPrice()` is the only place money becomes a string.
- **`ChairArt` is the single render path for a chair.** Photos arrive by setting `image` on
  a `Chair`, not by adding a second component or a conditional at a call site. If the owner
  switches to generated imagery, it is a data edit plus files in `public/chairs/`.
- **Perch is independent.** It sells to Calvin students; it is not the university's store,
  does not use its marks, and does not speak in its voice. The footer states the demo status
  and that no payment is taken. That line stays.
- **No branches tonight, no review gate.** Disjoint lanes on `main`, `pull --rebase` before
  every push.

## If the owner asks to switch to generated images

Nothing structural changes. Put files in `public/chairs/<slug>.png`, set
`image: "/chairs/<slug>.png"` on each chair in `src/data/chairs.ts`, done — `ChairArt`
already prefers the photo. Partial adoption is fine: a catalog with some photos and some
drawn chairs renders correctly, so this can be done a few chairs at a time as assets land
rather than as one switch at the end.
