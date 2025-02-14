// app/api/webflow/route.ts
import { JSDOM } from "jsdom";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageQuery = searchParams.get("page");

    const webflowURL = `https://synergie-montagen.webflow.io/${pageQuery}`;
    const res = await fetch(webflowURL, { cache: "no-store" });

    if (!res.ok) throw new Error("Failed to fetch Webflow page");

    const html = await res.text();

    // Load the HTML into JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove header and footer
    document.querySelector(".navbar")?.remove();
    document.querySelector(".footer")?.remove();

    return new Response(dom.serialize(), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return new Response("Error fetching Webflow content", { status: 500 });
  }
}
