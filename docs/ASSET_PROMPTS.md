# Generating the catalogue images

Twelve chairs, **29 images**, generated as **12 grids** — one grid per chair, containing
that chair in each of its colourways.

**Why grids and not one image at a time:** ask a model for "the same chair again in green"
and the angle, lens and lighting drift between generations. The colourway picker is exactly
where that drift is visible — you switch colour and the chair appears to jump. One image
containing all the colourways forces the model to hold the pose steady, because it is
drawing them side by side.

**Convert all twelve chairs or none.** A catalogue that is half photograph and half drawing
reads as unfinished. Within a single chair it is worse — never photograph some of a chair's
colourways and leave the rest drawn, or the picker will switch between two different visual
languages.

## The template

Paste this, substituting `{CHAIR}` and `{COLOURS}` from the table below. `{N}` is the number
of colours.

> A professional studio product photograph of {CHAIR}, shown in {N} colourways side by side
> in a single row, arranged as a {N}×1 grid with no gaps, no borders, no labels and no text.
> Every chair is the identical model at the identical three-quarter front angle, identical
> focal length, identical soft studio lighting with a soft shadow beneath, and identical
> framing and scale — the only difference between the cells is the upholstery colour.
> The colours, left to right, are {COLOURS}. The frame, legs and hardware stay the same in
> every cell. Seamless pure white background. Photorealistic, sharp, catalogue quality.
> No people, no props, no room, no watermark, no branding, no logos.

Two rules that matter for slicing: **no gaps or borders between cells** (the script cuts on
equal divisions), and **each cell square-ish**, so the crops match the site's `4/3` and
square frames without distortion.

## The twelve

| # | Slug | `{CHAIR}` | `{COLOURS}` (left → right) |
|---|---|---|---|
| 1 | `the-all-nighter` | a modern ergonomic mesh-back office task chair on a five-star caster base | 3: dark charcoal grey, muted forest green, terracotta clay |
| 2 | `hekman-hush` | a high-back padded library reading chair with a locking recline and four felt-footed legs | 2: deep navy-charcoal, warm oat beige |
| 3 | `commons-lounger` | a deep-seated compact fabric armchair with wide flat arms and solid maple legs | 3: rust orange, sage green, deep navy |
| 4 | `knollcrest-nook` | a high-backed compact corner armchair with a tall headrest | 2: dusty plum, pale fog grey |
| 5 | `beanbag-theology` | a large rounded foam-filled beanbag chair with visible panel seams | 3: mustard yellow, deep teal, charcoal |
| 6 | `floor-rocker` | a legless padded floor rocking chair with a curved base and tufted back | 2: black, warm cream |
| 7 | `the-roommate` | a slim folding chair with an X-frame and a padded seat and back panel | 2: light birch wood, slate grey |
| 8 | `loft-stool` | a tall bar-height stool with a round seat, splayed legs and a metal footring | 3: walnut brown, off-white, forest green |
| 9 | `quad-hammock` | a lightweight camping hammock strung between two straps, hanging in a gentle curve | 2: sunset orange, lake blue |
| 10 | `seminary-pond-bench` | a low two-person portable folding bench with an aluminium frame and a taut fabric deck | 2: olive green, sand beige |
| 11 | `night-owl-recliner` | a compact recliner armchair with a pop-out footrest, shown upright | 2: espresso brown, storm grey |
| 12 | `chapel-stack` | a simple stacking chair with a moulded seat shell and slim metal legs | 3: bone white, brick red, pine green |

## Slicing a grid

Save the generated grid anywhere, then:

```bash
node scripts/slice-grid.mjs ~/Downloads/allnighter.png the-all-nighter graphite moss clay
```

The colourway ids are positional — **left to right, matching the table's colour order**.
They must be the exact ids from `src/data/chairs.ts`:

| Slug | Colourway ids, in order |
|---|---|
| `the-all-nighter` | `graphite moss clay` |
| `hekman-hush` | `ink oat` |
| `commons-lounger` | `rust sage navy` |
| `knollcrest-nook` | `plum fog` |
| `beanbag-theology` | `mustard teal charcoal` |
| `floor-rocker` | `black cream` |
| `the-roommate` | `birch slate` |
| `loft-stool` | `walnut white forest` |
| `quad-hammock` | `sunset lake` |
| `seminary-pond-bench` | `olive sand` |
| `night-owl-recliner` | `espresso storm` |
| `chapel-stack` | `bone brick pine` |

The script writes `public/chairs/<slug>-<colorwayId>.png` and prints the exact `image:` lines
to paste onto each colourway in `src/data/chairs.ts`. Nothing else changes — `ChairArt`
already prefers a colourway's photo over the chair's photo over the drawing, so each chair
switches to photography the moment its colourways carry images.

## If a grid comes out wrong

- **Cells uneven or gapped** — regenerate rather than slice. The script divides equally and
  a gap puts a sliver of white or the neighbouring chair in every crop.
- **One cell's angle differs** — regenerate the grid. Do not slice the good cells and
  hand-generate the odd one; that reintroduces exactly the drift grids exist to prevent.
- **Background not pure white** — fine, as long as it is *consistent* across cells and
  across chairs. Inconsistent backgrounds are more visible in a grid of cards than an
  off-white one.
