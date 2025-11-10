import type { Metadata } from "next";
import ClimateSystemsPage, {
  metadata as climateSystemsMetadata,
} from "../klimasysteme/page";

const canonicalUrl = "https://synergie.cc/focus/climate-systems";
const baseMetadata = climateSystemsMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default ClimateSystemsPage;
