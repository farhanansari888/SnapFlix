import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const fileName = path[path.length - 1];
  const targetUrl = `https://bingr.one/assets/${path.join("/")}`;

  try {
    const isEnvJs = fileName.startsWith("env-") && fileName.endsWith(".js");

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          request.headers.get("user-agent") ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: request.headers.get("accept") || "*/*",
      },
      ...(isEnvJs ? { cache: "no-store" } : { next: { revalidate: 86400 } }),
    });

    if (!res.ok) {
      return new NextResponse(`Asset not found`, { status: res.status });
    }

    // Intercept env config to disable ads and redirect API calls to our CORS-free proxy
    if (isEnvJs) {
      let code = await res.text();
      code = code.replaceAll("https://api.bingr.one/api", "/api/bingr-api");
      code = code.replaceAll("`true`", "`false`");
      code = code.replace(/adsEnabled:\s*!0/g, "adsEnabled:!1");

      return new NextResponse(code, {
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const is3x2Js = fileName.startsWith("3x2-") && fileName.endsWith(".js");
    if (is3x2Js) {
      let code = await res.text();
      // Prioritize high-reliability full-movie scrapers (Bastion, Corvus, Edmunds) before s40
      code = code.replace(
        "[{id:`s40`,name:`Aphelion`,cc:`GL`},{id:`s70`,name:`Polaris`,cc:`US`},{id:`s62`,name:`Bastion`,cc:`IN`}",
        "[{id:`s62`,name:`Bastion`,cc:`IN`},{id:`s61`,name:`Corvus`,cc:`US`},{id:`s3`,name:`Edmunds`,cc:`US`},{id:`s70`,name:`Polaris`,cc:`US`},{id:`s40`,name:`Aphelion`,cc:`GL`}",
      );

      return new NextResponse(code, {
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const contentType =
      res.headers.get("content-type") ||
      (targetUrl.endsWith(".js")
        ? "application/javascript"
        : targetUrl.endsWith(".css")
        ? "text/css"
        : targetUrl.endsWith(".woff2")
        ? "font/woff2"
        : "application/octet-stream");

    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error proxying asset: ${err?.message || "Unknown error"}`, {
      status: 500,
    });
  }
}
