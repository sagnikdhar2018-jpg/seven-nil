import { Link } from "@tanstack/react-router";
import { SiteFooter } from "./site-footer";

export function LegalShell({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="relative min-h-dvh bg-paper text-ink">
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
          <Link to="/" className="home-brand">
            7-0
          </Link>
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink">
            Play
          </Link>
        </header>
        <article className="mx-auto w-full max-w-3xl px-5 pb-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{kicker}</p>
          <h1 className="home-headline mt-3">{title}</h1>
          <div className="legal-copy mt-8 flex flex-col gap-4 text-base leading-relaxed text-ink">{children}</div>
        </article>
        <SiteFooter />
      </div>
    </main>
  );
}
