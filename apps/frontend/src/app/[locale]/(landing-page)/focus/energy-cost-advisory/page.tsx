import type { Metadata } from "next";
import EnergyCostAdvisoryPage, {
  metadata as energyCostAdvisoryMetadata,
} from "../energiekostenberatung/page";

const canonicalUrl = "https://synergie.cc/focus/energy-cost-advisory";
const baseMetadata = energyCostAdvisoryMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default EnergyCostAdvisoryPage;
