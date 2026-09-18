import { useEffect, useRef, useState } from "react";
import { DICE_MS, playDiceRoll, setDiceShowing, unlock } from "@/lib/seven/sound";

function prefersReduce() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useDiceSpin() {
  const [busy, setBusy] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const spin = (done: () => void) => {
    if (busy) return;
    unlock();
    const reduce = prefersReduce();
    playDiceRoll(reduce ? "short" : "full");
    if (reduce) {
      done();
      return;
    }
    setBusy(true);
    setDiceShowing(true);
    timer.current = window.setTimeout(() => {
      setBusy(false);
      setDiceShowing(false);
      done();
    }, DICE_MS);
  };

  return { busy, spin };
}
