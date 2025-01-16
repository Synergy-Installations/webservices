import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* eslint-disable-next-line */
export interface CnProps {
  inputs: ClassValue[];
}

export const cn = ({ ...inputs }: CnProps) => {
  return twMerge(clsx(inputs));
};

export default cn;
