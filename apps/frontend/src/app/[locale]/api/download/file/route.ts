import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const name = searchParams.get("name");

  if (!url || !name) {
    return new NextResponse("Missing url or name", { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
    
    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
