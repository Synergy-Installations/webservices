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
            <h2 className="h2 text-4xl font-bold -tracking-[0.01em] font-inter text-slate-800">
              Unser Team stellt sich vor
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
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-1">
                Michael Riegler
              </h4>
              <div className="font-medium text-base text-blue-600">
                Gründer
              </div>
            </div>

            

            {/* 2rd member */}
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
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-1">
                Samuel Knechtl
              </h4>
              <div className="font-medium text-base text-blue-600">
                Projekt Manager Innendienst
              </div>
            </div>

            {/* 3th member */}
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
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-1">
                Filip Marencin
              </h4>
              <div className="font-medium text-base text-blue-600">
                Projektmanager Außendienst
              </div>
            </div>
            {/* 3th member */}
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
                  src={"/frontend/landingPage/about/strichmaennchen.jpg"}
                  width={120}
                  height={120}
                  alt="Member 04"
                />
              </div>
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-1">
                Karin Rosenberger
              </h4>
              <div className="font-medium text-base text-blue-600">
                Kundenservice & Marketing Agent
              </div>
            </div>

            {/* 4nd member */}
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
              <h4 className="h4 text-2xl font-bold -tracking-[0.01em] font-inter text-slate-800 mb-1">
                Elias Cerne
              </h4>
              <div className="font-medium text-base text-blue-600">
                Partner, IT Operator
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTeamMembers;
