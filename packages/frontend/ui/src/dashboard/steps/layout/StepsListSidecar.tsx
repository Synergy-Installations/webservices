"use client";
import { SubmitSingle } from "@com.synergy/frontend-ui/SubmitSingle";
import { SingleSubmitTabs } from "@com.synergy/frontend-ui/SingleSubmitTabs";
import { StepsList } from "@com.synergy/frontend-ui/StepsList";
import { useEffect, useRef, useState } from "react";

/* eslint-disable-next-line */
export interface StepsListSidecarProps {
  children?: React.ReactNode;
  params: { id: string; stepId: string };
  stepsListOpen: boolean;
  setStepsListOpen: (open: boolean) => void;
}

export const StepsListSidecar = (props: StepsListSidecarProps) => {
  const { children, params, stepsListOpen, setStepsListOpen } = props;

  const [userNavOpen, setUserNavOpen] = useState<boolean>(false);

  const mobileNavTrigger = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLDivElement>(null);

  const userNavTrigger = useRef<HTMLButtonElement>(null);
  const userNav = useRef<HTMLDivElement>(null);

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (
        !mobileNav.current ||
        !mobileNavTrigger.current ||
        !userNav.current ||
        !userNavTrigger.current
      )
        return;
      if (
        (!stepsListOpen && !userNavOpen) ||
        mobileNav.current.contains(target as Node) ||
        mobileNavTrigger.current.contains(target as Node) ||
        userNav.current.contains(target as Node) ||
        userNavTrigger.current.contains(target as Node)
      )
        return;
      setStepsListOpen(false);
      setUserNavOpen(false);
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if ((!stepsListOpen && !userNavOpen) || keyCode !== 27) return;
      setStepsListOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
      <SubmitSingle
        params={params}
        STORAGE_ZONE_ACCESS_KEY={process.env.STORAGE_ZONE_ACCESS_KEY}
        stepsListOpen={stepsListOpen}
        setStepsListOpen={setStepsListOpen}
      />
      <div className="flex justify-between h-full lg:mr-96">
        <aside
          id="logo-sidebar"
          ref={mobileNav}
          className={`fixed md:hidden left-0 z-20 h-screen transition-transform ${stepsListOpen ? "md:-translate-x-full" : "-translate-x-full"} bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
          aria-label="Sidebar"
        >
          <SingleSubmitTabs params={params} />
          <StepsList className="pb-60" params={params} />
        </aside>
        <div className="hidden md:block w-1/2">
          <SingleSubmitTabs params={params} />
          <StepsList className="pb-48" params={params} />
        </div>
        {/* <div className="w-1/2 border-l border-gray-200"> */}
        {children}
        {/* </div> */}
      </div>
    </>
  );
};

export default StepsListSidecar;
