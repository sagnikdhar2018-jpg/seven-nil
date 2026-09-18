import { createFileRoute } from "@tanstack/react-router";
import { SevenApp } from "@/components/seven/seven-app";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Seven Nil — World Cup draft" },
      {
        name: "description",
        content:
          "Roll a nation and a World Cup year, draft one real player at a time, and simulate the run. Chase a seven-nil.",
      },
    ],
  }),
});

function Home() {
  return <SevenApp />;
}