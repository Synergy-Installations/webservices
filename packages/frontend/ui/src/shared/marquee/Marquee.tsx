/* eslint-disable-next-line */
export interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHoverProp?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  [key: string]: any;
}

export const Marquee = (props: MarqueeProps) => {
  const {
    className,
    reverse,
    pauseOnHoverProp = false,
    children,
    vertical = false,
    repeat = 4,
  } = props;

  return (
    <div
      {...props}
      className={`group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)] ${vertical ? "flex-col" : "flex-row"} ${className}`}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`flex shrink-0 justify-around [gap:var(--gap)] 
              ${vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row"} 
              ${pauseOnHoverProp && "group-hover:[animation-play-state:paused]"} 
              ${reverse && "[animation-direction:reverse]"}`}
          >
            {children}
          </div>
        ))}
    </div>
  );
};

export default Marquee;
