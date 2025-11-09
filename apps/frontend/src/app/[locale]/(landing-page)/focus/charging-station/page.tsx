import type { Metadata } from "next";
import ChargingStationPage, {
  metadata as chargingStationMetadata,
} from "../stromtankstelle/page";

const canonicalUrl = "https://synergie.cc/focus/charging-station";
const baseMetadata = chargingStationMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default ChargingStationPage;
