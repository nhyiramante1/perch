import type { Chair } from "@/lib/types"

/**
 * The catalog. Prices are integer cents.
 *
 * Perch is an independent student-run shop that sells to Calvin students — it is
 * not affiliated with the university, so copy here never speaks in Calvin's voice
 * or uses its marks. Dorm and building names are the ones students actually say.
 */
export const CHAIRS: Chair[] = [
  {
    slug: "the-all-nighter",
    name: "The All-Nighter",
    tagline: "Lumbar support for the 2 a.m. problem set",
    priceCents: 18900,
    compareAtCents: 22900,
    category: "desk",
    shape: "task",
    colorways: [
      { id: "graphite", name: "Graphite", hex: "#3f4448" },
      { id: "moss", name: "Moss", hex: "#4a6b4f" },
      { id: "clay", name: "Clay", hex: "#b06a4c" },
    ],
    features: [
      "Adjustable lumbar wedge",
      "Breathable mesh back",
      "Silent-roll casters (RA-approved quiet)",
      "Height range fits standard dorm desks",
    ],
    description:
      "Built for the stretch between 11 p.m. and whenever the draft is done. The mesh back moves with you instead of pinning your shoulders forward, and the casters roll quietly enough that your roommate stays asleep.",
    tags: ["study", "ergonomic", "desk", "mesh", "adjustable", "late night"],
    dimensions: { width: '25"', depth: '26"', height: '38–42"', weight: "31 lb" },
    rating: 4.8,
    reviewCount: 214,
    inStock: true,
    options: [
      {
        id: "armrests",
        label: "Armrests",
        choices: [
          { id: "fixed", label: "Fixed", priceDeltaCents: 0 },
          {
            id: "none",
            label: "None",
            priceDeltaCents: -1500,
            note: "Tucks fully under a shallow desk",
          },
          { id: "adjustable", label: "Adjustable", priceDeltaCents: 2500 },
        ],
      },
      {
        id: "casters",
        label: "Casters",
        choices: [
          { id: "carpet", label: "Carpet", priceDeltaCents: 0 },
          {
            id: "hard",
            label: "Hard floor",
            priceDeltaCents: 1200,
            note: "Softer wheel for tile and laminate",
          },
        ],
      },
    ],
  },
  {
    slug: "hekman-hush",
    name: "Hekman Hush",
    tagline: "A library chair that forgives a four-hour sit",
    priceCents: 24900,
    category: "desk",
    shape: "task",
    colorways: [
      { id: "ink", name: "Ink", hex: "#2c3340" },
      { id: "oat", name: "Oat", hex: "#c9bda4" },
    ],
    features: [
      "Waterfall seat edge, no thigh pressure",
      "Locking recline for reading angles",
      "Felt base pads for hard floors",
    ],
    description:
      "Named for the building where the sit gets long. The recline locks at a reading angle so you are not fighting the chair to hold a book, and the seat edge falls away instead of cutting off your legs.",
    tags: ["library", "reading", "quiet", "recline", "study"],
    dimensions: { width: '26"', depth: '27"', height: '39–43"', weight: "34 lb" },
    rating: 4.6,
    reviewCount: 97,
    inStock: true,
  },
  {
    slug: "commons-lounger",
    name: "Commons Lounger",
    tagline: "The one everybody fights over",
    priceCents: 32900,
    category: "lounge",
    shape: "armchair",
    colorways: [
      { id: "rust", name: "Rust", hex: "#a8553a" },
      { id: "sage", name: "Sage", hex: "#7d9478" },
      { id: "navy", name: "Navy", hex: "#334463" },
    ],
    features: [
      "Deep seat, knees-up friendly",
      "Removable washable cover",
      "Solid maple frame",
      "Arms wide enough for a laptop",
    ],
    description:
      "A proper armchair scaled to a dorm room rather than a living room. Deep enough to sit sideways with your legs over the arm, and the cover comes off for the wash after a semester of coffee.",
    tags: ["lounge", "armchair", "comfy", "washable", "common room"],
    dimensions: { width: '32"', depth: '34"', height: '31"', weight: "48 lb" },
    rating: 4.9,
    reviewCount: 331,
    inStock: true,
    options: [
      {
        id: "fabric",
        label: "Fabric",
        choices: [
          { id: "canvas", label: "Canvas", priceDeltaCents: 0 },
          { id: "corduroy", label: "Corduroy", priceDeltaCents: 2500 },
          {
            id: "boucle",
            label: "Bouclé",
            priceDeltaCents: 4000,
            note: "Warmer, and hides a semester better",
          },
        ],
      },
      {
        id: "legs",
        label: "Legs",
        choices: [
          { id: "maple", label: "Solid maple", priceDeltaCents: 0 },
          { id: "steel", label: "Black steel", priceDeltaCents: 1500 },
        ],
      },
    ],
  },
  {
    slug: "knollcrest-nook",
    name: "Knollcrest Nook",
    tagline: "Corner-shaped, for the corner you have",
    priceCents: 27900,
    category: "lounge",
    shape: "armchair",
    colorways: [
      { id: "plum", name: "Plum", hex: "#6b4560" },
      { id: "fog", name: "Fog", hex: "#9aa3a8" },
    ],
    features: [
      "Fits a 34-inch corner footprint",
      "High back for actual head support",
      "Hidden side pocket for a laptop",
    ],
    description:
      "Most dorm chairs assume you have a wall. This one assumes you have a corner. The high back gives your head somewhere to go, which is the difference between a nap and a neck ache.",
    tags: ["corner", "small space", "high back", "nap", "lounge"],
    dimensions: { width: '30"', depth: '32"', height: '41"', weight: "44 lb" },
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
  },
  {
    slug: "beanbag-theology",
    name: "Beanbag Theology",
    tagline: "For the floor-sitting discussion section",
    priceCents: 12900,
    category: "floor",
    shape: "beanbag",
    colorways: [
      { id: "mustard", name: "Mustard", hex: "#c99a3d" },
      { id: "teal", name: "Teal", hex: "#3f7d80" },
      { id: "charcoal", name: "Charcoal", hex: "#43474b" },
    ],
    features: [
      "Shredded memory foam, not beads",
      "Double-zip child-safe liner",
      "Packs to a duffel for move-out",
    ],
    description:
      "Shredded foam holds a shape instead of slumping into a puddle by October. It compresses into a duffel at move-out, which matters more than anyone admits until May.",
    tags: ["beanbag", "floor", "dorm", "cheap", "movable", "foam"],
    dimensions: { width: '38"', depth: '38"', height: '30"', weight: "19 lb" },
    rating: 4.4,
    reviewCount: 402,
    inStock: true,
  },
  {
    slug: "floor-rocker",
    name: "Floor Rocker",
    tagline: "Legless, backed, and weirdly great",
    priceCents: 9900,
    category: "floor",
    shape: "rocker",
    colorways: [
      { id: "black", name: "Black", hex: "#2f3134" },
      { id: "cream", name: "Cream", hex: "#ded3bd" },
    ],
    features: [
      "Folds flat under a bed",
      "Padded back with a real hinge",
      "Rocks on a curved base",
    ],
    description:
      "A back and a base and nothing else. It folds flat enough to slide under a lofted bed, and it turns the floor into a place you can actually sit for a movie.",
    tags: ["floor", "folding", "cheap", "gaming", "movie night"],
    dimensions: { width: '24"', depth: '28"', height: '18"', weight: "11 lb" },
    rating: 4.2,
    reviewCount: 176,
    inStock: true,
  },
  {
    slug: "the-roommate",
    name: "The Roommate",
    tagline: "The extra chair you need exactly twice a week",
    priceCents: 6900,
    category: "compact",
    shape: "folding",
    colorways: [
      { id: "birch", name: "Birch", hex: "#c8a97a" },
      { id: "slate", name: "Slate", hex: "#5b6570" },
    ],
    features: [
      "Folds to 3 inches",
      "Hangs on a closet hook",
      "Holds 280 lb",
    ],
    description:
      "Nobody has room for a guest chair, and everybody needs one when a study group turns up. This folds to three inches and hangs on the back of the closet door until then.",
    tags: ["folding", "guest", "compact", "cheap", "storage"],
    dimensions: { width: '18"', depth: '20"', height: '32"', weight: "9 lb" },
    rating: 4.3,
    reviewCount: 288,
    inStock: true,
  },
  {
    slug: "loft-stool",
    name: "Loft Stool",
    tagline: "Tall enough for a lofted-bed desk",
    priceCents: 8900,
    category: "compact",
    shape: "stool",
    colorways: [
      { id: "walnut", name: "Walnut", hex: "#6b4a33" },
      { id: "white", name: "White", hex: "#e6e2da" },
      { id: "forest", name: "Forest", hex: "#3c5a44" },
    ],
    features: [
      "29-inch seat height",
      "Footring at the right rung",
      "Tucks fully under a raised desk",
    ],
    description:
      "Raise your desk and every normal chair becomes useless. This is the height that fixes it, with a footring where your feet actually land.",
    tags: ["stool", "loft", "tall", "compact", "desk"],
    dimensions: { width: '15"', depth: '15"', height: '29"', weight: "13 lb" },
    rating: 4.5,
    reviewCount: 143,
    inStock: true,
  },
  {
    slug: "quad-hammock",
    name: "Quad Hammock",
    tagline: "Two trees and a free afternoon",
    priceCents: 14900,
    compareAtCents: 17900,
    category: "outdoor",
    shape: "hammock",
    colorways: [
      { id: "sunset", name: "Sunset", hex: "#d1743f" },
      { id: "lake", name: "Lake", hex: "#3d6f96" },
    ],
    features: [
      "Tree-safe wide straps",
      "Packs to the size of a water bottle",
      "Rated to 400 lb",
    ],
    description:
      "Wide straps so the bark survives, and a stuff sack the size of a water bottle so it lives in your backpack from April onward.",
    tags: ["hammock", "outdoor", "quad", "portable", "spring"],
    dimensions: { width: '110"', depth: '55"', height: "—", weight: "1.4 lb" },
    rating: 4.7,
    reviewCount: 519,
    inStock: true,
  },
  {
    slug: "seminary-pond-bench",
    name: "Seminary Pond Bench",
    tagline: "A two-person bench that folds into a backpack",
    priceCents: 11900,
    category: "outdoor",
    shape: "bench",
    colorways: [
      { id: "olive", name: "Olive", hex: "#6a7345" },
      { id: "sand", name: "Sand", hex: "#c5b393" },
    ],
    features: [
      "Aluminium frame, ripstop deck",
      "Seats two, folds to a sleeve",
      "Feet that do not sink in wet grass",
    ],
    description:
      "Wide feet keep it on top of soft ground instead of sinking, which is most of what a portable bench needs to get right. It folds into a sleeve you can strap to a bag.",
    tags: ["bench", "outdoor", "portable", "two person", "pond"],
    dimensions: { width: '47"', depth: '16"', height: '17"', weight: "6 lb" },
    rating: 4.4,
    reviewCount: 88,
    inStock: true,
  },
  {
    slug: "night-owl-recliner",
    name: "Night Owl Recliner",
    tagline: "Reclines further than your syllabus allows",
    priceCents: 39900,
    category: "lounge",
    shape: "armchair",
    colorways: [
      { id: "espresso", name: "Espresso", hex: "#4a3a30" },
      { id: "storm", name: "Storm", hex: "#4c5560" },
    ],
    features: [
      "Three locked recline positions",
      "Pop-out footrest",
      "USB-C port in the arm",
    ],
    description:
      "A real recliner shrunk to dorm scale. The arm has a USB-C port, so the chair charges the laptop that keeps you in the chair.",
    tags: ["recliner", "lounge", "usb", "premium", "nap"],
    dimensions: { width: '31"', depth: '35–58"', height: '40"', weight: "62 lb" },
    rating: 4.6,
    reviewCount: 71,
    inStock: false,
  },
  {
    slug: "chapel-stack",
    name: "Chapel Stack",
    tagline: "Stack six in the space of one",
    priceCents: 5900,
    category: "compact",
    shape: "stool",
    colorways: [
      { id: "bone", name: "Bone", hex: "#ddd6c6" },
      { id: "brick", name: "Brick", hex: "#9c4f3f" },
      { id: "pine", name: "Pine", hex: "#48604a" },
    ],
    features: [
      "Stacks six high",
      "Molded seat with a real curve",
      "Wipe-clean shell",
    ],
    description:
      "The cheapest honest chair here. One is fine; six stacked in a closet is the actual point, for the floor that hosts everything.",
    tags: ["stacking", "cheap", "compact", "events", "floor lounge"],
    dimensions: { width: '19"', depth: '21"', height: '31"', weight: "8 lb" },
    rating: 4.1,
    reviewCount: 236,
    inStock: true,
  },
]

export function chairBySlug(slug: string) {
  return CHAIRS.find((c) => c.slug === slug)
}
