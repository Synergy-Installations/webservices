/* eslint-disable-next-line */
export interface BentoButtonProps {
  children: React.ReactNode;
}

export const BentoButton = (props: BentoButtonProps) => {
  return (
    <button className="">{props.children}</button>
  );
};

export default BentoButton;