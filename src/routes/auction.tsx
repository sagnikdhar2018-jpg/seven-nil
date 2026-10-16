import { createFileRoute } from "@tanstack/react-router";
import { AuctionApp } from "@/components/seven/auction-app";
import { pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/auction")({
  component: AuctionApp,
  head: () =>
    pageHead({
      title: "5-a-side auction — Seven Nil",
      description: "A blind football auction. Two managers, $16 each, ten players, and a five-a-side squad.",
      path: "/auction",
    }),
});
