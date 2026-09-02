export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-foreground">Perch</span> — chairs for
            small rooms and long semesters.
          </p>
          <p className="font-mono text-[11px]">
            A CS 336 coursework demo. Not affiliated with Calvin University. No real
            orders are placed and no payment is taken.
          </p>
        </div>
      </div>
    </footer>
  )
}
