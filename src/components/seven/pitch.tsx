import { emptySlotsFor, styledSpot } from "@/lib/seven/formations";
import type { Player, Slot, StyleId } from "@/lib/seven/types";
import { useSeven } from "@/lib/seven/store";
import { cn } from "@/lib/utils";

export function Pitch({
  slots: slotsProp,
  selected: selectedProp,
  onPlace,
  style: styleProp,
}: {
  slots?: Slot[];
  selected?: Player | null;
  onPlace?: (id: string) => void;
  style?: StyleId;
}) {
  const storeSlots = useSeven((s) => s.slots);
  const storeSelected = useSeven((s) => s.selected);
  const storePlace = useSeven((s) => s.place);
  const storeStyle = useSeven((s) => s.style);
  const slots = slotsProp ?? storeSlots;
  const selected = selectedProp !== undefined ? selectedProp : storeSelected;
  const place = onPlace ?? storePlace;
  const style = styleProp ?? storeStyle;
  const legalIds = selected
    ? new Set(emptySlotsFor(slots, selected.pos).map((slot) => slot.id))
    : new Set<string>();

  return (
    <div className="pitch-stage">
      <div className="pitch">
      <div className="pitch-glow" aria-hidden="true" />
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
        const spot = styledSpot(slot.x, slot.y, slot.pos, style);
        return (
          <button
            key={slot.id}
            type="button"
            className={cn("disc", !filled && "is-empty", filled && "is-filled", legal && "is-legal")}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
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
            <span className={cn("disc-name", slot.player && slot.player.ovr > 90 && "name-gold")}>
              {slot.player ? slot.player.name.split(" ").slice(-1)[0] : slot.pos}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
