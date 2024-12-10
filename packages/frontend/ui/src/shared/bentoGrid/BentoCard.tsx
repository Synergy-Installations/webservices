import { BentoButton } from "@com.synergy/frontend-ui/BentoButton";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
import HeatPump from "../images/heat-pump.jpg";
import Image from "next/image";
import { BorderBeam } from "../border/BorderBeam";
import { ShineBorder } from "../border/ShineBorder";

/* eslint-disable-next-line */
export interface BentoCardProps {
  type: "full" | "simple";
  borderAnimation?: "beam" | "shine";
  name: string;
  className: string;
  background: React.ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}

export const BentoCard = (props: BentoCardProps) => {
  const {
    type,
    borderAnimation,
    name,
    className,
    background,
    Icon,
    description,
    href,
    cta,
  } = props;

  return type === "simple" ? (
    borderAnimation === "shine" ? (
      <ShineBorder
        className={`group relative h-[298px] rounded-3xl overflow-hidden ${className}`}
        color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        borderRadius={24}
      >
        <Link href={href} key={name}>
          {background}
          <div className="absolute w-full h-1/2 group-hover:h-full bottom-0 bg-gradient-to-t from-black/60 to-transparent to-50% transition-all"></div>
          <p className="absolute bottom-0 text-white p-4 pl-6 group-hover:pb-20 font-semibold text-4xl transition-all">
            {name}
          </p>
          <p className="absolute bottom-0 text-white p-4 pl-6 opacity-0 group-hover:opacity-100 group-hover:pb-14 text-md transition-all">
            {description}
          </p>
          <button className="absolute flex items-center bottom-0 left-0 text-white group-hover:bg-slate-50/30 px-2 m-4 ml-6 rounded-md opacity-0 group-hover:opacity-100 group-hover:mb-6 text-sm transition-all">
            <p className="">{cta}</p>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </Link>
      </ShineBorder>
    ) : (
      <Link
        href={href}
        key={name}
        className={`group relative h-[298px] rounded-3xl overflow-hidden ${className}`}
      >
        {background}
        <div className="absolute w-full h-1/2 group-hover:h-full bottom-0 bg-gradient-to-t from-black/60 to-transparent to-50% transition-all"></div>
        <p className="absolute bottom-0 text-white p-4 pl-6 group-hover:pb-20 font-semibold text-4xl transition-all">
          {name}
        </p>
        <p className="absolute bottom-0 text-white p-4 pl-6 opacity-0 group-hover:opacity-100 group-hover:pb-14 text-md transition-all">
          {description}
        </p>
        <button className="absolute flex items-center bottom-0 left-0 text-white group-hover:bg-slate-50/30 px-2 m-4 ml-6 rounded-md opacity-0 group-hover:opacity-100 group-hover:mb-6 text-sm transition-all">
          <p className="">{cta}</p>
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </button>
        {borderAnimation === "beam" && (
          <BorderBeam size={250} duration={12} delay={9} />
        )}
      </Link>
    )
  ) : type === "full" ? (
    <div
      key={name}
      className={`
        "group relative h-[298px] col-span-3 flex flex-col justify-between overflow-hidden rounded-xl 
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] 
        "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] 
        ${className}
     `}
    >
      <div>{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
      </div>

      <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button className="pointer-events-auto">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  ) : (
    <div>Wrong type</div>
  );
};

export default BentoCard;
