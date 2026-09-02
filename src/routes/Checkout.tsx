import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Lock } from "lucide-react"

import { useCart } from "@/lib/cart"
import { createOrder } from "@/lib/orders"
import { formatPrice } from "@/lib/utils"

type Field = "name" | "email" | "dorm" | "room"

const FIELDS: Array<{
  id: Field
  label: string
  type: string
  placeholder: string
  autoComplete: string
}> = [
  { id: "name", label: "Full name", type: "text", placeholder: "Ama Mensah", autoComplete: "name" },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.edu",
    autoComplete: "email",
  },
  {
    id: "dorm",
    label: "Residence hall",
    type: "text",
    placeholder: "Your hall",
    autoComplete: "address-line1",
  },
  { id: "room", label: "Room", type: "text", placeholder: "214B", autoComplete: "address-line2" },
]

/** Deliberately permissive but not decorative: one @, a dot in the domain, no spaces. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** Digits, optionally followed by a letter — 214, 214B, 7. */
const ROOM_RE = /^\d{1,4}[A-Za-z]?$/

type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>

function validate(values: Values): Errors {
  const errors: Errors = {}

  const name = values.name.trim()
  if (!name) errors.name = "Enter your name so we know who to hand it to."
  else if (name.length < 2) errors.name = "That looks too short to be a name."

  const email = values.email.trim()
  if (!email) errors.email = "Enter an email — the receipt goes here."
  else if (!EMAIL_RE.test(email)) errors.email = "That does not look like an email address."

  const dorm = values.dorm.trim()
  if (!dorm) errors.dorm = "Which hall should we deliver to?"
  else if (dorm.length < 2) errors.dorm = "Use the full name of your hall."

  const room = values.room.trim()
  if (!room) errors.room = "Add a room number."
  else if (!ROOM_RE.test(room)) errors.room = "Room should look like 214 or 214B."

  return errors
}

export default function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)

  // Checkout clears the cart on success, which would otherwise re-render this
  // screen as "nothing to check out" for the instant before the route changes.
  const placedRef = useRef(false)

  const [values, setValues] = useState<Values>({ name: "", email: "", dorm: "", room: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  if (cart.lines.length === 0 && !placedRef.current) return <NothingToCheckOut />

  function update(field: Field, value: string) {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      // Once a submit has failed, re-check as they type so an error clears the
      // moment it is fixed rather than only on the next submit.
      if (submitted) setErrors(validate(next))
      return next
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const found = validate(values)
    setErrors(found)

    const firstInvalid = FIELDS.find((f) => found[f.id])
    if (firstInvalid) {
      // An invalid submit must not navigate — it puts the cursor on the problem.
      formRef.current?.querySelector<HTMLInputElement>(`#field-${firstInvalid.id}`)?.focus()
      return
    }

    const order = createOrder({
      lines: cart.lines,
      subtotalCents: cart.subtotalCents,
      shippingCents: cart.shippingCents,
      taxCents: cart.taxCents,
      totalCents: cart.totalCents,
      customer: {
        name: values.name.trim(),
        email: values.email.trim(),
        dorm: values.dorm.trim(),
        room: values.room.trim(),
      },
    })

    placedRef.current = true
    cart.clear()
    // `replace` so Back does not return to a checkout whose cart is now empty.
    navigate(`/order/${order.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        Where is it going?
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <form ref={formRef} noValidate onSubmit={handleSubmit} className="surface p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const error = errors[field.id]
              const errorId = `error-${field.id}`
              return (
                <div
                  key={field.id}
                  className={field.id === "name" || field.id === "email" ? "sm:col-span-2" : ""}
                >
                  <label
                    htmlFor={`field-${field.id}`}
                    className="block text-sm font-medium"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`field-${field.id}`}
                    name={field.id}
                    type={field.type}
                    inputMode={field.id === "email" ? "email" : "text"}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    value={values[field.id]}
                    onChange={(e) => update(field.id, e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={`mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/40 ${
                      error ? "border-destructive" : "border-border"
                    }`}
                  />
                  {error ? (
                    <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
                      {error}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>

          <p className="mt-6 flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              This checkout is simulated for a course project. No payment is taken, no card
              details are collected, and no order is really placed.
            </span>
          </p>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Place simulated order
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <aside className="surface sticky top-24 p-6">
          <h2 className="font-heading text-lg font-semibold">
            {cart.count} {cart.count === 1 ? "chair" : "chairs"}
          </h2>

          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <SummaryRow label="Subtotal" value={formatPrice(cart.subtotalCents)} />
            <SummaryRow
              label="Delivery"
              value={cart.shippingCents === 0 ? "Free" : formatPrice(cart.shippingCents)}
            />
            <SummaryRow label="Tax" value={formatPrice(cart.taxCents)} />
            <div className="mt-2 border-t border-border pt-3">
              <SummaryRow label="Total" value={formatPrice(cart.totalCents)} strong />
            </div>
          </dl>

          <Link
            to="/cart"
            className="mt-6 block text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={strong ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-mono font-semibold" : "font-mono"}>{value}</dd>
    </div>
  )
}

function NothingToCheckOut() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        There is nothing to check out
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your cart is empty, so there is nothing to send anywhere yet.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Browse chairs
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
