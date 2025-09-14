"use client"

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* eslint-disable-next-line */
export interface ScrollUpProps {}

export const ScrollUp = (props: ScrollUpProps) => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
  <></>
  );
};

export default ScrollUp;