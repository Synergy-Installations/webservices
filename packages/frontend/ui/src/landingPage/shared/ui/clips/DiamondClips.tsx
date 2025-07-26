/* eslint-disable-next-line */
export interface DiamondClipsProps {
  src: string;
  alt: string;
  text: string;
}

export const DiamondClips = (props: DiamondClipsProps) => {
  const { src, alt = "", text = "" } = props;

  return (
    <>
      <div
        className={`
        hidden md:block w-24 h-24 md:w-40 md:h-40 lg:w-48 lg:h-48
        bg-cover bg-center
        relative
        [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]
        `}
        style={{ backgroundImage: `url(${src})` }}
        role="img"
        aria-label={alt}
      >
        {/* Overlay for darkening the image */}
        <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs md:text-lg lg:text-xl font-bold text-center">
            {text}
          </span>
        </div>
      </div>
      <span className="block md:hidden text-synergy-dark-grey text-sm md:text-lg lg:text-xl font-bold text-center">
        {text}
      </span>
    </>
  );
};

export default DiamondClips;
