"use client";

import { useTranslations } from "next-intl";

/**
 * A decorative, fixed sun in the bottom-left corner of every landing page.
 * - The rays rotate, the face / sunglasses and the arched text stay upright.
 * - The rays are short by default but occasionally shoot out across the page.
 * - The whole sun is an external link to the Photovoltaik Konfigurator.
 * - The sun glows and emits rays over the page, but only the sun disk itself
 *   captures pointer events so the rest of the page stays interactive.
 */
export const SunConfigurator = () => {
  const t = useTranslations("LandingPage.Shared.SunWidget");

  const text = t("text");
  const href = t("href");
  const ariaLabel = t("ariaLabel");

  // Geometry (SVG user units). The sun centre sits near the bottom-left corner.
  // The box is 520 tall, so an equal left/bottom margin means CX === 520 - CY.
  const CX = 124;
  const CY = 396;
  const SUN_R = 64;
  const ARCH_R = 84; // radius of the arched-text baseline (kept close to the disk)
  const SHORT_RAYS = Array.from({ length: 16 }, (_, i) => i);
  const LONG_RAYS = Array.from({ length: 12 }, (_, i) => i);

  // Top semicircle arc, left → right, for the arched (and readable) text.
  const archPath = `M ${CX - ARCH_R},${CY} A ${ARCH_R},${ARCH_R} 0 0 1 ${CX + ARCH_R},${CY}`;

  // A shorter, centred arc for the blurry backdrop so it doesn't overhang the
  // text at the start and end. `BAND_TRIM` is the degrees cut from each end.
  const BAND_TRIM = 18;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const bx1 = CX + ARCH_R * Math.cos(rad(180 - BAND_TRIM));
  const by1 = CY - ARCH_R * Math.sin(rad(180 - BAND_TRIM));
  const bx2 = CX + ARCH_R * Math.cos(rad(BAND_TRIM));
  const by2 = CY - ARCH_R * Math.sin(rad(BAND_TRIM));
  const backdropPath = `M ${bx1},${by1} A ${ARCH_R},${ARCH_R} 0 0 1 ${bx2},${by2}`;

  return (
    <div
      aria-hidden={false}
      className="sun-root pointer-events-none fixed bottom-0 left-0 z-40 select-none"
      style={{ width: 520, height: 520 }}
    >
      <style>{`
        /* Anchor the whole widget to the bottom-left corner and shrink it on
           smaller screens so the text stays readable without covering content. */
        .sun-root { transform-origin: bottom left; }
        @media (max-width: 1024px) { .sun-root { transform: scale(0.8); } }
        @media (max-width: 640px) { .sun-root { transform: scale(0.7); } }
        @keyframes sun-rays-spin { to { transform: rotate(360deg); } }
        @keyframes sun-rays-spin-slow { to { transform: rotate(-360deg); } }
        @keyframes sun-glow-pulse {
          0%, 100% { opacity: .55; }
          50% { opacity: .9; }
        }
        /* Gentle resting "bob" that hints the sun is interactive. */
        @keyframes sun-attention {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        /* Rays are small most of the time, then briefly shoot across the page. */
        @keyframes sun-shoot {
          0%, 82%, 100% { transform: scale(1); opacity: .3; }
          89% { transform: scale(3.4); opacity: .55; }
          95% { transform: scale(3.4); opacity: .45; }
        }
        .sun-spin { animation: sun-rays-spin 26s linear infinite; transform-origin: ${CX}px ${CY}px; }
        .sun-spin-slow { animation: sun-rays-spin-slow 40s linear infinite; transform-origin: ${CX}px ${CY}px; }
        .sun-shoot { animation: sun-shoot 11s ease-in-out infinite; transform-origin: ${CX}px ${CY}px; }
        .sun-glow { animation: sun-glow-pulse 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sun-spin, .sun-spin-slow, .sun-shoot, .sun-glow, .sun-link { animation: none; }
        }
        /* Clickability affordances: pointer cursor, resting bob, hover lift,
           focus ring and a tooltip (native <title>). */
        .sun-link {
          pointer-events: auto;
          cursor: pointer;
          outline: none;
          transform-box: view-box;
          transform-origin: ${CX}px ${CY}px;
          transition: transform .25s ease, filter .25s ease;
        }
        .sun-link:hover,
        .sun-link:focus-visible {
          transform: scale(1.08);
          filter: drop-shadow(0 0 12px rgba(255, 178, 25, 0.85));
        }
        .sun-body {
          transform-box: view-box;
          transform-origin: ${CX}px ${CY}px;
          animation: sun-attention 3.2s ease-in-out infinite;
        }
        .sun-link:hover .sun-body,
        .sun-link:focus-visible .sun-body { animation-play-state: paused; }
        .sun-link:focus-visible .sun-focus-ring { opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .sun-body { animation: none; } }
      `}</style>

      <svg
        width="520"
        height="520"
        viewBox="0 0 520 520"
        fill="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="sunFace" cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#FFF6C7" />
            <stop offset="45%" stopColor="#FFD23F" />
            <stop offset="100%" stopColor="#FF9E1B" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE38A" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFC93C" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFC93C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB019" stopOpacity="0.15" />
          </linearGradient>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="textBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Wide, soft glow spreading over the page */}
        <circle
          className="sun-glow"
          cx={CX}
          cy={CY}
          r={200}
          fill="url(#sunGlow)"
          filter="url(#softBlur)"
        />

        {/* Short rays that occasionally shoot out across the website */}
        <g className="sun-spin-slow">
          <g className="sun-shoot">
            {LONG_RAYS.map((i) => {
              const angle = (i / LONG_RAYS.length) * 360;
              return (
                <polygon
                  key={`long-${i}`}
                  points={`${CX - 6},${CY - SUN_R} ${CX + 6},${CY - SUN_R} ${CX},${CY - SUN_R - 26}`}
                  fill="url(#rayGrad)"
                  transform={`rotate(${angle} ${CX} ${CY})`}
                />
              );
            })}
          </g>
        </g>

        {/* Short, bright rays rotating around the disk */}
        <g className="sun-spin">
          {SHORT_RAYS.map((i) => {
            const angle = (i / SHORT_RAYS.length) * 360;
            return (
              <polygon
                key={`short-${i}`}
                points={`${CX - 5},${CY - SUN_R + 4} ${CX + 5},${CY - SUN_R + 4} ${CX},${CY - SUN_R - 14}`}
                fill="url(#rayGrad)"
                transform={`rotate(${angle} ${CX} ${CY})`}
              />
            );
          })}
        </g>

        {/* Clickable sun: disk + sunglasses + arched text (all upright) */}
        <a
          className="sun-link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          role="button"
          aria-label={ariaLabel}
        >
          {/* Native tooltip so users see what the button does on hover */}
          <title>{ariaLabel}</title>

          {/* Focus ring (visible only on keyboard focus) */}
          <circle
            className="sun-focus-ring"
            cx={CX}
            cy={CY}
            r={SUN_R + 8}
            fill="none"
            stroke="#1D4ED8"
            strokeWidth={3}
            strokeDasharray="6 6"
            opacity={0}
          />

          <g className="sun-body">
            {/* Disk */}
            <circle
              className="sun-disk"
              cx={CX}
              cy={CY}
              r={SUN_R}
              fill="url(#sunFace)"
              stroke="#FFB019"
              strokeWidth={2}
            />

            {/* Sunglasses */}
            <g>
              {/* arms / temple connecting to the lenses */}
              <path
                d={`M ${CX - 60},${CY - 2} L ${CX - 34},${CY - 4}`}
                stroke="#1F2937"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d={`M ${CX + 60},${CY - 2} L ${CX + 34},${CY - 4}`}
                stroke="#1F2937"
                strokeWidth={5}
                strokeLinecap="round"
              />
              {/* bridge */}
              <path
                d={`M ${CX - 6},${CY + 2} Q ${CX},${CY - 6} ${CX + 6},${CY + 2}`}
                stroke="#1F2937"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
              {/* left lens */}
              <rect
                x={CX - 34}
                y={CY - 8}
                width={28}
                height={22}
                rx={9}
                fill="#111827"
                stroke="#1F2937"
                strokeWidth={3}
              />
              {/* right lens */}
              <rect
                x={CX + 6}
                y={CY - 8}
                width={28}
                height={22}
                rx={9}
                fill="#111827"
                stroke="#1F2937"
                strokeWidth={3}
              />
              {/* lens shine */}
              <rect x={CX - 30} y={CY - 5} width={9} height={6} rx={3} fill="#ffffff" opacity={0.55} />
              <rect x={CX + 10} y={CY - 5} width={9} height={6} rx={3} fill="#ffffff" opacity={0.55} />
            </g>

            {/* Smile */}
            <path
              d={`M ${CX - 22},${CY + 30} Q ${CX},${CY + 48} ${CX + 22},${CY + 30}`}
              stroke="#C2410C"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />

            {/* Arched, readable text */}
            <path id="sun-arch" d={archPath} fill="none" />
            {/* Soft blurry backdrop behind the text so it stays readable when
                the sun overlaps page content (especially on mobile). */}
            <path
              d={backdropPath}
              fill="none"
              stroke="#FFF4D2"
              strokeWidth={24}
              strokeLinecap="round"
              opacity={0.85}
              filter="url(#textBlur)"
            />
            <text
              fill="#5A2C00"
              fontSize={16.5}
              fontWeight={800}
              letterSpacing={0.3}
              style={{ paintOrder: "stroke" }}
              stroke="#FFF6D8"
              strokeWidth={2.5}
            >
              <textPath href="#sun-arch" startOffset="50%" textAnchor="middle">
                {text}
              </textPath>
            </text>
          </g>
        </a>
      </svg>
    </div>
  );
};

export default SunConfigurator;
