import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "The pitch went quiet. Reload and roll again.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6 text-center text-ink">
      <p className="font-display text-6xl leading-none">7–0</p>
      <h1 className="font-display text-3xl leading-none">Something went wrong</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">{errorMessage(error)}</p>
      <a href="/" className="btn btn-primary mt-2 h-11 px-5">
        Back to the pitch
      </a>
    </main>
  );
}

export function AppNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6 text-center text-ink">
      <p className="font-display text-6xl leading-none">404</p>
      <h1 className="font-display text-3xl leading-none">Off the pitch</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        That page is not in the tournament. World Cup, Clubs, and Friends are.
      </p>
      <a href="/" className="btn btn-primary mt-2 h-11 px-5">
        Back to the pitch
      </a>
    </main>
  );
}
