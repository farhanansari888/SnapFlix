"use client";

import { useEffect, useState } from "react";
import { Chip } from "@heroui/react";
import { IoShieldCheckmark } from "react-icons/io5";
import { usePathname } from "next/navigation";

// Known malicious / ad networks / popunder domains
const BLOCKED_DOMAINS = [
  "ay267.com",
  "ay267",
  "monetag",
  "llvpn.com",
  "alwingulla",
  "highcpmgate",
  "popads",
  "adsterra",
  "propellerads",
  "juicyads",
  "exoclick",
  "trafficjunky",
  "bet365",
  "1xbet",
  "onclickalgo",
  "adx",
  "doubleclick",
  "googleads",
];

export default function AdShield() {
  const pathname = usePathname();
  const [blockedCount, setBlockedCount] = useState(0);
  const isWatch = pathname.startsWith("/watch");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Monkey-patch window.open to intercept ad popups and new-tab spam
    const originalOpen = window.open;
    window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
      if (!url) return null;
      const urlStr = url.toString().toLowerCase();

      // Check if URL matches known ad domains or popunders
      const isAdUrl = BLOCKED_DOMAINS.some((domain) => urlStr.includes(domain));
      const isBlankPopunder = urlStr === "about:blank" || urlStr === "";

      if (isAdUrl || (isBlankPopunder && target === "_blank")) {
        console.warn("[SnapFlix AdShield] Blocked popup ad:", urlStr);
        setBlockedCount((c) => c + 1);
        return null;
      }

      return originalOpen.call(window, url, target, features);
    };

    // 2. Intercept suspicious document clicks & popunder triggers
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target or parent is an ad anchor
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        const href = anchor.href.toLowerCase();
        if (BLOCKED_DOMAINS.some((d) => href.includes(d))) {
          e.preventDefault();
          e.stopPropagation();
          console.warn("[SnapFlix AdShield] Intercepted ad click:", href);
          setBlockedCount((c) => c + 1);
        }
      }
    };

    // 3. MutationObserver to purge any dynamically injected ad scripts / iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();

            if (tag === "script" || tag === "iframe") {
              const src = (el.getAttribute("src") || "").toLowerCase();
              if (BLOCKED_DOMAINS.some((domain) => src.includes(domain))) {
                el.remove();
                console.warn("[SnapFlix AdShield] Removed dynamic ad element:", src);
                setBlockedCount((c) => c + 1);
              }
            }

            // Remove full-screen clickjack invisible overlays
            if (
              el.style &&
              (el.style.zIndex === "999999" || el.style.zIndex === "2147483647") &&
              el.style.position === "fixed" &&
              !el.classList.contains("snapflix-trusted")
            ) {
              const text = el.innerText || "";
              if (text.length === 0) {
                el.remove();
                console.warn("[SnapFlix AdShield] Removed clickjack overlay element");
                setBlockedCount((c) => c + 1);
              }
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.open = originalOpen;
      observer.disconnect();
      window.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  // Display subtle shield badge on /watch routes so the user knows AdShield is protecting them
  if (!isWatch) return null;

  return (
    <div className="fixed bottom-3 left-4 z-40 pointer-events-auto snapflix-trusted select-none">
      <Chip
        variant="flat"
        size="sm"
        color="success"
        className="bg-black/70 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-medium shadow-lg px-2.5 py-1"
        startContent={
          <div className="flex items-center gap-1.5 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <IoShieldCheckmark size={14} className="text-emerald-400" />
          </div>
        }
      >
        <span>AdBlock Active</span>
        {blockedCount > 0 && (
          <span className="ml-1 text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
            {blockedCount} blocked
          </span>
        )}
      </Chip>
    </div>
  );
}
