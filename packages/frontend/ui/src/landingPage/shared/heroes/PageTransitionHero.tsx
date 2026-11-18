"use client";

import { useEffect, useState } from "react";
import AiLabel from "../ai/AiLabel";

/** Das SYNERGIE-Heldenpaar, das beim Öffnen der Website hineinzoomt. */
const HERO_PAIR = "/brand/helden/synergie-heldenpaar.webp";

/** Dauer der ganzen Animation in Millisekunden. */
const DURATION = 1100;

/**
 * Jedes Mal, wenn die Website geöffnet oder neu geladen wird (auch in einem
 * neuen Tab), zoomt einmal kurz das SYNERGIE-Heldenpaar ins Bild und
 * verschwindet wieder. Beim Weiterklicken innerhalb der Website kommt es nicht.
 * Blockiert keine Klicks und entfällt, wenn am Gerät „weniger Bewegung“
 * eingestellt ist.
 */
export const PageTransitionHero = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    setActive(true);
    const id = window.setTimeout(() => setActive(false), DURATION);
    return () => window.clearTimeout(id);
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
    >
      <style>{`
        @keyframes synergie-hero-bg {
          0% { opacity: 0; }
          20% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes synergie-hero-zoom {
          0% { opacity: 0; transform: scale(0.55); }
          30% { opacity: 1; transform: scale(1); }
          70% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 0; transform: scale(1.35); }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-white/80 backdrop-blur-sm"
        style={{ animation: `synergie-hero-bg ${DURATION}ms ease-in-out forwards` }}
      />
      <div
        className="relative w-[min(70vw,420px)] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-synergy-light-blue/60"
        style={{ animation: `synergie-hero-zoom ${DURATION}ms cubic-bezier(.2,.8,.2,1) forwards` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_PAIR} alt="" className="block h-auto w-full" />
        <AiLabel />
      </div>
    </div>
  );
};

export default PageTransitionHero;
