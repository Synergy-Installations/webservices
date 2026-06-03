import type { Metadata } from "next";
import DatenschutzPage from "@com.synergy/frontend-ui/DatenschutzPage";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://synergie.cc/datenschutz",
  },
};

export default function Page() {
  return <DatenschutzPage />;
}
