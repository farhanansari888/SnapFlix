import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const targetUrl = `https://bingr.one/brand/${path.join("/")}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          request.headers.get("user-agent") ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: request.headers.get("accept") || "*/*",
      },
      cache: "force-cache",
    });

    if (!res.ok) {
      return new NextResponse(`Brand asset not found`, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error proxying brand asset`, { status: 500 });
  }
}
