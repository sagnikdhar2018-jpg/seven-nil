export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 pb-24 pt-4 text-xs font-semibold text-muted">
      <p>Seven Nil · build · simulate · 7–0</p>
      {note ? <p>{note}</p> : null}
      <nav aria-label="Site" className="flex flex-wrap gap-x-4 gap-y-1">
        <a className="underline-offset-2 hover:text-ink hover:underline" href="/how-to-play">
          How to play
        </a>
        <a className="underline-offset-2 hover:text-ink hover:underline" href="/about">
          About
        </a>
        <a className="underline-offset-2 hover:text-ink hover:underline" href="/privacy">
          Privacy
        </a>
        <a className="underline-offset-2 hover:text-ink hover:underline" href="/club">
          Clubs
        </a>
        <a className="underline-offset-2 hover:text-ink hover:underline" href="/friends">
          Friends
        </a>
      </nav>
    </footer>
  );
}
