import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { CONTACT_EMAIL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    pageHead({
      title: "Privacy policy · Seven Nil",
      description: "How Seven Nil uses cookies, Google AdSense, and local game data. No account is required to play.",
      path: "/privacy",
    }),
});

function PrivacyPage() {
  return (
    <LegalShell title="Privacy policy" kicker="Effective 18 September 2026">
      <p>
        Seven Nil is a free browser game. You can play without creating an account. This page explains what we store,
        what Google may collect for ads, and how to opt out.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Game data on your device</h2>
      <p>
        Drafts, names, mute preference, and theme stay in your browser via localStorage. That data never leaves your
        device unless you use Friends online, which only shares the room code, display names, and picks with the people
        in that room.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Advertising</h2>
      <p>
        We use Google AdSense to show ads. Google may use cookies or similar tech to serve ads based on your visits to
        this site and other sites. Google's use of advertising cookies is covered by{" "}
        <a className="underline" href="https://policies.google.com/privacy" rel="noreferrer">
          Google Privacy Policy
        </a>{" "}
        and{" "}
        <a className="underline" href="https://policies.google.com/technologies/ads" rel="noreferrer">
          How Google uses information from sites
        </a>
        .
      </p>
      <p>
        Visitors in the European Economic Area, the UK, and Switzerland see a consent message before personalized ads.
        You can refuse. Non-personalized ads may still appear.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Cookies</h2>
      <p>
        Essential cookies keep the game working. Advertising cookies are set by Google if you consent. You can clear
        cookies in your browser settings at any time.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Children</h2>
      <p>Seven Nil is not directed at children under 13. We do not knowingly collect personal information from them.</p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Contact</h2>
      <p>
        Questions:{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </LegalShell>
  );
}
