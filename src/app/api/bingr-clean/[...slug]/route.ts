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
          if (typeof navigator !== "undefined") {
            navigator.vibrate = function() { return false; };
          }
          if (typeof Navigator !== "undefined" && Navigator.prototype) {
            Navigator.prototype.vibrate = function() { return false; };
          }
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

        // Intercept internal Bingr progress calls so it returns 204 and doesn't trigger auth refresh
        (function() {
          const originalFetch = window.fetch;
          window.fetch = async function(input, init) {
            const url = typeof input === "string" ? input : (input && input.url ? input.url : "");
            if (
              url.includes("/me/progress") ||
              url.includes("/me/history") ||
              url.includes("/me/watchlist") ||
              url.includes("/me/continue") ||
              url.includes("/auth/refresh")
            ) {
              return new Response(null, {
                status: 204,
                headers: { "Access-Control-Allow-Origin": "*" }
              });
            }
            return originalFetch.apply(this, arguments);
          };
        })();

        // Robust Route & Playback Synchronizer to parent SnapFlix window
        (function syncManager() {
          let currentMedia = {
            mediaType: "${mediaType}",
            mediaId: "${mediaId}",
            season: ${mediaType === "movie" ? 0 : Number(season) || 1},
            episode: ${mediaType === "movie" ? 0 : Number(episode) || 1}
          };

          function parseWatchPath(urlOrPath) {
            if (!urlOrPath) return null;
            let p = String(urlOrPath);
            try {
              if (p.startsWith("http")) {
                p = new URL(p).pathname;
              }
            } catch (e) {}

            const parts = p.split("/").filter(Boolean);
            const idx = parts.indexOf("watch");
            if (idx === -1) return null;

            const type = parts[idx + 1];
            const id = parts[idx + 2];
            if (!type || !id) return null;

            if (type === "tv") {
              return {
                mediaType: "tv",
                mediaId: id,
                season: parseInt(parts[idx + 3], 10) || 1,
                episode: parseInt(parts[idx + 4], 10) || 1
              };
            }

            if (type === "anime") {
              return {
                mediaType: "tv",
                mediaId: id,
                season: 1,
                episode: parseInt(parts[idx + 3], 10) || 1
              };
            }

            if (type === "movie") {
              return {
                mediaType: "movie",
                mediaId: id,
                season: 0,
                episode: 0
              };
            }

            return null;
          }

          let activeVideo = null;
          let lastSentTime = -1;

          function notifyParent(eventName, customData) {
            customData = customData || {};
            try {
              const ct = activeVideo ? Math.floor(activeVideo.currentTime || 0) : 0;
              const dur = activeVideo ? Math.floor(activeVideo.duration || 0) : 0;
              const isPaused = activeVideo ? activeVideo.paused : false;

              window.parent.postMessage({
                type: "PLAYER_EVENT",
                data: {
                  event: eventName,
                  currentTime: customData.currentTime !== undefined ? customData.currentTime : ct,
                  duration: customData.duration !== undefined ? customData.duration : dur,
                  playing: customData.playing !== undefined ? customData.playing : !isPaused,
                  mediaId: currentMedia.mediaId,
                  mediaType: currentMedia.mediaType,
                  season: currentMedia.season,
                  episode: currentMedia.episode,
                  ...customData
                }
              }, "*");
            } catch(e) {}
          }

          function checkRoute(targetUrl) {
            const parsed = parseWatchPath(targetUrl || window.location.pathname);
            if (!parsed) return;

            const changed =
              parsed.mediaId !== currentMedia.mediaId ||
              parsed.season !== currentMedia.season ||
              parsed.episode !== currentMedia.episode ||
              parsed.mediaType !== currentMedia.mediaType;

            if (changed) {
              console.log("[SnapFlix Sync] Episode transition detected:", currentMedia, "->", parsed);
              currentMedia = parsed;
              lastSentTime = -1;

              // Immediately inform SnapFlix parent about episode change
              notifyParent("episodechange", {
                currentTime: 0,
                playing: true
              });
            }
          }

          // Intercept pushState & replaceState (used by React Router inside Bingr)
          const rawPushState = history.pushState;
          history.pushState = function(state, unused, url) {
            const ret = rawPushState.apply(this, arguments);
            try { checkRoute(url || window.location.pathname); } catch(e) {}
            return ret;
          };

          const rawReplaceState = history.replaceState;
          history.replaceState = function(state, unused, url) {
            const ret = rawReplaceState.apply(this, arguments);
            try { checkRoute(url || window.location.pathname); } catch(e) {}
            return ret;
          };

          window.addEventListener("popstate", () => checkRoute(window.location.pathname));
          window.addEventListener("hashchange", () => checkRoute(window.location.pathname));

          // Periodic route poll
          setInterval(() => {
            checkRoute(window.location.pathname);
          }, 400);

          function attachVideoListeners(video) {
            if (!video) return;

            const onTimeUpdate = () => {
              const ct = Math.floor(video.currentTime || 0);
              if (Math.abs(ct - lastSentTime) >= 3) {
                lastSentTime = ct;
                notifyParent("timeupdate");
              }
            };

            const onPlay = () => notifyParent("play");
            const onPause = () => notifyParent("pause");
            const onEnded = () => notifyParent("ended", { completed: true });
            const onSeeked = () => notifyParent("seeked");

            video.addEventListener("timeupdate", onTimeUpdate);
            video.addEventListener("play", onPlay);
            video.addEventListener("pause", onPause);
            video.addEventListener("ended", onEnded);
            video.addEventListener("seeked", onSeeked);
          }

          function checkVideoElement() {
            const video = document.querySelector("video");
            if (video && video !== activeVideo) {
              activeVideo = video;
              lastSentTime = -1;
              attachVideoListeners(video);
            }
          }

          setInterval(checkVideoElement, 400);

          window.addEventListener("message", (e) => {
            if (e.data && e.data.command === "getStatus") {
              notifyParent("playerstatus");
            }
          });

          if (document.readyState === "complete" || document.readyState === "interactive") {
            checkVideoElement();
          } else {
            window.addEventListener("DOMContentLoaded", checkVideoElement);
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
