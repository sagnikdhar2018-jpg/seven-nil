import { emptySlotsFor } from "@/lib/seven/formations";
import type { Player, Slot } from "@/lib/seven/types";
import { useSeven } from "@/lib/seven/store";
import { cn } from "@/lib/utils";

export function Pitch({
  slots: slotsProp,
  selected: selectedProp,
  onPlace,
}: {
  slots?: Slot[];
  selected?: Player | null;
  onPlace?: (id: string) => void;
}) {
  const storeSlots = useSeven((s) => s.slots);
  const storeSelected = useSeven((s) => s.selected);
  const storePlace = useSeven((s) => s.place);
  const slots = slotsProp ?? storeSlots;
  const selected = selectedProp !== undefined ? selectedProp : storeSelected;
  const place = onPlace ?? storePlace;
  const legalIds = selected
    ? new Set(emptySlotsFor(slots, selected.pos).map((slot) => slot.id))
    : new Set<string>();

  return (
    <div className="pitch mx-auto max-w-md lg:max-w-none">
      <svg className="pitch-markings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect x="4" y="4" width="92" height="92" />
        <line x1="4" y1="50" x2="96" y2="50" />
        <circle cx="50" cy="50" r="12" />
        <circle className="mk-fill" cx="50" cy="50" r="1.1" />
        <rect x="22" y="4" width="56" height="16" />
        <rect x="34" y="4" width="32" height="8" />
        <rect x="22" y="80" width="56" height="16" />
        <rect x="34" y="88" width="32" height="8" />
      </svg>
      {slots.map((slot) => {
        const filled = Boolean(slot.player);
        const legal = legalIds.has(slot.id);
        return (
          <button
            key={slot.id}
            type="button"
            className={cn("disc", !filled && "is-empty", legal && "is-legal")}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            disabled={!legal && !filled}
            onClick={() => {
              if (legal) place(slot.id);
            }}
            aria-label={
              slot.player
                ? `${slot.pos} ${slot.player.name}`
                : `${slot.pos} empty`
            }
          >
            <span className="disc-num">
              {slot.player ? slot.player.num : slot.pos}
            </span>
            <span className="disc-name">
              {slot.player ? slot.player.name.split(" ").slice(-1)[0] : slot.pos}
            </span>
          </button>
        );
      })}
    </div>
  );
}
