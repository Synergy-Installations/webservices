"use client";

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
  } = props;

  return (
    <>
      <button
        onClick={() => setSelectedSubService(subServiceId)}
        className={`
        hidden md:block w-24 h-24 md:w-44 md:h-44 lg:w-48 lg:h-48
        bg-cover bg-center
        relative
        [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]
        shadow-md hover:shadow-lg transition-shadow duration-300
        `}
        style={{ backgroundImage: `url(${src})` }}
        role="img"
        aria-label={alt}
        data-aos="fade-right"
        data-aos-offset={`${index * 100}`}
        // data-aos-duration=""
      >
        {/* Overlay for darkening the image */}
        <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs md:text-base lg:text-lg font-bold text-center">
            {text}
          </span>
        </div>
      </button>
      <button
        onClick={() => setSelectedSubService(subServiceId)}
        className="block md:hidden text-synergy-dark-grey text-sm md:text-lg lg:text-xl font-bold text-center"
      >
        {text}
      </button>
    </>
  );
};

export default DiamondClips;
