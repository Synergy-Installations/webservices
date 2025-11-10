import type { Metadata } from "next";
import PowerStoragePage, {
  metadata as powerStorageMetadata,
} from "../stromspeicher/page";

const canonicalUrl = "https://synergie.cc/focus/power-storage";
const baseMetadata = powerStorageMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default PowerStoragePage;
