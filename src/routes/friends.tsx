import { createFileRoute } from "@tanstack/react-router";
import { FriendsApp } from "@/components/seven/friends-app";
import { pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/friends")({
  component: FriendsPage,
  head: () =>
    pageHead({
      title: "Play Seven Nil with friends — World Cup draft cups",
      description:
        "Draft World Cup XIs with friends. Local pass-and-play, a Cup Final, or a full knockout bracket. Set names in the lobby.",
      path: "/friends",
    }),
});

function FriendsPage() {
  return <FriendsApp />;
}
