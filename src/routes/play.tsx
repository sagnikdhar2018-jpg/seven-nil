import { createFileRoute } from "@tanstack/react-router";
import { ArcadeApp } from "@/components/seven/arcade-app";
import { pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/play")({
  component: ArcadeApp,
  head: () =>
    pageHead({
      title: "Arcade — football 1v1 on Seven Nil",
      description: "Penalties, free kicks, and a keeper drill. Find a rival, or play the next person who is waiting.",
      path: "/play",
    }),
});
