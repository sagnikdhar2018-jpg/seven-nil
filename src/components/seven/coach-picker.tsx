import { useMemo, useState } from "react";
import { COACHES, PLAY_LABEL, coachById } from "@/lib/seven/coaches";
import { useSeven } from "@/lib/seven/store";
import { cn } from "@/lib/utils";

const BARS: { key: "possession" | "quickCounter" | "longBall" | "overload" | "pressing" | "compactness"; label: string }[] = [
  { key: "possession", label: "Possession" },
  { key: "quickCounter", label: "Quick counter" },
  { key: "longBall", label: "Long ball" },
  { key: "overload", label: "Overload" },
  { key: "pressing", label: "Pressing" },
  { key: "compactness", label: "Compactness" },
];

export function CoachPicker() {
  const filled = useSeven((s) => s.slots.filter((slot) => slot.player).length);
  const phase = useSeven((s) => s.phase);
  const coachId = useSeven((s) => s.coachId);
  const setCoach = useSeven((s) => s.setCoach);
  const [query, setQuery] = useState("");
  const open = filled >= 11 && (phase === "ready" || phase === "setup");
  const selected = coachById(coachId);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COACHES;
    return COACHES.filter(
      (coach) =>
        coach.name.toLowerCase().includes(q) ||
        coach.known.toLowerCase().includes(q) ||
        PLAY_LABEL[coach.play].toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  return (
    <div className="card-ink flex flex-col gap-3 rounded-lg px-4 py-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Coach</p>
        <h3 className="mt-1 font-display text-2xl leading-none normal-case tracking-tight">Pick one last</h3>
        <p className="mt-1 text-sm text-muted">
          {COACHES.length} legendary coaches. The choice sets the shape and the plan for the cup. Same list in World
          Cup and clubs.
        </p>
      </div>
      <input
        className="field-input normal-case tracking-normal"
        value={query}
        placeholder="Search a coach or a style"
        aria-label="Search coaches"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="max-h-52 overflow-y-auto rounded-md border border-line" role="listbox" aria-label="Coaches">
        {list.map((coach) => {
          const active = coach.id === coachId;
          return (
            <button
              key={coach.id}
              type="button"
              role="option"
              aria-selected={active}
              className={cn(
                "flex w-full items-baseline justify-between gap-3 border-b border-line px-3 py-2 text-left last:border-b-0",
                active ? "bg-ink text-paper" : "hover:bg-paper",
              )}
              onClick={() => setCoach(coach.id)}
            >
              <span className="font-extrabold">{coach.name}</span>
              <span className={cn("text-xs font-semibold", active ? "text-paper" : "text-muted")}>
                {coach.formation} · {PLAY_LABEL[coach.play]}
              </span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold text-ink">
            {selected.known}
            <span className="font-semibold text-muted"> · {selected.years}</span>
          </p>
          <p className="text-sm font-semibold text-accent">
            {PLAY_LABEL[selected.play]} · {selected.formation}
          </p>
          <ul className="flex flex-col gap-1.5">
            {BARS.map((bar) => {
              const value = selected.stats[bar.key];
              return (
                <li key={bar.key} className="grid grid-cols-[7.2rem_1fr_2rem] items-center gap-2 text-xs font-bold">
                  <span>{bar.label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm font-semibold text-muted">Choose a coach before you simulate.</p>
      )}
    </div>
  );
}
