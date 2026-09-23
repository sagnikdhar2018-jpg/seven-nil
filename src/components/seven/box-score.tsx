import { displayRatings } from "@/lib/seven/simulate";
import type { Slot, StyleId } from "@/lib/seven/types";
import { useSeven } from "@/lib/seven/store";
import { cn } from "@/lib/utils";

export function LineupBox({
  slots,
  style,
  classic = true,
  title = "Lineup",
}: {
  slots: Slot[];
  style: StyleId;
  classic?: boolean;
  title?: string;
}) {
  const filled = slots.filter((s) => s.player).length;
  const ratings = filled >= 11 ? displayRatings(slots, style) : null;

  return (
    <div className="card-ink rounded-lg px-4 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{title}</p>
          <p className="mt-1 text-sm text-muted">{filled}/11 on the pitch</p>
        </div>
        {ratings && classic ? (
          <p className="font-numeral text-4xl font-extrabold leading-none tabular-nums text-ink">{ratings.ovr}</p>
        ) : (
          <p className="font-numeral text-4xl font-extrabold leading-none tabular-nums text-muted">—</p>
        )}
      </div>
      {ratings && classic ? (
        <div className="mt-4 grid grid-cols-4 gap-1 border-y border-line py-3 text-center">
          <Stat label="OVR" value={ratings.ovr} />
          <Stat label="ATK" value={ratings.atk} />
          <Stat label="MID" value={ratings.mid} />
          <Stat label="DEF" value={ratings.def} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">Ratings lock in at 11.</p>
      )}
      <ul className="mt-2">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-baseline justify-between gap-2 border-b border-line py-2 last:border-0"
          >
            <span className="w-10 text-xs font-extrabold tracking-wide text-muted">{slot.pos}</span>
            <span className={cn("flex-1 truncate text-sm font-extrabold", slot.player && slot.player.ovr > 90 ? "name-gold" : "text-ink")}>
              {slot.player ? slot.player.name : "—"}
            </span>
            <span className="font-numeral text-sm font-extrabold tabular-nums text-accent">
              {slot.player && classic ? slot.player.ovr : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BoxScore() {
  const slots = useSeven((s) => s.slots);
  const style = useSeven((s) => s.style);
  const mode = useSeven((s) => s.mode);
  return <LineupBox slots={slots} style={style} classic={mode === "classic"} title="Box score" />;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">{label}</p>
      <p className="font-numeral text-xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}
