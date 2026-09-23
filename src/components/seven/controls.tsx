import { FORMATIONS, STYLES } from "@/lib/seven/formations";
import type { FormationId, ModeId, StyleId } from "@/lib/seven/types";
import { useSeven } from "@/lib/seven/store";
import { cn } from "@/lib/utils";

function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  locked,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={locked && !active}
              onClick={() => onChange(option.id)}
              className={cn("chip", active && "is-active")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Controls() {
  const formation = useSeven((s) => s.formation);
  const style = useSeven((s) => s.style);
  const mode = useSeven((s) => s.mode);
  const pool = useSeven((s) => s.pool);
  const slots = useSeven((s) => s.slots);
  const phase = useSeven((s) => s.phase);
  const draw = useSeven((s) => s.draw);
  const setFormation = useSeven((s) => s.setFormation);
  const setStyle = useSeven((s) => s.setStyle);
  const setMode = useSeven((s) => s.setMode);
  const locked = slots.some((s) => s.player) || Boolean(draw) || phase === "picking" || phase === "simulating" || phase === "result";

  return (
    <div className="flex flex-col gap-5">
      <ChipGroup<FormationId>
        label="Formation"
        value={formation}
        locked={locked}
        onChange={setFormation}
        options={FORMATIONS.map((id) => ({ id, label: id }))}
      />
      <ChipGroup<StyleId>
        label="Style"
        value={style}
        onChange={setStyle}
        options={STYLES}
      />
      <p className="text-sm leading-relaxed text-muted">
        {style === "defensive"
          ? "Sit deeper. Harder to break down."
          : style === "counter"
            ? "Stay compact, then break. A safer punch."
            : style === "press"
              ? "Hunt the ball. More shots, more space behind."
              : style === "attacking"
                ? "Send numbers forward."
                : "No extreme. The XI decides the match."}
      </p>
      <ChipGroup<ModeId>
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { id: "classic", label: "Classic" },
          { id: "almanac", label: "Almanac" },
        ]}
      />
      <p className="text-sm leading-relaxed text-muted">
        {mode === "classic"
          ? "Ratings stay visible. Take the useful name, not just the famous one."
          : pool === "club"
            ? "Ratings are hidden. Trust what you remember from the season."
            : "Ratings are hidden. Trust what you remember from the tournament."}
      </p>
    </div>
  );
}
