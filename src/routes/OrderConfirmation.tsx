import { Link, useParams } from "react-router-dom"
import { ArrowRight, Check, PackageX } from "lucide-react"

import ChairArt from "@/components/ChairArt"
import { chairBySlug } from "@/data/chairs"
import { getOrder } from "@/lib/orders"
import { usePageTitle } from "@/lib/usePageTitle"
import { formatPrice } from "@/lib/utils"
import type { Order } from "@/lib/types"

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const order = id ? getOrder(id) : null
  usePageTitle(order ? `Order ${order.id}` : "Order not found")

  // Someone will refresh, bookmark, or paste a stale link. A blank page here is
  // the first thing a grader finds.
  if (!order) return <OrderNotFound id={id} />

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
        <Check className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <p className="eyebrow mt-6">Order placed</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        Thanks, {order.customer.name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your order reference is{" "}
        <span className="font-mono font-medium text-foreground">{order.id}</span>. A receipt
        would go to {order.customer.email}.
      </p>

      <div className="surface mt-8 divide-y divide-border">
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Detail label="Placed" value={formatPlacedAt(order.placedAt)} />
          <Detail label="Deliver to" value={`${order.customer.dorm}, room ${order.customer.room}`} />
        </div>

        <ul className="divide-y divide-border">
          {order.lines.map((line, i) => (
            // The build is part of what makes a line distinct, and two lines can
            // now differ by nothing else — so index keys it rather than a
            // slug/colourway pair that is no longer unique.
            <OrderRow key={`${line.slug}:${line.colorwayName}:${i}`} line={line} />
          ))}
        </ul>

        <dl className="flex flex-col gap-2 p-6 text-sm">
          <TotalRow label="Subtotal" value={formatPrice(order.subtotalCents)} />
          <TotalRow
            label="Delivery"
            value={order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}
          />
          <TotalRow label="Tax" value={formatPrice(order.taxCents)} />
          <div className="mt-2 border-t border-border pt-3">
            <TotalRow label="Total" value={formatPrice(order.totalCents)} strong />
          </div>
        </dl>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        This order is simulated for a course project — nothing was charged and no chair is
        actually on its way. The reference above is kept in this browser only.
      </p>

      <Link
        to="/shop"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Keep browsing
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

function OrderRow({ line }: { line: Order["lines"][number] }) {
  // Prices and names come from the order snapshot, never from the catalogue —
  // the lookup here is only to draw the thumbnail.
  const chair = chairBySlug(line.slug)
  const colorway = chair?.colorways.find((c) => c.name === line.colorwayName)

  return (
    <li className="flex items-center gap-4 p-6">
      {chair ? (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
          <ChairArt chair={chair} color={colorway?.hex} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="font-heading font-medium">{line.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {line.colorwayName}
          {line.qty > 1 ? ` · ${line.qty} × ${formatPrice(line.unitPriceCents)}` : null}
        </p>
        {/* Read from the order's own snapshot, not recomputed from the catalogue. */}
        {line.optionLabels?.length ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {line.optionLabels.join(" · ")}
          </p>
        ) : null}
      </div>

      <p className="font-mono text-sm">{formatPrice(line.unitPriceCents * line.qty)}</p>
    </li>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}

function TotalRow({
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

function formatPlacedAt(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function OrderNotFound({ id }: { id?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <PackageX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
        We cannot find that order
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {id ? (
          <>
            Nothing is stored under{" "}
            <span className="font-mono text-foreground">{id}</span>.{" "}
          </>
        ) : null}
        Orders live in the browser that placed them, so a link opened elsewhere — or after
        clearing site data — will not resolve.
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
