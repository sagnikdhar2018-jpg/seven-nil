import { createFileRoute } from "@tanstack/react-router";
import { FriendsApp } from "@/components/seven/friends-app";
import { pageHead } from "@/lib/seven/site";

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
    }),
});

function ClubFriendsPage() {
  const { room } = Route.useSearch();
  return <FriendsApp pool="club" roomFromUrl={room} />;
}
