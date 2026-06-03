import type { Metadata } from "next";
import NutzungsbedingungenPage from "@com.synergy/frontend-ui/NutzungsbedingungenPage";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://synergie.cc/nutzungsbedingungen",
  },
};

export default function Page() {
  return <NutzungsbedingungenPage />;
}
