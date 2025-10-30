"use client";

import { useRouter } from "next/navigation";

/* eslint-disable-next-line */
export interface DiamondClipsProps {
  src: string;
  alt: string;
  text: string;
  subServiceId: string;
  index: number;
  numberServices: number;
  selectedSubService: string;
  setSelectedSubService: (subService: string) => void;
  idx: number;
  service: string;
}

export const DiamondClips = (props: DiamondClipsProps) => {
  const {
    src,
    alt = "",
    text = "",
    subServiceId,
    index,
    numberServices,
    selectedSubService,
    setSelectedSubService,
    idx,
    service,
  } = props;

  const router = useRouter();

  // Set hexagons per row (adjust as needed)
  const hexagonsPerRow = 4; // Reduced from 4 to accommodate larger hexagons
  const hexagonWidth = 220; // px, larger to fit text properly
  const hexagonHeight = 220; // px, hexagon height
  const horizontalGap = 5; // Small gap between hexagons
  const verticalGap = 5; // Small gap between rows

  // Function to map original index to center-out position
  const getCenterOutPosition = (originalIdx: number) => {
    const row = Math.floor(originalIdx / hexagonsPerRow);
    const col = originalIdx % hexagonsPerRow;

    // For row 0, keep normal left-to-right order
    if (row === 0) {
      return { row, col };
    }

    // For hexagons, we'll use a simpler center-out for 3 per row
    if (row === 1) {
      // Second row: center-out pattern for 3 hexagons
      // Original order: 0,1,2 -> Center-out: 1,0,2 (center first, then sides)
      const centerOutMapping = [1, 0, 2]; // Position 1 is center, then 0,2 are edges
      const newCol =
        centerOutMapping[col] !== undefined ? centerOutMapping[col] : col;
      return { row, col: newCol };
    }

    // For subsequent rows, continue center-out pattern
    const centerOutMapping = [1, 0, 2];
    const newCol =
      centerOutMapping[col] !== undefined ? centerOutMapping[col] : col;
    return { row, col: newCol };
  };

  const position = getCenterOutPosition(idx);
  const row = position.row;
  const col = position.col;

  // Calculate the diamond pattern bounds to center it within the fixed container
  const calculatePatternBounds = () => {
    const numRows = Math.ceil(numberServices / hexagonsPerRow);
    let minX = Infinity;
    let maxX = -Infinity;

    // Calculate bounds of the entire hexagon pattern using center-out positioning
    for (let i = 0; i < numberServices; i++) {
      const position = getCenterOutPosition(i);
      const hexagonRow = position.row;
      const hexagonCol = position.col;
      // For hexagons, use honeycomb offset pattern (every other row is offset)
      const staggerOffset =
        hexagonRow % 2 === 1 ? (hexagonWidth + horizontalGap) / 2 : 0;
      const xPos = hexagonCol * (hexagonWidth + horizontalGap) + staggerOffset;

      minX = Math.min(minX, xPos);
      maxX = Math.max(maxX, xPos + hexagonWidth);
    }

    const patternWidth = maxX - minX;
    const containerWidth = 1000; // Fixed container width from SingleServiceWrapper
    const centeringOffset = (containerWidth - patternWidth) / 2 - minX;

    // Add a small right offset to balance the visual centering
    const balanceOffset = 30; // Adjust this value to fine-tune centering

    return centeringOffset;
  };

  const centeringOffset = calculatePatternBounds();
  // For hexagons, use honeycomb offset pattern (every other row is offset)
  const staggerOffset = row % 2 === 1 ? (hexagonWidth + horizontalGap) / 2 : 0;
  const xOffset =
    col * (hexagonWidth + horizontalGap) + staggerOffset + centeringOffset;
  const yOffset = row * (hexagonHeight * 0.75 + verticalGap); // 0.75 for honeycomb overlap

  return (
    <>
      <div className="flex lg:hidden items-center">
        <div className="">
          <span
            className={`inline-block w-4 h-4 mr-2 align-middle rounded-full transition-colors duration-300`}
            style={{
              backgroundColor:
                selectedSubService === subServiceId
                  ? "#0cc0df" // Tailwind's blue-500
                  : "transparent",
              border: "2px solid #0cc0df",
            }}
          />
        </div>
        <button
          onClick={() => {
            setSelectedSubService(subServiceId);
            console.log(`Navigating to #${service}`);
            router.push(`#${service}`);
          }}
          className="text-synergy-dark-grey text-base md:text-lg lg:text-xl font-bold text-center truncate"
        >
          {text}
        </button>
      </div>
      <div
        key={idx}
        style={{
          position: "absolute",
          left: xOffset,
          top: yOffset,
          width: hexagonWidth,
          height: hexagonHeight,
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
        }}
        className="transition-all hidden lg:block"
      >
        <button
          onClick={() => {
            setSelectedSubService(subServiceId);
            console.log(`Navigating to #${service}`);
            router.push(`#${service}`);
          }}
          className={`
            relative w-full h-full
            transition-all duration-300 hover:scale-105 hover:-translate-y-2
            group bg-synergy-light-blue
          `}
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            boxShadow:
              selectedSubService === subServiceId
                ? `
                0 16px 40px rgba(12, 192, 223, 0.5),
                0 12px 24px rgba(12, 192, 223, 0.4),
                0 8px 16px rgba(12, 192, 223, 0.3),
                0 4px 8px rgba(12, 192, 223, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.4),
                inset 0 -2px 4px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1)
              `
                : `
                0 12px 28px rgba(12, 192, 223, 0.3),
                0 8px 16px rgba(12, 192, 223, 0.25),
                0 4px 12px rgba(12, 192, 223, 0.2),
                0 2px 6px rgba(12, 192, 223, 0.15),
                inset 0 2px 4px rgba(255, 255, 255, 0.3),
                inset 0 -2px 4px rgba(0, 0, 0, 0.05),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            border:
              selectedSubService === subServiceId
                ? "2px solid rgba(255, 255, 255, 0.4)"
                : "2px solid rgba(255, 255, 255, 0.2)",
            filter:
              selectedSubService === subServiceId
                ? "brightness(1.1) saturate(1.2)"
                : "brightness(1)",
          }}
          role="img"
          aria-label={alt}
          data-aos="fade-right"
          data-aos-offset={`${index * 10}`}
        >
          {/* Enhanced 3D Effect Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                selectedSubService === subServiceId
                  ? `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.4) 0%, 
                    rgba(255, 255, 255, 0.2) 25%, 
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(0, 0, 0, 0.05) 75%, 
                    rgba(0, 0, 0, 0.15) 100%)`
                  : `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.3) 0%, 
                    rgba(255, 255, 255, 0.15) 25%, 
                    rgba(255, 255, 255, 0.05) 50%,
                    rgba(0, 0, 0, 0.02) 75%, 
                    rgba(0, 0, 0, 0.1) 100%)`,
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />

          {/* Additional Light Reflection */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                "linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.1) 40%, transparent 60%)",
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />

          {/* Content Container */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span
              lang="en"
              className="text-white text-sm md:text-base lg:text-lg font-bold text-center leading-tight"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordBreak: "normal",
                hyphens: "auto",
                WebkitHyphens: "auto",
                msHyphens: "auto",
              }}
            >
              {text}
            </span>
          </div>

          {/* Checked/Unchecked Icon */}
          <span className="absolute top-3 right-6">
            {selectedSubService === subServiceId ? (
              // Checked icon (simple SVG checkmark)
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="rgba(255, 255, 255, 0.9)"
                />
                <path
                  d="M7 13l3 3 7-7"
                  stroke="#0cc0df"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // Unchecked icon (empty circle)
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="2"
                  fill="rgba(255, 255, 255, 0.1)"
                />
              </svg>
            )}
          </span>
        </button>
        <button
          onClick={() => {
            setSelectedSubService(subServiceId);
            console.log(`Navigating to #${service}`);
            router.push(`#${service}`);
          }}
          className="block md:hidden bg-slate-50 text-synergy-dark-grey text-sm md:text-lg lg:text-xl font-bold text-center"
        >
          {text}
        </button>
      </div>
    </>
  );
};

export default DiamondClips;
