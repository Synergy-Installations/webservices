"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AiLabel from "../ai/AiLabel";

/**
 * Alle Heldenbilder aus dem Ordner „Heldenbilder & Digiversum webseite“
 * (als kleine Web-Bilder unter /brand/helden/zufall/01.webp … 29.webp).
 * Neue Bilder: Datei dazulegen und die Anzahl hier erhöhen.
 */
const HERO_COUNT = 29;
const heroSrc = (n: number) =>
  `/brand/helden/zufall/${String(n).padStart(2, "0")}.webp`;

/** Dauer der ganzen Animation in Millisekunden. */
const DURATION = 1100;

/** Zufälliges Bild – nie zweimal hintereinander dasselbe. */
const pickRandom = (last: number | null) => {
  let n = 1 + Math.floor(Math.random() * HERO_COUNT);
  if (n === last) n = (n % HERO_COUNT) + 1;
  return n;
};

/**
 * Beim Öffnen der Website (auch neu laden / neuer Tab) und danach bei jedem
 * zweiten Seitenwechsel zoomt kurz ein zufälliges Heldenbild ins Bild und
 * verschwindet wieder. Blockiert keine Klicks und entfällt, wenn am Gerät
 * „weniger Bewegung“ eingestellt ist.
 */
export const PageTransitionHero = () => {
  const pathname = usePathname();
  const last = useRef<number | null>(null);
  const lastPath = useRef<string | null>(null);
  const views = useRef(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    // Nur echte Seitenaufrufe zählen (React führt den Effekt beim Laden evtl. doppelt aus)
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    views.current += 1;
    // Nur jedes zweite Mal: beim Öffnen, dann beim 2., 4., … Seitenwechsel
    if (views.current % 2 === 0) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const n = pickRandom(last.current);
    last.current = n;
    setActive(n);
  }, [pathname]);

  // Bild nach Ablauf der Animation sicher wieder ausblenden
  useEffect(() => {
    if (active === null) return;
    const id = window.setTimeout(() => setActive(null), DURATION);
    return () => window.clearTimeout(id);
  }, [active, pathname]);

  if (active === null) return null;

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
        key={`${pathname}-${active}`}
        className="relative w-[min(70vw,380px)] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-synergy-light-blue/60"
        style={{ animation: `synergie-hero-zoom ${DURATION}ms cubic-bezier(.2,.8,.2,1) forwards` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroSrc(active)} alt="" className="block h-auto max-h-[70vh] w-full object-cover" />
        <AiLabel />
      </div>
    </div>
  );
};

export default PageTransitionHero;
