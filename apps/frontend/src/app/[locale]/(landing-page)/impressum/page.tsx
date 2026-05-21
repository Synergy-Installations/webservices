import type { Metadata } from "next";
import ImpressumPage from "@com.synergy/frontend-ui/ImpressumPage";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://synergie.cc/impressum",
  },
};

export default function Page() {
  return <ImpressumPage />;
}
