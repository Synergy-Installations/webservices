/* eslint-disable-next-line */
export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid = (props: BentoGridProps) => {
  const { children, className } = props;

  return (
    <div
      className={`grid w-full auto-rows-[22rem] grid-cols-2 gap-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
