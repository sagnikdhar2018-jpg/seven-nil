import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () =>
    pageHead({
      title: "Cookie policy — Seven Nil",
      description:
        "What Seven Nil stores on your device, which third-party scripts can set cookies, and how to refuse advertising cookies.",
      path: "/cookies",
    }),
});

function CookiesPage() {
  return (
    <LegalShell title="Cookie policy" kicker="Storage on this device">
      <p>
        This page lists what Seven Nil actually stores. It is not a generic template. A draft lives on your device.
        Google AdSense and Vercel Analytics are the only third-party scripts loaded for visitors. Neither is a game
        control, and neither is required to finish a solo draft.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Storage we set ourselves</h2>
      <p>
        These entries are written by the game in your browser. They are not sent to an account, because there is no
        account. Clearing site data deletes the draft.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-ink/20 py-2 pr-3">Name</th>
              <th className="border-b border-ink/20 py-2 pr-3">Where</th>
              <th className="border-b border-ink/20 py-2">What it keeps</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">seven-nil-save</td>
              <td className="border-b border-ink/10 py-2 pr-3">local storage</td>
              <td className="border-b border-ink/10 py-2">Formation, picks, redraws left, phase, and the pitch theme.</td>
            </tr>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">seven-nil-name</td>
              <td className="border-b border-ink/10 py-2 pr-3">local storage</td>
              <td className="border-b border-ink/10 py-2">The display name you typed before a friends room, capped at 18 characters.</td>
            </tr>
            <tr>
              <td className="border-b border-ink/10 py-2 pr-3">seven-nil-mute</td>
              <td className="border-b border-ink/10 py-2 pr-3">local storage</td>
              <td className="border-b border-ink/10 py-2">Whether dice and timer sounds are muted.</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">sn-host, sn-door, sn-join-name, sn-join-password, sn-join-partner, sn-notice, sn-kicked, and the room snapshot</td>
              <td className="py-2 pr-3">session storage</td>
              <td className="py-2">Enough to reopen the tab you already joined. A password stays in that tab only so a refresh does not lock you out of a room you entered. It is not a user account.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Google AdSense</h2>
      <p>
        One script is added after the page has loaded: pagead2.googlesyndication.com, client ca-pub-1391099021196311.
        The game does not draw an ad box and does not ask you to click. When the script runs, Google may set cookies
        or similar identifiers to decide whether an ad can be served, to measure it, and, if you allow it, to
        personalise it. That can happen even when no ad is visible. Loading the script does not mean this site has
        been approved.
      </p>
      <p>
        If Google serves personalised ads, visitors in the European Economic Area, the United Kingdom, and Switzerland
        should see the consent message configured in the AdSense account before those ads. Refusing can limit
        personalised ads. You can also change that choice at{" "}
        <a className="underline" href="https://adssettings.google.com">Google Ads Settings</a>, or use{" "}
        <a className="underline" href="https://www.aboutads.info/choices">aboutads.info</a> and{" "}
        <a className="underline" href="https://www.youronlinechoices.eu">youronlinechoices.eu</a>. Google explains its
        own use of data from sites that use its services at{" "}
        <a className="underline" href="https://policies.google.com/technologies/ads">policies.google.com/technologies/ads</a>.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Vercel Analytics</h2>
      <p>
        The host may record a page view so we can see whether the site is up. That measurement is not used to build
        an advertising profile and it is not joined to your draft. Blocking third-party scripts stops it.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">What we do not set</h2>
      <p>
        There is no login cookie, no shopping cart, and no tracker we wrote to follow you across other sites. Friends
        rooms share the room code, the names, and the picks with the people in that room. They do not publish your
        XI to the rest of the site. A contact message opens your own email app. It is not stored here.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to refuse or delete them</h2>
      <p>
        Use your browser's site settings for seven-nil-self.vercel.app and clear cookies and site data. That removes
        the draft, the saved name, and the mute flag. Blocking third-party cookies limits AdSense and Analytics. The
        solo draft still runs, because the board reads local storage, not an ad cookie. A friends room can fail to
        restore after a refresh if session storage was cleared. That is expected.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Which script does which job</h2>
      <p>
        Count the third parties. There are two. The AdSense loader is the advertising script. Vercel Analytics is the
        page-view script. The game's own code is not a third party. It reads and writes the local storage keys in the
        table above. Adding another tracker would be a change to this policy first. There is no chat widget, no
        embedded video player, and no social pixel.
      </p>
      <p>
        A solo draft does not need either third party. If both are blocked, you can still roll, pick, and simulate.
        You will not see an ad, and we will not see that page view. A friends room uses a direct connection between
        the browsers in the room for the live state. That is not a cookie. Clearing cookies does not delete the other
        person's draft. It can forget that this tab was the host, so open the room again from the code rather than
        expecting a refresh to know who you were.
      </p>
      <p>
        Advertising cookies are the part people mean when they ask for a cookie policy. They are Google's, not keys
        this repository names one by one, because Google changes those names. What we can say for certain is the
        publisher ID, the one script tag, and the fact that the game draws no ad unit of its own. The matching public
        record is /ads.txt. The wider notice is the <a className="underline" href="/privacy">privacy policy</a>.
      </p>
      <p className="text-sm text-muted">Last updated 9 October 2026. Canonical page: {SITE_URL}/cookies</p>
    </LegalShell>
  );
}
