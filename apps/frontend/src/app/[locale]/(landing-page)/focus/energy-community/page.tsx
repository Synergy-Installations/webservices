import type { Metadata } from "next";
import EnergyCommunityPage, {
  metadata as energyCommunityMetadata,
} from "../energiegemeinschaft/page";

const canonicalUrl = "https://synergie.cc/focus/energy-community";
const baseMetadata = energyCommunityMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default EnergyCommunityPage;
