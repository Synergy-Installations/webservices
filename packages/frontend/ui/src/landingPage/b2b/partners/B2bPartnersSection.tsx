import Image from "next/image";
import ImageLoader from "../../../shared/utils/image/ImageLoader";

/* eslint-disable-next-line */
export interface B2bPartnersSectionProps {}

const partnerLogos = [
  "/frontend/landingPage/clients/Loxone_Logo.png",
  "/frontend/landingPage/clients/KNX_logo.svg",
  "/frontend/landingPage/clients/LOGO_Fronius_RGB_high_300dpi.jpg",
  "/frontend/landingPage/clients/Bosch-logo.svg",
  "/frontend/landingPage/clients/Logo%20Wu%CC%88rth.svg",
  "/frontend/landingPage/clients/DAIKIN_Logo_rgb.png",
];

export const B2bPartnersSection = (props: B2bPartnersSectionProps) => {
  return (
    <section className="bg-white py-20 w-full">
      <div
        className="container mx-auto px-6 lg:px-0 text-center mb-8"
        data-aos="fade-up"
      >
        <h2 className="text-3xl md:text-4xl font-bold">Einige unserer Partner</h2>
      </div>
      <div className="container mx-auto px-6 lg:px-0">
        <div
          className="flex items-center justify-center space-x-6 overflow-x-auto snap-x snap-mandatory"
          data-aos="fade-right"
        >
          {partnerLogos.map((logo) => (
            <div
              key={logo}
              className="snap-center flex-shrink-0 w-40 h-24 flex items-center justify-center bg-gray-100 rounded-lg p-4"
            >
              <Image
                loader={ImageLoader}
                width={160}
                height={80}
                src={logo}
                alt="Partner Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default B2bPartnersSection;
