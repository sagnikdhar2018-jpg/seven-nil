import { Link } from "@tanstack/react-router";

export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 pb-24 pt-4 text-xs font-semibold text-muted">
      <p>7-0 · build · simulate</p>
      {note ? <p>{note}</p> : null}
      <nav aria-label="Site" className="flex flex-wrap gap-x-4 gap-y-1">
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/how-to-play">
          How to play
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/about">
          About
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/privacy">
          Privacy
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/club">
          Clubs
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/friends">
          Friends
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/club/friends">
          Club friends
        </Link>
      </nav>
    </footer>
  );
}
