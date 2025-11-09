import type { Metadata } from "next";
import PhotovoltaikPage, {
  metadata as photovoltaikMetadata,
} from "../photovoltaik/page";

const canonicalUrl = "https://synergie.cc/focus/photovoltaics";
const baseMetadata = photovoltaikMetadata as Metadata;

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...(baseMetadata?.alternates ?? {}),
    canonical: canonicalUrl,
  },
};

export default PhotovoltaikPage;
