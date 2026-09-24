import { createFileRoute } from "@tanstack/react-router";
import { FriendsApp } from "@/components/seven/friends-app";
import { itemListSchema, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/club_/friends")({
  validateSearch: (s: Record<string, unknown>): { room?: string } => {
    const raw = s.room;
    if (typeof raw !== "string" || !raw.trim()) return {};
    return { room: raw.trim().toUpperCase() };
  },
  component: ClubFriendsPage,
  head: () =>
    pageHead({
      title: "Club friends — UCL draft cups · Seven Nil",
      description:
        "Draft historic club XIs with friends. Friend vs friend, or a UCL knockout of 4 to 32 sides from the top five leagues.",
      path: "/club/friends",
      schemas: [
        itemListSchema("Club friends formats", [
          {
            name: "Friend vs friend",
            description:
              "Two people, one screen. Historic clubs only. Pass the device after every pick, then one European night.",
          },
          {
            name: "Rivalry",
            description:
              "Online 1v1. Separate club XIs, one simulated European night. Balance beats a famous attack with a weak full-back.",
          },
          {
            name: "UCL",
            description:
              "Knockout of 4, 8, 16, or 32. Empty seats become other European clubs, seeded by ranking. Only a tie between two friends is played in full, with penalties kick by kick if it is level.",
          },
        ]),
      ],
    }),
});

function ClubFriendsPage() {
  const { room } = Route.useSearch();
  return <FriendsApp pool="club" roomFromUrl={room} />;
}
