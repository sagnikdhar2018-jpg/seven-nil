import { createFileRoute } from "@tanstack/react-router";
import { FriendsApp } from "@/components/seven/friends-app";
import { itemListSchema, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/friends")({
  validateSearch: (s: Record<string, unknown>): { room?: string } => {
    const raw = s.room;
    if (typeof raw !== "string" || !raw.trim()) return {};
    return { room: raw.trim().toUpperCase() };
  },
  component: FriendsPage,
  head: () =>
    pageHead({
      title: "Play Seven Nil with friends — World Cup draft cups",
      description:
        "Draft World Cup XIs with friends. Local pass-and-play, a Cup Final, or a full knockout bracket. Set names in the lobby.",
      path: "/friends",
      schemas: [
        itemListSchema("World Cup friends formats", [
          {
            name: "Local",
            description:
              "Two people, one screen. Set both names, pass the device after every pick, and rename whenever you like. Same shared pool, then one Cup Final.",
          },
          {
            name: "Cup Final",
            description:
              "Fast head-to-head for two. Separate XIs, one simulated match. Balance beats a famous attack with a weak full-back.",
          },
          {
            name: "Full Cup",
            description:
              "Bracket of 4, 8, 16, or 32. Empty seats become real nations, seeded by ranking. Only a tie between two friends is played in full, with penalties kick by kick if it is level.",
          },
        ]),
      ],
    }),
});

function FriendsPage() {
  const { room } = Route.useSearch();
  return <FriendsApp pool="world" roomFromUrl={room} />;
}
