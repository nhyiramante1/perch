import { useId } from "react"

import { cn } from "@/lib/utils"
import type { Chair, ChairShape, Colorway } from "@/lib/types"

interface ChairArtProps {
  chair: Chair
  /** Hex of the selected colorway. Falls back to the chair's first colorway. */
  color?: string
  /**
   * The selected colorway itself. Preferred over `color` where the caller has
   * it, because only the full object can carry a per-colorway photo.
   */
  colorway?: Colorway
  className?: string
}

/**
 * Renders a chair.
 *
 * Resolution order is deliberate and each step is independently adoptable:
 *
 *   1. the selected colorway's own photo, if it has one
 *   2. the chair's single photo, if it has one
 *   3. the code-drawn SVG, tinted by the selected colorway
 *
 * So the catalogue can be all drawn, all photographed, or any mixture, and a
 * chair photographed in only some of its colours falls back to the drawing for
 * the rest rather than showing the wrong colour. Adding imagery stays a data
 * edit — never a second render path bolted on at a call site.
 */
export default function ChairArt({ chair, color, colorway, className }: ChairArtProps) {
  const tint = colorway?.hex ?? color ?? chair.colorways[0]?.hex ?? "#6b7280"
  const photo = colorway?.image ?? chair.image

  if (photo) {
    return (
      <img
        src={photo}
        alt={colorway ? `${chair.name} in ${colorway.name}` : chair.name}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    )
  }

  return <ChairSvg shape={chair.shape} tint={tint} label={chair.name} className={className} />
}

function ChairSvg({
  shape,
  tint,
  label,
  className,
}: {
  shape: ChairShape
  tint: string
  label: string
  className?: string
}) {
  // useId keeps gradient/filter ids unique when many chairs render at once —
  // duplicate ids would make every card pick up the first card's gradient.
  const uid = useId().replace(/:/g, "")
  const grad = `g-${uid}`
  const shade = `s-${uid}`

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="1" />
          <stop offset="100%" stopColor={tint} stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Floor shadow, shared by every shape so they sit in the same room. */}
      <ellipse cx="100" cy="176" rx="56" ry="8" fill="currentColor" opacity="0.1" />

      <g fill={`url(#${grad})`} stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        {shape === "task" && <TaskChair shade={shade} />}
        {shape === "armchair" && <ArmChair shade={shade} />}
        {shape === "stool" && <Stool shade={shade} />}
        {shape === "beanbag" && <Beanbag shade={shade} />}
        {shape === "folding" && <FoldingChair shade={shade} />}
        {shape === "rocker" && <FloorRocker shade={shade} />}
        {shape === "hammock" && <Hammock shade={shade} />}
        {shape === "bench" && <Bench shade={shade} />}
      </g>
    </svg>
  )
}

/* Each shape draws in the same 200×200 box with the floor at y≈176. Frames and
   hardware use `currentColor` so they follow the theme; upholstery takes the
   colorway gradient from the parent <g>. */

function TaskChair({ shade }: { shade: string }) {
  return (
    <>
      {/* mesh back */}
      <rect x="72" y="30" width="58" height="66" rx="16" />
      <g stroke="currentColor" strokeWidth="1" opacity="0.35" fill="none">
        <line x1="78" y1="46" x2="124" y2="46" />
        <line x1="78" y1="60" x2="124" y2="60" />
        <line x1="78" y1="74" x2="124" y2="74" />
      </g>
      {/* seat */}
      <rect x="62" y="98" width="78" height="18" rx="8" />
      <rect x="62" y="98" width="78" height="18" rx="8" fill={`url(#${shade})`} stroke="none" />
      {/* armrest */}
      <path d="M140 92v14h8" fill="none" strokeLinecap="round" />
      {/* cylinder */}
      <path d="M100 116v28" fill="none" strokeLinecap="round" strokeWidth="5" />
      {/* five-star base */}
      <path
        d="M100 144 62 166M100 144l38 22M100 144l-46-6M100 144l46-6M100 144v22"
        fill="none"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <g fill="currentColor" stroke="none" opacity="0.75">
        <circle cx="61" cy="168" r="4" />
        <circle cx="139" cy="168" r="4" />
        <circle cx="53" cy="138" r="4" />
        <circle cx="147" cy="138" r="4" />
        <circle cx="100" cy="168" r="4" />
      </g>
    </>
  )
}

function ArmChair({ shade }: { shade: string }) {
  return (
    <>
      {/* back */}
      <path d="M46 132V62a16 16 0 0 1 16-16h76a16 16 0 0 1 16 16v70Z" />
      {/* seat cushion */}
      <rect x="42" y="112" width="116" height="26" rx="10" />
      <rect x="42" y="112" width="116" height="26" rx="10" fill={`url(#${shade})`} stroke="none" />
      {/* arms */}
      <rect x="34" y="88" width="20" height="52" rx="10" />
      <rect x="146" y="88" width="20" height="52" rx="10" />
      {/* legs */}
      <path
        d="M52 140v22M148 140v22"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  )
}

function Stool({ shade }: { shade: string }) {
  return (
    <>
      <ellipse cx="100" cy="62" rx="40" ry="12" />
      <path d="M60 62v8a40 12 0 0 0 80 0v-8Z" fill={`url(#${shade})`} />
      {/* splayed legs */}
      <path
        d="M68 74 56 168M132 74l12 94M76 74l6 94M124 74l-6 94"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* footring */}
      <path
        d="M64 128h72"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </>
  )
}

function Beanbag({ shade }: { shade: string }) {
  return (
    <>
      <path d="M100 40c34 0 44 30 52 66 7 32-16 46-52 46s-59-14-52-46c8-36 18-66 52-66Z" />
      <path
        d="M100 40c34 0 44 30 52 66 7 32-16 46-52 46Z"
        fill={`url(#${shade})`}
        stroke="none"
      />
      {/* seams */}
      <g fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.4">
        <path d="M100 42v110" />
        <path d="M74 54c-8 34-8 66 0 96" />
        <path d="M126 54c8 34 8 66 0 96" />
      </g>
    </>
  )
}

function FoldingChair({ shade }: { shade: string }) {
  return (
    <>
      {/* back panel */}
      <rect x="72" y="34" width="56" height="52" rx="6" />
      {/* seat */}
      <rect x="58" y="98" width="84" height="14" rx="6" />
      <rect x="58" y="98" width="84" height="14" rx="6" fill={`url(#${shade})`} stroke="none" />
      {/* X frame */}
      <path
        d="M64 168 136 92M136 168 64 92M72 86v14M128 86v14"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M56 168h24M120 168h24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  )
}

function FloorRocker({ shade }: { shade: string }) {
  return (
    <>
      {/* reclined back */}
      <path d="M62 148 76 62a10 10 0 0 1 10-8h30a10 10 0 0 1 10 10l6 84Z" />
      {/* seat pad */}
      <path d="M56 148h96a8 8 0 0 1 0 16H56a8 8 0 0 1 0-16Z" />
      <path
        d="M104 148h48a8 8 0 0 1 0 16h-48Z"
        fill={`url(#${shade})`}
        stroke="none"
      />
      {/* rocker base */}
      <path
        d="M40 164q60 20 120 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* tufting */}
      <g fill="currentColor" stroke="none" opacity="0.35">
        <circle cx="86" cy="88" r="3" />
        <circle cx="110" cy="88" r="3" />
        <circle cx="86" cy="118" r="3" />
        <circle cx="110" cy="118" r="3" />
      </g>
    </>
  )
}

function Hammock({ shade }: { shade: string }) {
  return (
    <>
      {/* trunks */}
      <path
        d="M26 30v146M174 30v146"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* sag */}
      <path d="M34 74q66 92 132 0 6 46-66 62Q28 120 34 74Z" />
      <path d="M100 136q72-16 66-62 6 46-66 62Z" fill={`url(#${shade})`} stroke="none" />
      {/* straps */}
      <path
        d="M28 62 40 76M172 62l-12 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* weave */}
      <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.35">
        <path d="M46 86q54 62 108 0" />
        <path d="M56 100q44 44 88 0" />
      </g>
    </>
  )
}

function Bench({ shade }: { shade: string }) {
  return (
    <>
      {/* deck */}
      <rect x="26" y="102" width="148" height="18" rx="8" />
      <rect x="100" y="102" width="74" height="18" rx="8" fill={`url(#${shade})`} stroke="none" />
      {/* X legs */}
      <path
        d="M52 120 84 172M84 120 52 172M116 120l32 52M148 120l-32 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* wide feet */}
      <path
        d="M44 172h48M108 172h48"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  )
}
