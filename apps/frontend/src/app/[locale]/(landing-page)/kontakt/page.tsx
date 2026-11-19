import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import PageContainer from "@com.synergy/frontend-ui/PageContainer";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata("kontakt", locale, "https://synergie.cc/kontakt");
}

export default function Page(): JSX.Element {
  return (
    <PageContainer
      storageZoneAccessKey={process.env.STORAGE_ZONE_ACCESS_KEY}
    />
  );
}
