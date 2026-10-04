"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";

const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  if (!show) return null;

  return (
    <>
      <div className="h-24 md:hidden" aria-hidden />
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="grid w-full max-w-md grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-[#0c0c0e]/82 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {siteConfig.navItems.map((item) => {
            const isActive = pathName === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition duration-200",
                  isActive
                    ? "bg-[#E50914] text-white shadow-[0_8px_20px_rgba(229,9,20,0.38)]"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="size-5">{isActive ? item.activeIcon : item.icon}</span>
                <span className={cn("leading-none", isActive && "font-semibold")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavbar;
