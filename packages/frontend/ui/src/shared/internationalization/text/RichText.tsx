import { ReactNode } from "react";

// These tags are available
type Tag = "p" | "b" | "br" | "i";

/* eslint-disable-next-line */
export interface RichTextProps {
  children(tags: Record<Tag, (chunks: ReactNode) => ReactNode>): ReactNode;
}

export const RichText = (props: RichTextProps) => {
  return (
    <div className="prose">
      {props.children({
        p: (chunks: ReactNode) => <p>{chunks}</p>,
        b: (chunks: ReactNode) => <b className="font-semibold">{chunks}</b>,
        i: (chunks: ReactNode) => <i className="italic">{chunks}</i>,
        br: () => <br />
      })}
    </div>
  );
};

export default RichText;
