import { chairBySlug } from "@/data/chairs"
import { describeChoices, unitPriceCents } from "@/lib/pricing"
import type { CartLine, Order } from "@/lib/types"

const KEY = "perch-orders"

/** No O/0, I/1, S/5 — these ids get read aloud and typed by hand. */
const ID_ALPHABET = "ABCDEFGHJKLMNPQRTUVWXYZ23456789"
const ID_LENGTH = 5

/**
 * Placed orders, id -> order.
 *
 * The confirmation page reads from here and never from cart state — checkout
 * clears the cart before navigating, so a confirmation sourced from the cart
 * would always render empty.
 *
 * A same-session mirror sits in front of localStorage. Private-mode browsers
 * can refuse to persist, and an order the user just placed must still be
 * readable on the very next screen even when the write was dropped.
 */
const memoryStore = new Map<string, Order>()

function readAll(): Record<string, Order> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {}
    return parsed as Record<string, Order>
  } catch {
    return {}
  }
}

function writeAll(orders: Record<string, Order>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(orders))
  } catch {
    /* storage unavailable or full; the in-memory mirror still serves this session */
  }
}

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false
  const o = value as Partial<Order>
  return (
    typeof o.id === "string" &&
    typeof o.placedAt === "string" &&
    Array.isArray(o.lines) &&
    typeof o.totalCents === "number" &&
    typeof o.customer === "object" &&
    o.customer !== null
  )
}

function randomId(): string {
  let id = ""
  for (let i = 0; i < ID_LENGTH; i += 1) {
    id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]
  }
  return `PCH-${id}`
}

function nextOrderId(existing: Record<string, Order>): string {
  // 31^5 ids makes a clash vanishingly unlikely, but overwriting somebody's
  // order is bad enough to be worth five cheap attempts.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = randomId()
    if (!existing[id] && !memoryStore.has(id)) return id
  }
  return `${randomId()}${ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]}`
}

export interface CreateOrderInput {
  lines: CartLine[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  customer: Order["customer"]
}

/**
 * Snapshot the cart into an order and persist it.
 *
 * Names, colourway names and unit prices are copied in at placement time
 * rather than looked up later — a catalogue edit must not rewrite what someone
 * already ordered.
 */
export function createOrder(input: CreateOrderInput): Order {
  const all = readAll()
  const id = nextOrderId(all)

  const lines: Order["lines"] = input.lines.flatMap((line) => {
    const chair = chairBySlug(line.slug)
    if (!chair) return []
    const colorway =
      chair.colorways.find((c) => c.id === line.colorwayId) ?? chair.colorways[0]
    // The chosen build is snapshotted for the same reason the name and price
    // are: the customer approved this configuration at this price, and neither
    // a catalogue edit nor a retired option may rewrite it afterwards.
    const optionLabels = describeChoices(chair, line.options)
    return [
      {
        slug: chair.slug,
        name: chair.name,
        colorwayName: colorway?.name ?? "Standard",
        qty: line.qty,
        // Same function the cart totalled with, so the confirmation cannot
        // disagree with the basket the customer approved.
        unitPriceCents: unitPriceCents(chair, line.options),
        ...(optionLabels.length > 0 ? { optionLabels } : {}),
      },
    ]
  })

  const order: Order = {
    id,
    placedAt: new Date().toISOString(),
    lines,
    subtotalCents: input.subtotalCents,
    shippingCents: input.shippingCents,
    taxCents: input.taxCents,
    totalCents: input.totalCents,
    customer: input.customer,
  }

  memoryStore.set(id, order)
  writeAll({ ...all, [id]: order })

  return order
}

/** Read one order back. Returns null for an unknown or malformed id. */
export function getOrder(id: string): Order | null {
  const fromMemory = memoryStore.get(id)
  if (fromMemory) return fromMemory

  const stored = readAll()[id]
  if (!isOrder(stored)) return null

  memoryStore.set(id, stored)
  return stored
}
