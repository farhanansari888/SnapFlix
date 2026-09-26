import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const path = slug.join("/");
  const targetUrl = `https://bingr.one/${path}`;

  const mediaType = slug[1] === "movie" ? "movie" : "tv";
  const mediaId = slug[2] || "";
  const season = slug[1] === "tv" ? slug[3] || "1" : "0";
  const episode = slug[1] === "tv" ? slug[4] || "1" : slug[1] === "anime" ? slug[3] || "1" : "0";

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          request.headers.get("user-agent") ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    let html = await res.text();

    // 1. Eradicate Monetag / llvpn ad tag completely
    html = html.replace(
      /(<script>[\s\S]*?llvpn\.com[\s\S]*?<\/script>)/gi,
      `<!-- Monetag Ad Tag Eradicated by SnapFlix AdShield -->`,
    );

    // 2. Pre-inject bingr_ads_off, route sync, popup blocker, and video sync monitor
    const adBlockScript = `
      <base href="/">
      <script>
        try {
          history.replaceState(null, "", "/${path}");
          sessionStorage.setItem("bingr_ads_off", "1");
        } catch(e) {}

        (function() {
          const originalOpen = window.open;
          window.open = function(url, target, features) {
            if (!url) return null;
            const str = String(url).toLowerCase();
            if (
              str.includes("ay267") ||
              str.includes("monetag") ||
              str.includes("llvpn") ||
              str.includes("highcpmgate") ||
              str.includes("popads") ||
              str.includes("adsterra") ||
              str.includes("propeller") ||
              str.includes("about:blank")
            ) {
              console.warn("[SnapFlix AdShield] Blocked internal ad popup:", str);
              return null;
            }
            return originalOpen.call(window, url, target, features);
          };
        })();

        // Mock internal Bingr progress & auth fetch calls to avoid 401 console errors
        (function() {
          const originalFetch = window.fetch;
          window.fetch = async function(input, init) {
            const url = typeof input === "string" ? input : (input && input.url ? input.url : "");
            if (
              url.includes("/me/progress") ||
              url.includes("/me/history") ||
              url.includes("/me/watchlist") ||
              url.includes("/me/continue") ||
              url.includes("/auth/refresh") ||
              url.includes("/auth/me")
            ) {
              return new Response(JSON.stringify({ success: true, anonymous: true, user: null }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            }
            return originalFetch.apply(this, arguments);
          };
        })();

        // Real-time video playback sync to parent SnapFlix window
        (function monitorVideo() {
          function attach() {
            const video = document.querySelector("video");
            if (!video) {
              return setTimeout(attach, 400);
            }

            let lastSent = -1;
            function send(event) {
              try {
                const ct = Math.floor(video.currentTime);
                const dur = Math.floor(video.duration || 0);
                if (isNaN(ct) || dur <= 0) return;
                lastSent = ct;
                window.parent.postMessage({
                  type: "PLAYER_EVENT",
                  data: {
                    event: event || (video.paused ? "pause" : "timeupdate"),
                    currentTime: ct,
                    duration: dur,
                    playing: !video.paused,
                    mediaId: "${mediaId}",
                    mediaType: "${mediaType}",
                    season: Number("${season}"),
                    episode: Number("${episode}")
                  }
                }, "*");
              } catch(e) {}
            }

            video.addEventListener("timeupdate", () => {
              if (Math.abs(video.currentTime - lastSent) >= 3) {
                send("timeupdate");
              }
            });
            video.addEventListener("play", () => send("play"));
            video.addEventListener("pause", () => send("pause"));
            video.addEventListener("ended", () => send("ended"));
            video.addEventListener("seeked", () => send("seeked"));

            window.addEventListener("message", (e) => {
              if (e.data && e.data.command === "getStatus") {
                send("playerstatus");
              }
            });
          }

          if (document.readyState === "complete" || document.readyState === "interactive") {
            attach();
          } else {
            window.addEventListener("DOMContentLoaded", attach);
          }
        })();
      </script>
    `;

    html = html.replace("<head>", `<head>${adBlockScript}`);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error loading Bingr: ${err?.message || "Unknown error"}`, {
      status: 500,
    });
  }
}
