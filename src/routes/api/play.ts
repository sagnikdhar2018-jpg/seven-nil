import { createFileRoute } from "@tanstack/react-router";
import { handlePlay } from "@/lib/multiplayer/play.server";

const handle = ({ request }: { request: Request }) => handlePlay(request);

export const Route = createFileRoute("/api/play")({
  server: { handlers: { GET: handle, POST: handle } },
});
