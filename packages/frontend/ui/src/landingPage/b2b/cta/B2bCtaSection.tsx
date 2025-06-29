import Link from "next/link";

/* eslint-disable-next-line */
export interface B2bCtaSectiomnProps {}

export const B2bCtaSection = (props: B2bCtaSectiomnProps) => {
  return (
    <section
      className="relative bg-blue-600 text-white max-w-5xl mx-4 lg:mx-auto overflow-hidden  rounded-2xl py-20 mt-12"
      data-aos="fade-up"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[30%] from-synergy-light-blue to-synergy-dark-grey opacity-90" />
      <div className="relative container mx-auto px-6 lg:px-0 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Bereit für Ihr nächstes Energieprojekt?
        </h2>
        <p className="mb-8 text-lg md:text-xl">
          Kontaktieren Sie uns jetzt für eine maßgeschneiderte Lösung, die Ihr
          Unternehmen nachhaltig stärkt.
        </p>
        <div className="relative mx-auto grid xs:flex gap-4 sm:w-fit mt-12 sm:mt-6 before:hidden before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
          <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center items-center">
            <Link
              className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line flex items-center justify-center h-full"
              href={"/kontakt"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line justify-center">
                Kontakt
                <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                  <div className=" whitespace-nowrap">{"->"}</div>
                </div>
              </span>
            </Link>
          </div>
          <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
            <Link
              className="btn group mb-0 !py-4 !px-5 !text-lg w-full before:opacity-100 before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-gradient-to-t before:from-synergy-light-blue/70 before:via-synergy-light-blue before:to-synergy-light-blue/70 hover:before:from-synergy-light-blue hover:before:to-synergy-light-blue before:shadow-xl text-white shadow sm:w-auto break-words whitespace-pre-line"
              href={"/contact-us-funnel"}
            >
              <span className="relative inline-flex items-center ml-1 tracking-normal text-white transition-transform group-hover:translate-x-0.5 break-words whitespace-pre-line">
                Buchen Sie Ihre PV Montage
                <div className="tracking-normal text-white group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                  <div className=" whitespace-nowrap">{"->"}</div>
                </div>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default B2bCtaSection;
