import { useEffect } from "react"

const SUFFIX = "Perch"

/**
 * Sets the document title for a route, restoring nothing on unmount — the next
 * route sets its own. A single-page app that never updates the title leaves
 * every browser tab, history entry and bookmark reading the same thing.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} — Chairs for Small Rooms`
  }, [title])
}
