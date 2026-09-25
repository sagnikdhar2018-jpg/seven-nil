import { CONTACT_EMAIL, GITHUB } from "@/lib/seven/site";
import { Link } from "@tanstack/react-router";

export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 pb-24 pt-4 text-xs font-semibold text-muted">
      <p>Seven Nil · 7-0 · build · simulate</p>
      <p>
        Contact:{" "}
        <a className="underline-offset-2 hover:text-ink hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
      {note ? <p>{note}</p> : null}
      <nav aria-label="Site" className="flex flex-wrap gap-x-4 gap-y-1">
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/how-to-play">
          How to play
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/about">
          About
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/contact">
          Contact
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/privacy">
          Privacy policy
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/terms">
          Terms
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/">
          World Cup
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/club">
          UCL
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/friends">
          World Cup with friends
        </Link>
        <Link className="underline-offset-2 hover:text-ink hover:underline" to="/club/friends">
          UCL with friends
        </Link>
        <a className="underline-offset-2 hover:text-ink hover:underline" href={GITHUB} rel="me">
          GitHub
        </a>
      </nav>
    </footer>
  );
}