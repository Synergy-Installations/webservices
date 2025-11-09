import type { Metadata } from "next";
import HeatPumpPage, {
  metadata as heatPumpMetadata,
} from "../waermepumpe/page";

const canonicalUrl = "https://synergie.cc/focus/heat-pump";
const baseMetadata = heatPumpMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default HeatPumpPage;
