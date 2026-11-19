import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import ImpressumPage from "@com.synergy/frontend-ui/ImpressumPage";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("impressum", locale, "https://synergie.cc/impressum");
}

export default function Page() {
  return <ImpressumPage />;
}
