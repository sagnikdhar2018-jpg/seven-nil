import { createFileRoute } from "@tanstack/react-router";
import { SevenApp } from "@/components/seven/seven-app";
import { pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    pageHead({
      title: "Seven Nil — Free World Cup draft game",
      description:
        "Roll a nation and a World Cup year, draft one real player at a time, and simulate the tournament. Free historic XI builder from 1958 to 2026.",
      path: "/",
    }),
});

function Home() {
  return <SevenApp />;
}
