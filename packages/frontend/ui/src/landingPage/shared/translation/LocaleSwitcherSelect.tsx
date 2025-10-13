import { useParams, usePathname, useRouter } from "next/navigation";
import { ChangeEvent, ReactNode, useRef, useTransition } from "react";

/* eslint-disable-next-line */
export interface LocaleSwitcherSelectProps {
  children: ReactNode;
  defaultValue: string;
  label: string;
  showSvgIcon?: boolean;
}

export const LocaleSwitcherSelect = (props: LocaleSwitcherSelectProps) => {
  const { children, defaultValue, label, showSvgIcon = false } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const selectRef = useRef<HTMLSelectElement>(null);

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    // Create the new path by replacing the current locale with the new one
    const newPath = pathname.replace(
      /^\/[a-z]{2}(-[A-Z]{2})?/,
      `/${nextLocale}`
    );
    startTransition(() => {
      router.replace(newPath);
    });
  }

  return (
    <>
      {showSvgIcon ? (
        <div className="relative inline-flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            className="pointer-events-none"
          >
            <path d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z" />
          </svg>
          <select
            ref={selectRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            defaultValue={defaultValue}
            disabled={isPending}
            onChange={onSelectChange}
          >
            {children}
          </select>
          <p className="sr-only">{label}</p>
        </div>
      ) : (
        <label
          className={`
            relative text-gray-400
            ${isPending && "transition-opacity [&:disabled]:opacity-30"}
          `}
        >
          <p className="sr-only">{label}</p>
          <select
            ref={selectRef}
            className="inline-flex appearance-none bg-transparent py-3 pl-2 pr-6"
            defaultValue={defaultValue}
            disabled={isPending}
            onChange={onSelectChange}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-2 top-[8px]">
            ⌄
          </span>
        </label>
      )}
    </>
  );
};

export default LocaleSwitcherSelect;
