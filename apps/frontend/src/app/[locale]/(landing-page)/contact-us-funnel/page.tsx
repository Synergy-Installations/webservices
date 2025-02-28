import { ContactBlocks } from "@com.synergy/frontend-ui/ContactBlocks";
import { ContactCommunity } from "@com.synergy/frontend-ui/ContactCommunity";
import { Form } from "@com.synergy/frontend-ui/Form";
import Funnel from "@com.synergy/frontend-ui/Funnel";
import FunnelLayout from "@com.synergy/frontend-ui/FunnelLayout";
import RichText from "@com.synergy/frontend-ui/RichText";
import { useTranslations } from "next-intl";

export default function Page(): JSX.Element {
  const t = useTranslations("LandingPage.ContactUs.Header");

  return (
    <FunnelLayout>
      <Funnel />
    </FunnelLayout>
  );
}
