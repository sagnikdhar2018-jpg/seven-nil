import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { CONTACT_EMAIL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    pageHead({
      title: "Contact Seven Nil",
      description: "Email the maker of Seven Nil. The game is online only. There is no shop and no phone line.",
      path: "/contact",
      schemas: [
        {
          "@type": "ContactPage",
          name: "Contact Seven Nil",
          url: "https://seven-nil-self.vercel.app/contact",
          mainEntity: { "@id": "https://seven-nil-self.vercel.app/#org" },
        },
      ],
    }),
});

function ContactPage() {
  return (
    <LegalShell title="Contact" kicker="Seven Nil · online only">
      <p>
        Seven Nil is an online game. There is no office, no shop, and no phone number. Write to the maker if a squad
        year is wrong or a room will not start.
      </p>
      <p>
        Email:{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
      <form
        className="flex flex-col gap-3"
        action={`mailto:${CONTACT_EMAIL}`}
        method="post"
        encType="text/plain"
      >
        <label className="flex flex-col gap-1 text-sm font-extrabold">
          Name
          <input required name="name" className="rounded-md border border-line bg-paper px-3 py-2 font-semibold" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-extrabold">
          Email
          <input required type="email" name="email" className="rounded-md border border-line bg-paper px-3 py-2 font-semibold" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-extrabold">
          Message
          <textarea required name="message" rows={5} className="rounded-md border border-line bg-paper px-3 py-2 font-semibold" />
        </label>
        <button type="submit" className="btn btn-primary w-fit">
          Send
        </button>
      </form>
      <p className="text-sm text-muted">The form opens your email app. Nothing is stored on the site.</p>
    </LegalShell>
  );
}
