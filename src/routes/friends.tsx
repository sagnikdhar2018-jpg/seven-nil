import { createFileRoute } from "@tanstack/react-router";
import { FriendsApp } from "@/components/seven/friends-app";

export const Route = createFileRoute("/friends")({
  component: FriendsPage,
  head: () => ({
    meta: [
      { title: "Friends · Seven Nil" },
      {
        name: "description",
        content:
          "Draft World Cup XIs with friends. Local pass-and-play, a Cup Final, or a full bracket.",
      },
    ],
  }),
});

function FriendsPage() {
  return <FriendsApp />;
}