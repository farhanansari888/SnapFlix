"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import UserProfileButton from "../button/UserProfileButton";
import BrandLogo from "../other/BrandLogo";
import NavSearch from "./NavSearch";

const TopNavbar = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const currentContent = searchParams.get("content");
  const [{ y }] = useWindowScroll();
  const isScrolled = y > 25;

  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player") || pathName.startsWith("/watch");
  const auth = pathName.includes("/auth");

  if (auth || player) return null;

  const isHome = pathName === "/";
  const isMediaRoute = pathName.startsWith("/movie/") || pathName.startsWith("/tv/");

  const navLinks = [
    { label: "Home", href: "/", active: isHome && !currentContent },
    { label: "TV Series", href: "/?content=tv", active: isHome && currentContent === "tv" },
    { label: "Movies", href: "/?content=movie", active: isHome && currentContent === "movie" },
    { label: "New & Popular", href: "/discover", active: pathName === "/discover" },
    { label: "My List", href: "/library", active: pathName === "/library" },
  ];

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{
        wrapper: "px-4 md:px-12 h-16 md:h-18 max-w-full",
      }}
      className={cn(
        "top-0 left-0 right-0 fixed z-50 transition-all duration-400 ease-in-out",
        isScrolled
          ? "bg-[#0c0c0e]/78 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl border-b border-white/8"
          : "bg-linear-to-b from-black/70 via-black/25 to-transparent",
      )}
    >
      {/* Left: Brand Logo */}
      <NavbarBrand className="grow-0 basis-auto shrink-0">
        {!isMediaRoute ? (
          <BrandLogo size="md" />
        ) : (
          <BackButton href={tv ? "/?content=tv" : "/"} />
        )}
      </NavbarBrand>

      {/* Center: Netflix Translucent Cylinder Nav Links */}
      <NavbarContent justify="center" className="hidden md:flex grow">
        <nav className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/40 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 lg:px-4 py-1.5 text-xs lg:text-sm font-semibold tracking-wide transition-all duration-200 select-none",
                link.active
                  ? "bg-[#E50914] text-white shadow-[0_6px_16px_rgba(229,9,20,0.4)]"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </NavbarContent>

      {/* Right: Actions */}
      <NavbarContent justify="end" className="gap-2 sm:gap-3 md:gap-4 shrink-0 grow-0 basis-auto">
        {/* Interactive In-Navbar Search with Live Overlay */}
        <NavbarItem>
          <NavSearch />
        </NavbarItem>

        <NavbarItem>
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
