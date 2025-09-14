import { ReactNode } from "react";

// These tags are available
type Tag = "p" | "b" | "br" | "i" | "li";

/* eslint-disable-next-line */
export interface RichTextProps {
  children(tags: Record<Tag, (chunks: ReactNode) => ReactNode>): ReactNode;
  className?: string;
}

export const RichText = (props: RichTextProps) => {
  const { className = "" } = props;
  return (
    <div className={`prose`}>
      {props.children({
        p: (chunks: ReactNode) => <p className={className}>{chunks}</p>,
        b: (chunks: ReactNode) => <b className="font-semibold">{chunks}</b>,
        i: (chunks: ReactNode) => <i className="italic">{chunks}</i>,
        br: () => <br />,
        li: (chunks: ReactNode) => <li>{chunks}</li>,
      })}
    </div>
  );
};

export default RichText;
