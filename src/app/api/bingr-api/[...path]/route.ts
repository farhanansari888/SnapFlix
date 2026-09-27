import { NextRequest, NextResponse } from "next/server";

async function handleProxy(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
) {
  const { path } = await paramsPromise;
  const pathString = path.join("/");

  // Intercept internal user/progress endpoints to return 204 No Content (silencing refresh loops)
  if (
    pathString.startsWith("me/") ||
    pathString === "me" ||
    pathString === "auth/refresh"
  ) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // auth/me must return 401 so Bingr stays in guest mode and does NOT show "Who's watching?"
  if (pathString === "auth/me") {
    return NextResponse.json(
      { code: 401, message: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
  }

  const search = request.nextUrl.search;
  const targetUrl = `https://api.bingr.one/api/${pathString}${search}`;

  try {
    let body: BodyInit | undefined = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      const text = await request.text();
      if (text) body = text;
    }

    const headers: Record<string, string> = {
      "User-Agent":
        request.headers.get("user-agent") ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: request.headers.get("accept") || "application/json",
    };
    if (request.headers.get("content-type")) {
      headers["Content-Type"] = request.headers.get("content-type")!;
    }
    if (request.headers.get("authorization")) {
      headers["Authorization"] = request.headers.get("authorization")!;
    }

    const isStreamEndpoint =
      pathString === "stream" || pathString.startsWith("stream/");

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const contentType = res.headers.get("content-type") || "application/json";

    // Intercept stream lookups to eradicate preview thumbnail tiles disguised as videos (e.g. 1:59 rousav.tech tiles)
    if (isStreamEndpoint && res.ok && contentType.includes("application/json")) {
      try {
        const json = await res.json();
        if (json && Array.isArray(json.sources)) {
          const isBogusStream = (s: any) => {
            if (!s || !s.url) return true;
            const u = String(s.url).toLowerCase();
            return (
              u.includes("rousav.tech") ||
              u.includes("tiles.m3u8") ||
              u.includes("/tiles/") ||
              u.includes("bigtits.m3u8")
            );
          };

          json.sources = json.sources.filter((s: any) => !isBogusStream(s));

          // If no legitimate movie/show streams remain on this server, return 404
          // This immediately triggers Bingr frontend's server failover to try Bastion, Corvus, Edmunds, etc.
          if (json.sources.length === 0) {
            return NextResponse.json(
              { error: "No valid video sources on this scraper (preview tiles filtered)" },
              {
                status: 404,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods":
                    "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
                  "Access-Control-Allow-Headers": "*",
                },
              },
            );
          }
        }

        return NextResponse.json(json, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch {
        // Fallback to arrayBuffer if json parsing fails
      }
    }

    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || "Proxy error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

