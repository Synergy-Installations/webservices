"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AiLabel from "../ai/AiLabel";

/** Bilder, die beim Seitenwechsel abwechselnd hineinzoomen. */
const TRANSITION_HEROES = [
  "/brand/helden/synergie-heldenpaar.webp",
  "/brand/helden/synergie-held.webp",
  "/brand/helden/synergie-heldin.webp",
];

/** Dauer der ganzen Animation in Millisekunden. */
const DURATION = 1100;

/** Merker, damit der Zoom nur einmal pro Besuch erscheint. */
const SEEN_KEY = "synergie-hero-zoom-seen";

/**
 * Beim ersten Seitenwechsel eines Besuchs zoomt kurz das SYNERGIE-Heldenpaar ins Bild
 * und verschwindet wieder. Blockiert keine Klicks und entfällt automatisch,
 * wenn am Gerät „weniger Bewegung“ eingestellt ist.
 */
export const PageTransitionHero = () => {
  const pathname = usePathname();
  const first = useRef(true);
  const count = useRef(0);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    // Nur einmal pro Besuch (bis der Browser-Tab geschlossen wird)
    try {
      if (window.sessionStorage.getItem(SEEN_KEY)) return;
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      if (count.current > 0) return;
    }
    const src = TRANSITION_HEROES[count.current % TRANSITION_HEROES.length];
    count.current += 1;
    setActive(src);
    const id = window.setTimeout(() => setActive(null), DURATION);
    return () => window.clearTimeout(id);
  }, [pathname]);

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
        key={active}
        className="relative w-[min(70vw,420px)] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-synergy-light-blue/60"
        style={{ animation: `synergie-hero-zoom ${DURATION}ms cubic-bezier(.2,.8,.2,1) forwards` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active} alt="" className="block h-auto w-full" />
        <AiLabel />
      </div>
    </div>
  );
};

export default PageTransitionHero;
