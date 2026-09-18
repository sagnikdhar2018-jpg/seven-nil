import { teamAxes } from "@/lib/seven/simulate";
import { useSeven } from "@/lib/seven/store";

export function BoxScore() {
  const slots = useSeven((s) => s.slots);
  const style = useSeven((s) => s.style);
  const mode = useSeven((s) => s.mode);
  const filled = slots.filter((s) => s.player);
  const axes = teamAxes(slots, style);
  const overall = Math.round((axes.attack + axes.defence + axes.midfield) / 3);
  const classic = mode === "classic";

  return (
    <div className="card-ink rounded-lg px-4 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Box score</p>
          <p className="mt-1 text-sm text-muted">{filled.length}/11 on the pitch</p>
        </div>
        <p className="font-numeral text-4xl font-extrabold leading-none tabular-nums text-ink">
          {classic ? overall : "—"}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
        <Stat label="Attack" value={classic ? Math.round(axes.attack) : "—"} />
        <Stat label="Midfield" value={classic ? Math.round(axes.midfield) : "—"} />
        <Stat label="Defence" value={classic ? Math.round(axes.defence) : "—"} />
      </div>
      <ul className="mt-2">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-baseline justify-between gap-2 border-b border-line py-2 last:border-0"
          >
            <span className="w-10 text-xs font-extrabold tracking-wide text-muted">{slot.pos}</span>
            <span className="flex-1 truncate text-sm font-extrabold text-ink">
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">{label}</p>
      <p className="font-numeral text-xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}
