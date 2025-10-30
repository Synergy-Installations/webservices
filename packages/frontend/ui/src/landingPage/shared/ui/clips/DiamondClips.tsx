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

  // Set diamonds per row (adjust as needed)
  const diamondsPerRow = 4;
  const diamondWidth = 220; // px, adjust to match your diamond size
  const diamondHeight = 160; // px, adjust to match your diamond size
  const verticalGap = 24; // px, vertical gap between rows

  // Function to map original index to center-out position
  const getCenterOutPosition = (originalIdx: number) => {
    const row = Math.floor(originalIdx / diamondsPerRow);
    const col = originalIdx % diamondsPerRow;

    // For row 0, keep normal left-to-right order
    if (row === 0) {
      return { row, col };
    }

    // For row 1 and beyond, arrange from center out
    if (row === 1) {
      // Second row: center-out pattern
      // Original order: 0,1,2,3 -> Center-out: 1,2,0,3 (center positions first)
      const centerOutMapping = [1, 2, 0, 3]; // Positions 1,2 are center, then 0,3 are edges
      const newCol =
        centerOutMapping[col] !== undefined ? centerOutMapping[col] : col;
      return { row, col: newCol };
    }

    // For subsequent rows, continue center-out pattern
    const centerOutMapping = [1, 2, 0, 3];
    const newCol =
      centerOutMapping[col] !== undefined ? centerOutMapping[col] : col;
    return { row, col: newCol };
  };

  const position = getCenterOutPosition(idx);
  const row = position.row;
  const col = position.col;

  // Calculate the diamond pattern bounds to center it within the fixed container
  const calculatePatternBounds = () => {
    const numRows = Math.ceil(numberServices / diamondsPerRow);
    let minX = Infinity;
    let maxX = -Infinity;

    // Calculate bounds of the entire diamond pattern using center-out positioning
    for (let i = 0; i < numberServices; i++) {
      const position = getCenterOutPosition(i);
      const diamondRow = position.row;
      const diamondCol = position.col;
      const staggerOffset = diamondRow % 2 === 1 ? diamondWidth / 2 : 0;
      const xPos = diamondCol * diamondWidth + staggerOffset;

      minX = Math.min(minX, xPos);
      maxX = Math.max(maxX, xPos + diamondWidth);
    }

    const patternWidth = maxX - minX;
    const containerWidth = 1000; // Fixed container width from SingleServiceWrapper
    const centeringOffset = (containerWidth - patternWidth) / 2 - minX;

    // Add a small right offset to balance the visual centering
    const balanceOffset = 30; // Adjust this value to fine-tune centering

    return centeringOffset + balanceOffset;
  };

  const centeringOffset = calculatePatternBounds();
  const staggerOffset = row % 2 === 1 ? diamondWidth / 2 : 0;
  const xOffset = col * diamondWidth + staggerOffset + centeringOffset;
  const yOffset = row * (diamondHeight * 0.7 + verticalGap); // 0.7 to account for diamond overlap

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
          width: diamondWidth,
          height: diamondHeight,
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
        hidden md:block w-24 h-24 md:w-40 md:h-40 
        bg-synergy-light-blue relative
        shadow-md hover:shadow-lg transition-shadow duration-300
        backdrop-blur-md
          `}
          style={{
            transform: "rotate(45deg)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
          role="img"
          aria-label={alt}
          data-aos="fade-right"
          data-aos-offset={`${index * 70}`}
        >
          {/* Overlay for extra backdrop effect */}
          <div
            className="absolute inset-0 bg-white bg-opacity-20 pointer-events-none backdrop-blur-sm"
            style={{
              borderRadius: "16px",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              borderRadius: "16px",
              transform: "rotate(-45deg)",
            }}
          >
            <span className="text-white text-xs md:text-base lg:text-lg font-bold text-center">
              {text}
            </span>
            {/* Checked/Unchecked Icon */}
            <span
              className="absolute top-2 right-2"
              style={{ transform: "rotate(45deg)" }}
            >
              {selectedSubService === subServiceId ? (
                // Checked icon (simple SVG checkmark)
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#0cc0df" />
                  <path
                    d="M7 13l3 3 7-7"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Unchecked icon (empty circle)
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="11"
                    stroke="#0cc0df"
                    strokeWidth="2"
                    fill="#f8fafc"
                  />
                </svg>
              )}
            </span>
          </div>
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
