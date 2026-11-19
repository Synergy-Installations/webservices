import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import NutzungsbedingungenPage from "@com.synergy/frontend-ui/NutzungsbedingungenPage";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("nutzungsbedingungen", locale, "https://synergie.cc/nutzungsbedingungen");
}

export default function Page() {
  return <NutzungsbedingungenPage />;
}
