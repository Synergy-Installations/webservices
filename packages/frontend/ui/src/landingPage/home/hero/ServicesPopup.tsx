import Link from "next/link";
import ImageLoader from "../../../shared/utils/image/ImageLoader";
import Image from "next/image";
import { BentoItem } from "./BentoGrid";

/* eslint-disable-next-line */
export interface ServicesPopupProps {}

export const ServicesPopup = (props: ServicesPopupProps) => {
  const items: BentoItem[] = [
    {
      id: "pv",
      title: "Photovoltaik & Stromspeicher",
      description: "Strom direkt vom Dach",
      image: "/frontend/landingPage/products/AA%20Dach-montage.jpg",
      rowSpan: 3,
      button: {
        link: "/products#photovoltaic",
        text: "Hier Photovoltaik sichern",
      },
    },
    {
      id: "heat",
      title: "Wärmepumpen",
      image: "/frontend/landingPage/products/heat-pump-orange.jpg",
      rowSpanSm: 2,
      button: {
        link: "/products#heat-pump",
        text: "Hier Wärmepumpe sichern",
      },
    },
    {
      id: "ac",
      title: "Klimasysteme",
      image:
        "/frontend/landingPage/products/close-up-shot-of-air-conditioner-hanging-on-white-2024-11-19-02-00-43-utc.jpeg",
      rowSpanSm: 2,
      button: {
        link: "/products#air-conditioning",
        text: "Hier Klimasystem sichern",
      },
    },
    {
      id: "smart-home",
      title: "Smart Home",
      image: "/frontend/landingPage/products/AA%20Smart%20Home.jpeg",
      button: {
        link: "/products#smart-home",
        text: "Mehr erfahren",
      },
    },
    {
      id: "energiegemeinschaften",
      title: "Energiegemeinschaften",
      image: "/frontend/landingPage/products/AdobeStock_562132787.jpeg",
      button: {
        link: "/focus/energiegemeinschaft",
        text: "Mehr erfahren",
      },
    },
    {
      id: "stromtankstelle",
      title: "Stromtankstelle",
      image:
        "/frontend/landingPage/products/AA%20Wallbox%20AdobeStock_762399295.jpeg",
      button: {
        link: "/products#wallbox",
        text: "Mehr erfahren",
      },
    },
    {
      id: "notstrom",
      title: "Notstrom Versorgung",
      image: "/frontend/landingPage/products/notstromversorgung.svg",
      button: {
        link: "/focus/notstromversorgung",
        text: "Mehr erfahren",
      },
    },
    {
      id: "balkonkraftwerk",
      title: "Balkonkraftwerk",
      image: "/frontend/landingPage/focus/Heat-Pump/Balkonkraftwerk.jpg",
      button: {
        link: "/focus/balkonkraftwerk",
        text: "Mehr erfahren",
      },
    },
    {
      id: "energiekosten-beratung",
      title: "Energiekosten-Beratung",
      image:
        "/frontend/landingPage/products/a-hand-holding-the-electricity-bill-and-euro-bankn-2025-03-13-01-30-07-utc.jpeg",
      button: {
        link: "/focus/energiekostenberatung",
        text: "Mehr erfahren",
      },
    },
    {
      id: "warmwasser",
      title: "Autarke Warmwasser-Erzeugung",
      image:
        "/frontend/landingPage/products/boiling-water-splash-with-steam-on-black-backgroun-2025-03-13-11-28-22-utc.jpeg",
      button: {
        link: "/focus/autarke-warmwasser-erzeugung",
        text: "Mehr erfahren",
      },
    },
    {
      id: "wartung-service",
      title: "Wartung & Service",
      image:
        "/frontend/landingPage/products/certified-male-electrician-installing-home-ev-char-2024-10-18-05-46-25-utc.jpeg",
      button: {
        link: "/focus/wartung-service",
        text: "Mehr erfahren",
      },
    },
  ];

  return (
    <dialog
      id="productsModal"
      className="rounded-lg w-[95%] max-w-4xl p-0"
      // inline backdrop styling for nicer dim and animate
      style={{ border: "none", background: "transparent" }}
      onClose={() => {
        // restore page scrolling when modal has fully closed
        document.body.style.overflow = "";
        // ensure class cleaned up
        const dlg = document.getElementById(
          "productsModal"
        ) as HTMLDialogElement | null;
        dlg?.classList.remove("is-closing");
      }}
      onCancel={(e) => {
        // prevent immediate native close so we can animate out
        e.preventDefault();
        const dlg = e.currentTarget as HTMLDialogElement;
        dlg.classList.add("is-closing");
        // delay actual close until animation completes
        window.setTimeout(() => dlg.close?.(), 200);
      }}
      onClick={(e) => {
        // close when clicking on the backdrop (i.e. the dialog itself,
        // not its inner content) — animate out first then close.
        if (e.target === e.currentTarget) {
          const dlg = e.currentTarget as HTMLDialogElement;
          dlg.classList.add("is-closing");
          window.setTimeout(() => dlg.close?.(), 200);
        }
      }}
    >
      {/* small styles to animate backdrop + panel when dialog gains [open]
                    and to animate out when .is-closing is present
                  */}
      <style
        // plain style tag is fine inside component markup
        dangerouslySetInnerHTML={{
          __html: `
        #productsModal::backdrop {
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(3px);
          transition: opacity 200ms ease;
          opacity: 1;
        }
        #productsModal:not([open])::backdrop {
          opacity: 0;
        }
        #productsModal .modal-panel {
          transform: translateY(0) scale(1);
          opacity: 1;
          transition: transform 200ms ease, opacity 200ms ease;
        }
        #productsModal.is-closing .modal-panel {
          transform: translateY(-8px) scale(.98);
          opacity: 0;
        }
                    `,
        }}
      />
      <div className="modal-panel bg-white rounded-lg shadow-lg overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Produkte</h3>
          <button
            type="button"
            className="text-slate-600 hover:text-slate-900"
            onClick={() => {
              const dlg = document.getElementById(
                "productsModal"
              ) as HTMLDialogElement | null;
              if (!dlg) return;
              // animate out then close
              dlg.classList.add("is-closing");
              window.setTimeout(() => {
                dlg.close?.();
                // restore scroll will run in onClose
              }, 200);
            }}
            aria-label="Schließen"
          >
            ✕
          </button>
        </header>

        <div className="p-4 max-h-[60vh] overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.button?.link ?? "#"}
                className="flex flex-col items-center bg-slate-50 rounded-md p-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-synergy-light-blue"
                aria-label={item.title}
                onClick={() => {
                  // restore scroll immediately when navigating away
                  document.body.style.overflow = "";
                  // ensure dialog closed
                  (
                    document.getElementById(
                      "productsModal"
                    ) as HTMLDialogElement | null
                  )?.close?.();
                }}
              >
                <div className="w-full h-32 relative overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    loader={ImageLoader}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="mt-2 text-center text-sm font-medium text-slate-800">
                  {item.title}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <footer className="px-4 py-3 border-t flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded bg-synergy-light-blue text-white hover:opacity-90"
            onClick={() => {
              const dlg = document.getElementById(
                "productsModal"
              ) as HTMLDialogElement | null;
              if (!dlg) return;
              dlg.classList.add("is-closing");
              window.setTimeout(() => dlg.close?.(), 200);
            }}
          >
            Schließen
          </button>
        </footer>
      </div>
    </dialog>
  );
};

export default ServicesPopup;
