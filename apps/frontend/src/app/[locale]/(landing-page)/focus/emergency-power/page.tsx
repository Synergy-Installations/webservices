import type { Metadata } from "next";
import EmergencyPowerPage, {
  metadata as emergencyPowerMetadata,
} from "../notstromversorgung/page";

const canonicalUrl = "https://synergie.cc/focus/emergency-power";
const baseMetadata = emergencyPowerMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default EmergencyPowerPage;
