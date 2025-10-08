import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function WebflowPage({
  params,
}: {
  params: Promise<{ oldWebsiteId: string }>;
}) {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/api/webflow?page=${(await params).oldWebsiteId}`;

  const res = await fetch(absoluteUrl);
  if (!res.ok) notFound();
  // if (!res.ok) throw new Error("Failed to fetch Webflow content");

  const html = await res.text();

  return (
    <div className="relative">
      <div
        className="webflow-container"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// export default function Page(): JSX.Element {
//   const ref = useRef<HTMLIFrameElement>(null);
//   const [height, setHeight] = useState("0px");
//   const onLoad = () => {
//     setHeight(ref?.current?.contentWindow?.document.body.scrollHeight + "px");
//   };

//   useEffect(() => {
//     if (!ref.current) return;
//     const resizeObserver = new ResizeObserver(() => {
//       onLoad();
//     });
//     resizeObserver.observe(ref.current);
//     return () => resizeObserver.disconnect(); // clean up
//   }, []);

//   return (
//     <iframe
//       ref={ref}
//       onLoad={onLoad}
//       id="myFrame"
//       src="https://synergie.cc/b2b"
//       width="100%"
//       className="relative top-[-88px] md:top-[-104px] xl:top-[-137px]"
//       height={height}
//       scrolling="no"
//       frameBorder="0"
//       style={{
//         width: "100%",
//         height: height,
//         overflow: "auto",
//         // clip: "rect(2500px, 0px, 800px, 0px)",
//         position: "relative",
//         // top: "-137px",
//         // left: "-160px",
//       }}
//     ></iframe>
//   );
// }
