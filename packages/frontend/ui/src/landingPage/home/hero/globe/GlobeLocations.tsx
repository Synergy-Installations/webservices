import { GLOBE_GRID, GLOBE_LAND, GLOBE_PINS, GLOBE_WATER } from "./globeData";

export interface GlobeLocationsProps {
  /** Beschriftungen der beiden Stecknadeln */
  labels: { austria: string; zambia: string };
  className?: string;
}

/** Stecknadel mit sanftem Puls-Ring */
const Pin = ({
  x,
  y,
  label,
  side,
}: {
  x: number;
  y: number;
  label: string;
  side: "left" | "right";
}) => {
  const w = label.length * 7 + 16;
  const lx = side === "right" ? x + 7 : x - 7 - w;
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill="#e4572e" opacity="0.35">
        <animate attributeName="r" values="4;11;4" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0;0.45" dur="2.4s" repeatCount="indefinite" />
      </circle>
      {/* Nadelkopf + Spitze */}
      <path
        d={`M${x},${y} l-4,-8 a4.6,4.6 0 1 1 8,0 z`}
        fill="#e4572e"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx={x} cy={y - 10.5} r="1.6" fill="#fff" />
      <rect x={lx} y={y - 21} width={w} height={18} rx="9" fill="#fff" opacity="0.95" />
      <text
        x={lx + w / 2}
        y={y - 8}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#3c3c3b"
      >
        {label}
      </text>
    </g>
  );
};

/** Stilisierter Globus mit Stecknadeln in Österreich und Sambia. */
export const GlobeLocations = ({ labels, className = "" }: GlobeLocationsProps) => (
  <svg
    viewBox="0 0 220 220"
    className={className}
    role="img"
    aria-label={`${labels.austria}, ${labels.zambia}`}
  >
    <defs>
      <radialGradient id="globe-ocean" cx="38%" cy="32%" r="75%">
        <stop offset="0" stopColor="#9fe3f0" />
        <stop offset="1" stopColor="#1a9bb5" />
      </radialGradient>
      <radialGradient id="globe-shine" cx="35%" cy="28%" r="60%">
        <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <clipPath id="globe-clip">
        <circle cx="110" cy="110" r="100" />
      </clipPath>
    </defs>
    <circle cx="110" cy="110" r="100" fill="url(#globe-ocean)" />
    <g clipPath="url(#globe-clip)">
      <path d={GLOBE_GRID} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.6" />
      {GLOBE_LAND.map((d, i) => (
        <path key={i} d={d} fill="#f4f4f4" stroke="#b2b2b2" strokeWidth="0.5" />
      ))}
      {GLOBE_WATER.map((d, i) => (
        <path key={i} d={d} fill="#5cc8de" />
      ))}
      <circle cx="110" cy="110" r="100" fill="url(#globe-shine)" />
    </g>
    <circle cx="110" cy="110" r="100" fill="none" stroke="#fff" strokeOpacity="0.6" />
    <Pin {...GLOBE_PINS.austria} label={labels.austria} side="right" />
    <Pin {...GLOBE_PINS.zambia} label={labels.zambia} side="right" />
  </svg>
);

export default GlobeLocations;
