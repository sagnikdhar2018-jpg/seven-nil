import { createFileRoute } from "@tanstack/react-router";
import { SevenApp } from "@/components/seven/seven-app";

export const Route = createFileRoute("/club")({
  component: ClubPage,
  head: () => ({
    meta: [
      { title: "Club draft · Seven Nil" },
      {
        name: "description",
        content:
          "Roll historic sides from the top five leagues, 1980 on. Draft one footballer per season, then take the XI into Europe.",
      },
    ],
  }),
});

function ClubPage() {
  return <SevenApp pool="club" />;
}