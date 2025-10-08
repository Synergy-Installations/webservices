import AboutCta from "@com.synergy/frontend-ui/AboutCta";
import AboutHero from "@com.synergy/frontend-ui/AboutHero";
import AboutStats from "@com.synergy/frontend-ui/AboutStats";
import AboutStory from "@com.synergy/frontend-ui/AboutStory";
import AboutTeamMembers from "@com.synergy/frontend-ui/AboutTeamMembers";
import Head from "next/head";

export const metadata = {
  alternates: {
    canonical: "https://synergie.cc/about-us",
  },
};

export default function Page() {
  return (
    <>
      <Head>
        <title>B2B Services | Synergiemontagen.eco</title>
        <meta
          name="description"
          content="Professionelle B2B-Services im Bereich Photovoltaik, Wärmepumpen & Co. für Unternehmen. Qualität, Effizienz & After-Sales aus einer Hand."
        />
      </Head>
      <AboutHero />
      <AboutStats />
      <AboutStory />
      <AboutTeamMembers />
      <AboutCta />
    </>
  );
}
