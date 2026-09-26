import { NextRequest, NextResponse } from "next/server";

async function handleProxy(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
) {
  const { path } = await paramsPromise;
  const search = request.nextUrl.search;
  const targetUrl = `https://api.bingr.one/api/${path.join("/")}${search}`;

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

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const data = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/json";

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

