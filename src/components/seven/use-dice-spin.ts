import { useEffect, useRef, useState } from "react";
import { DICE_MS, playDiceRoll, setDiceShowing, unlock } from "@/lib/seven/sound";

function prefersReduce() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useDiceSpin() {
  const [busy, setBusy] = useState(false);
  const timer = useRef(0);
  const lock = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const spin = (done: () => void) => {
    if (lock.current) return;
    lock.current = true;
    unlock();
    const reduce = prefersReduce();
    playDiceRoll(reduce ? "short" : "full");
    if (reduce) {
      lock.current = false;
      done();
      return;
    }
    setBusy(true);
    setDiceShowing(true);
    timer.current = window.setTimeout(() => {
      setBusy(false);
      setDiceShowing(false);
      lock.current = false;
      done();
    }, DICE_MS);
  };

  return { busy, spin };
}
