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
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.55rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="sf-glass-strong grid w-full max-w-md grid-cols-4 gap-0.5 rounded-[1.45rem] p-1">
          {siteConfig.navItems.map((item) => {
            const isActive = pathName === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[1.05rem] px-1 text-[10px] font-medium transition duration-200",
                  isActive
                    ? "bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
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
