#!/usr/bin/env node
/**
 * Slice a generated image grid into one file per colourway.
 *
 * Image models are far more consistent when asked for one picture containing a
 * chair in three colours than when asked three times for "the same chair
 * again" — angle, lens and lighting drift between generations, and the
 * colourway picker is exactly where that drift is visible. So we generate
 * grids and cut them here.
 *
 * Uses ffmpeg, which is already on this machine, rather than adding an image
 * dependency to a front-end project that has no other use for one.
 *
 *   node scripts/slice-grid.mjs <grid.png> <slug> <colorwayId...>
 *
 * One colourway id per cell, left to right. Example:
 *
 *   node scripts/slice-grid.mjs ~/Downloads/allnighter.png the-all-nighter graphite moss clay
 *
 * Writes public/chairs/<slug>-<colorwayId>.png and prints the exact `image`
 * lines to paste into src/data/chairs.ts.
 *
 * Pass --rows N for a grid that wraps (cells are then read left-to-right,
 * top-to-bottom).
 */

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = resolve(ROOT, "public/chairs")

// ffmpeg is usually on PATH; fall back to the winget install location.
const WINGET_FF = resolve(
  process.env.LOCALAPPDATA ?? "",
  "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin",
)

function tool(name) {
  for (const candidate of [name, resolve(WINGET_FF, `${name}.exe`)]) {
    try {
      execFileSync(candidate, ["-version"], { stdio: "ignore" })
      return candidate
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error(
    `Could not find ${name}. Install ffmpeg, or put it on PATH, then re-run.`,
  )
}

function parseArgs(argv) {
  const args = []
  let rows = 1
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--rows") {
      rows = Number(argv[i + 1])
      i += 1
      if (!Number.isInteger(rows) || rows < 1) throw new Error("--rows needs a positive integer")
    } else {
      args.push(argv[i])
    }
  }
  const [grid, slug, ...colorways] = args
  if (!grid || !slug || colorways.length === 0) {
    throw new Error(
      "Usage: node scripts/slice-grid.mjs <grid.png> <slug> <colorwayId...> [--rows N]",
    )
  }
  return { grid, slug, colorways, rows }
}

const { grid, slug, colorways, rows } = parseArgs(process.argv.slice(2))

const gridPath = resolve(process.cwd(), grid)
if (!existsSync(gridPath)) throw new Error(`No such file: ${gridPath}`)

const ffprobe = tool("ffprobe")
const ffmpeg = tool("ffmpeg")

const [width, height] = execFileSync(ffprobe, [
  "-v", "error",
  "-select_streams", "v:0",
  "-show_entries", "stream=width,height",
  "-of", "csv=p=0",
  gridPath,
])
  .toString()
  .trim()
  .split(",")
  .map(Number)

const cols = Math.ceil(colorways.length / rows)
// Integer cell sizes: a fractional crop makes ffmpeg round unpredictably and
// leaves a seam of the neighbouring cell along one edge.
const cellW = Math.floor(width / cols)
const cellH = Math.floor(height / rows)

mkdirSync(OUT_DIR, { recursive: true })

console.log(`Grid ${width}×${height} → ${cols}×${rows} cells of ${cellW}×${cellH}\n`)

const written = []
colorways.forEach((colorwayId, i) => {
  const x = (i % cols) * cellW
  const y = Math.floor(i / cols) * cellH
  const outPath = resolve(OUT_DIR, `${slug}-${colorwayId}.png`)

  execFileSync(ffmpeg, [
    "-y",
    "-loglevel", "error",
    "-i", gridPath,
    "-vf", `crop=${cellW}:${cellH}:${x}:${y}`,
    outPath,
  ])

  written.push({ colorwayId, outPath })
  console.log(`  ✓ ${slug}-${colorwayId}.png  (crop ${cellW}×${cellH} at ${x},${y})`)
})

console.log(`\nPaste into the "${slug}" entry in src/data/chairs.ts:\n`)
for (const { colorwayId } of written) {
  console.log(`  // on the "${colorwayId}" colorway:`)
  console.log(`  image: "/chairs/${slug}-${colorwayId}.png",`)
}
