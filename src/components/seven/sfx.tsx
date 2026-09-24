import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getMuted,
  installUnlock,
  setMuted,
  subscribeDice,
  subscribeMute,
  unlock,
} from "@/lib/seven/sound";

export function SfxRoot() {
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    installUnlock();
    return subscribeDice(setRolling);
  }, []);

  return <DiceTray active={rolling} />;
}

export function MuteButton() {
  const [muted, setMuteState] = useState(false);

  useEffect(() => {
    setMuteState(getMuted());
    return subscribeMute(setMuteState);
  }, []);

  return (
    <Button
      variant="secondary"
      size="icon"
      className="size-14 min-h-14 rounded-full"
      data-action="mute"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      aria-pressed={muted}
      onClick={() => {
        unlock();
        setMuted(!muted);
      }}
    >
      {muted ? <VolumeX className="size-7" strokeWidth={2} /> : <Volume2 className="size-7" strokeWidth={2} />}
    </Button>
  );
}

function Die({ delay }: { delay: string }) {
  return (
    <div className="die" style={{ animationDelay: delay }}>
      <span className="die-face" data-n="1" />
      <span className="die-face" data-n="2" />
      <span className="die-face" data-n="3" />
      <span className="die-face" data-n="4" />
      <span className="die-face" data-n="5" />
      <span className="die-face" data-n="6" />
    </div>
  );
}

function DiceTray({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="dice-overlay" role="status" aria-live="assertive">
      <div className="dice-felt" aria-hidden="true" />
      <div className="dice-pair" aria-hidden="true">
        <Die delay="0ms" />
        <Die delay="70ms" />
      </div>
      <p className="dice-caption">Rolling</p>
    </div>
  );
}
