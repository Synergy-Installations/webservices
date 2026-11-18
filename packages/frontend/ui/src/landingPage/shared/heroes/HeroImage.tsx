import AiLabel from "../ai/AiLabel";

/**
 * Die SYNERGIE-Heldinnen und -Helden (KI-generierte Bilder).
 * „synergie-*“ tragen das aktuelle SYNERGIE-Logo,
 * „logo-*“ zeigen den Platzhalter „Hier könnte Ihr Logo stehen“.
 */
export const HERO_IMAGES = {
  "synergie-heldin": "/brand/helden/synergie-heldin.webp",
  "synergie-held": "/brand/helden/synergie-held.webp",
  "logo-held-gruen": "/brand/helden/logo-held-gruen.webp",
  "logo-held-rot": "/brand/helden/logo-held-rot.webp",
  "logo-heldin-gelb": "/brand/helden/logo-heldin-gelb.webp",
  "logo-heldin-lila": "/brand/helden/logo-heldin-lila.webp",
  "logo-heldin-rot": "/brand/helden/logo-heldin-rot.webp",
  "logo-heldin-orange": "/brand/helden/logo-heldin-orange.webp",
} as const;

export type HeroImageName = keyof typeof HERO_IMAGES;

export interface HeroImageProps {
  name: HeroImageName;
  alt: string;
  className?: string;
}

/** Ein Heldenbild mit Kennzeichnung „KI-generiert“. */
export const HeroImage = ({ name, alt, className = "" }: HeroImageProps) => (
  <div
    className={`relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 ${className}`}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={HERO_IMAGES[name]}
      alt={alt}
      width={640}
      height={960}
      loading="lazy"
      className="h-full w-full object-cover object-top"
    />
    <AiLabel />
  </div>
);

export default HeroImage;
