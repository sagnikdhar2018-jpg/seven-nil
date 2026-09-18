import { createFileRoute } from "@tanstack/react-router";
import { SevenApp } from "@/components/seven/seven-app";
import { pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/club")({
  component: ClubPage,
  head: () =>
    pageHead({
      title: "Club draft game — top five leagues · Seven Nil",
      description:
        "Roll historic club sides from England, Spain, Italy, Germany, and France since 1980. Draft one footballer per season, then take the XI into Europe.",
      path: "/club",
    }),
});

function ClubPage() {
  return <SevenApp pool="club" />;
}
