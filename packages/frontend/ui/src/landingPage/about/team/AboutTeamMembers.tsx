import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface AboutTeamMembersProps {}

export const AboutTeamMembers = (props: AboutTeamMembersProps) => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 text-4xl font-bold -tracking-[0.01em] font-playfair-display text-slate-800">
              Was ist uns wichtig? Allerlei Dinge!
            </h2>
          </div>

          {/* Team members */}
          <div
            className="relative max-w-sm mx-auto grid gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-20 items-start sm:max-w-xl lg:max-w-none"
            data-aos-id-team
          >
            {/* 1st member */}
            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-anchor="[data-aos-id-team]"
            >
              <div className="inline-flex mb-4">
                <Image
                  className="rounded-full"
                  loader={ImageLoader}
                  src={"/frontend/landingPage/about/IMG_0398_Micheal.jpg"}
                  width={120}
                  height={120}
                  alt="Member 01"
                />
              </div>
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-playfair-display text-slate-800 mb-1">
                Michael Riegler
              </h4>
              <div className="font-medium text-base text-blue-600">
                CEO &amp; Founder
              </div>
            </div>

            {/* 2nd member */}
            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-anchor="[data-aos-id-team]"
              data-aos-delay={100}
            >
              <div className="inline-flex mb-4">
                <Image
                  className="rounded-full"
                  loader={ImageLoader}
                  src={"/frontend/landingPage/about/IMG_0398_Elias_2.jpeg"}
                  width={120}
                  height={120}
                  alt="Member 02"
                />
              </div>
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-playfair-display text-slate-800 mb-1">
                Elias Cerne
              </h4>
              <div className="font-medium text-base text-blue-600">
                CTO, Lead Engineer
              </div>
            </div>

            {/* 3rd member */}
            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-anchor="[data-aos-id-team]"
              data-aos-delay={200}
            >
              <div className="inline-flex mb-4">
                <Image
                  className="rounded-full"
                  loader={ImageLoader}
                  src={"/frontend/landingPage/about/IMG_0398_Samuel_2.jpeg"}
                  width={120}
                  height={120}
                  alt="Member 03"
                />
              </div>
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-playfair-display text-slate-800 mb-1">
                Samuel Knechtl
              </h4>
              <div className="font-medium text-base text-blue-600">
                Projekt Manager
              </div>
            </div>

            {/* 4th member */}
            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-anchor="[data-aos-id-team]"
              data-aos-delay={300}
            >
              <div className="inline-flex mb-4">
                <Image
                  className="rounded-full"
                  loader={ImageLoader}
                  src={"/frontend/landingPage/about/IMG_0398_Filip.jpeg"}
                  width={120}
                  height={120}
                  alt="Member 04"
                />
              </div>
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-playfair-display text-slate-800 mb-1">
                Filip Mareno
              </h4>
              <div className="font-medium text-base text-blue-600">
                Installationsleiter
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTeamMembers;
