import { useTranslations } from "next-intl";

/* eslint-disable-next-line */
export interface AiLabelProps {
  className?: string;
}

/**
 * Kleine Kennzeichnung „KI-generiert“ für Bilder und Inhalte,
 * die mit künstlicher Intelligenz erstellt wurden.
 * Muss in einem Element mit `position: relative` liegen.
 */
export const AiLabel = ({ className = "" }: AiLabelProps) => {
  const t = useTranslations("LandingPage.Shared");
  return (
    <span
      className={`absolute bottom-2 right-2 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm ${className}`}
    >
      {t("aiLabel")}
    </span>
  );
};

export default AiLabel;
