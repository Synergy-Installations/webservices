import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface AboutTeamMembersProps {}

export const AboutTeamMembers = (props: AboutTeamMembersProps) => {
  const t = useTranslations("LandingPage.About.Team");
  const messages = useMessages();
  const members =
    ((messages as any)?.LandingPage?.About?.Team?.members as Array<{
      name: string;
      role: string;
      image: string;
    }>) || [];

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 text-4xl font-bold -tracking-[0.01em] font-inter text-slate-800">
              {t("title")}
            </h2>
          </div>

          {/* Team members */}
          <div
            className="relative max-w-sm mx-auto grid gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-20 items-start sm:max-w-xl lg:max-w-none"
            data-aos-id-team
          >
            {members.map((member, index) => (
              <div
                key={member.name}
                className="text-center"
                data-aos="fade-up"
                data-aos-anchor="[data-aos-id-team]"
                data-aos-delay={(index % 4) * 100}
              >
                <div className="inline-flex mb-4">
                  <Image
                    className="rounded-full"
                    loader={ImageLoader}
                    src={member.image}
                    width={120}
                    height={120}
                    alt={member.name}
                  />
                </div>
                <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-1">
                  {member.name}
                </h4>
                <div className="font-medium text-base text-blue-600">
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTeamMembers;
