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
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");

  if (auth || player) return null;

  const isHome = pathName === "/";

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
        "top-0 left-0 right-0 fixed z-50 transition-colors duration-400 ease-in-out",
        isScrolled
          ? "bg-[#141414]/75 backdrop-blur-md shadow-2xl border-b border-white/5"
          : "bg-transparent",
      )}
    >
      {/* Left: Brand Logo */}
      <NavbarBrand className="grow-0 basis-auto shrink-0">
        {isHome || pathName === "/discover" || pathName === "/library" || pathName === "/about" ? (
          <BrandLogo size="md" />
        ) : (
          <BackButton href={tv ? "/?content=tv" : "/"} />
        )}
      </NavbarBrand>

      {/* Center: Netflix Translucent Cylinder Nav Links */}
      <NavbarContent justify="center" className="hidden md:flex grow">
        <nav className="flex items-center gap-2 lg:gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "rounded-full px-4 lg:px-5 py-1.5 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 backdrop-blur-md select-none",
                link.active
                  ? "bg-white/25 text-white font-bold border border-white/25 shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-[#D8D8D8] hover:text-white border border-white/10 hover:border-white/20",
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
