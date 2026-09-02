import { Link } from "react-router-dom"

import { usePageTitle } from "@/lib/usePageTitle"

export default function NotFound() {
  usePageTitle("Page not found")

  return (
    <div className="flex flex-col items-center gap-4 py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Nothing to sit on here.</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That page does not exist. The chairs are all in one place.
      </p>
      <Link
        to="/shop"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Browse the shop
      </Link>
    </div>
  )
}
