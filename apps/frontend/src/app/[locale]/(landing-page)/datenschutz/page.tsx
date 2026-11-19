import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import DatenschutzPage from "@com.synergy/frontend-ui/DatenschutzPage";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("datenschutz", locale, "https://synergie.cc/datenschutz");
}

export default function Page() {
  return <DatenschutzPage />;
}
