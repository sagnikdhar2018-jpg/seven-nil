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
    <LegalShell title="Privacy policy" kicker="Effective 1 October 2026">
      <p>
        Seven Nil is a free browser game run by nik.peeps. You can play without creating an account. This page says
        what stays on your device, what a friends room shares, and what Google may collect if advertising is switched
        on. The contact address for privacy questions is{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Who we are</h2>
      <p>
        The site is published at seven-nil-self.vercel.app. There is no company, no office, and no phone line. The{" "}
        <a className="underline" href="/about">
          about page
        </a>{" "}
        names the maker. The{" "}
        <a className="underline" href="/contact">
          contact page
        </a>{" "}
        is the way to write in.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Game data on your device</h2>
      <p>
        Drafts, display names, the mute preference, and the theme stay in your browser through localStorage. That data
        does not go to a Seven Nil account, because there is no account. Clearing the site's storage in your
        browser deletes it.
      </p>
      <p>
        Friends online is different. A room shares the room code, the display names people typed, and the picks in
        that room with the other people who joined it. Do not put a phone number, an address, or any other private
        fact in a display name. Rooms are temporary. They are not a public profile.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What we do not do</h2>
      <p>
        We do not sell personal information. We do not ask you to register. We do not run a shop. A message sent from
        the contact form opens your own email app. It is not stored on the site.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Advertising</h2>
      <p>
        This site loads one Google AdSense script for publisher ID pub-1391099021196311. The same ID is the only
        record in /ads.txt. Loading the script is not the same thing as Google approving this site, and it does not
        mean an advertisement is on the screen. Google decides whether an ad is served. There are no ad slots drawn
        by the game itself, and nothing on the page asks you to click an ad.
      </p>
      <p>
        When that script runs, Google and its partners may use cookies, device identifiers, or similar technology to
        provide and measure advertisements, including a coarse location derived from an IP address. That can happen
        before an ad is visible.
      </p>
      <p>
        Google's own explanation is in the{" "}
        <a className="underline" href="https://policies.google.com/privacy" rel="noreferrer">
          Google Privacy Policy
        </a>{" "}
        and in{" "}
        <a className="underline" href="https://policies.google.com/technologies/ads" rel="noreferrer">
          How Google uses information from sites or apps that use its services
        </a>
        . The file at /ads.txt lists that same publisher ID and no other.
      </p>
      <p>
        If Google serves personalised ads, visitors in the European Economic Area, the United Kingdom, and Switzerland
        should see the consent message configured in the AdSense account first. You can refuse. Non-personalised ads
        may still appear. Whether that message is showing on a given visit is controlled in the AdSense account, not
        by a second script in this repository. You can change ad personalisation at any time in{" "}
        <a className="underline" href="https://adssettings.google.com" rel="noreferrer">
          Google Ads Settings
        </a>
        . Industry opt-out pages are{" "}
        <a className="underline" href="https://www.aboutads.info/choices" rel="noreferrer">
          aboutads.info
        </a>{" "}
        and, in Europe,{" "}
        <a className="underline" href="https://www.youronlinechoices.eu" rel="noreferrer">
          youronlinechoices.eu
        </a>
        .
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Cookies</h2>
      <p>
        Essential storage keeps the game working: your draft, your name in a room, and whether sound is muted.
        Advertising cookies are set by Google when ads load and, where the law requires it, when you consent. Vercel
        Analytics may record a page view so we can see if the site is up. It is not used to build an advertising
        profile. You can block or clear cookies in your browser. Blocking them can stop ads and can also reset a draft
        that lived only on that device.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Children</h2>
      <p>
        Seven Nil is not directed at children under 13, and we do not knowingly collect personal information from
        them. If you believe a child sent personal information through a display name or the contact form, email{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        and we will delete what we can.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Changes</h2>
      <p>
        If this policy changes, the date at the top of the page changes with it. The current version was updated on 1
        October 2026.
      </p>
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
