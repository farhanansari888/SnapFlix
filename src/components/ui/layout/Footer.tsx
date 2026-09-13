"use client";

import { cn } from "@/utils/helpers";
import Link from "next/link";
import React from "react";
import { IoHeart, IoShieldCheckmarkOutline } from "react-icons/io5";
import BrandLogo from "../other/BrandLogo";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={cn(
        "w-full bg-[#070707] text-zinc-400 border-t border-white/5 pt-12 pb-8 px-6 sm:px-10 md:px-16 select-none",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-8">
          {/* Column 1: Brand & Feature Info */}
          <div className="flex flex-col gap-3.5 items-start">
            <BrandLogo size="md" align="left" />

            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              The next-generation cinema streaming experience powered by high performance Ultra HD
              stream servers.
            </p>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 pt-1">
              <IoShieldCheckmarkOutline size={15} className="shrink-0" />
              <span>Ultra HD Optimized</span>
            </div>
          </div>

          {/* Column 2: Explore Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">EXPLORE</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Featured Spotlight
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?type=popular&content=movie"
                  className="hover:text-white transition-colors"
                >
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link href="/discover?content=tv" className="hover:text-white transition-colors">
                  TV Series &amp; Shows
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?type=todayTrending"
                  className="hover:text-white transition-colors"
                >
                  Top Trending Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Streaming Engine Features */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              STREAMING ENGINE
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <IoShieldCheckmarkOutline size={14} className="text-[#E50914] shrink-0" />
                <span>SnapFlix Ultra HD Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <IoShieldCheckmarkOutline size={14} className="text-[#E50914] shrink-0" />
                <span>Auto-Adaptive Quality Switcher</span>
              </li>
              <li className="flex items-center gap-2">
                <IoShieldCheckmarkOutline size={14} className="text-[#E50914] shrink-0" />
                <span>Multi-Resolution Stream Proxy</span>
              </li>
              <li className="flex items-center gap-2">
                <IoShieldCheckmarkOutline size={14} className="text-[#E50914] shrink-0" />
                <span>4K Cinema Playback</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Disclaimer */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              LEGAL DISCLAIMER
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-normal">
              SnapFlix does not host or store any media content on its servers. All media metadata is
              curated for high quality presentation. Video streams are served via third-party iframe
              embed APIs.
            </p>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full border-t border-white/5 my-4" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-2">
          <p className="text-zinc-500 text-center sm:text-left">
            © 2026 SnapFlix Cinema. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 text-zinc-400 text-center sm:text-right flex-wrap justify-center">
            <span>Designed and Developed with</span>
            <IoHeart className="text-[#E50914] fill-[#E50914] shrink-0 inline-block" size={13} />
            <span>by</span>
            <a
              href="https://ansarixfarhan.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold tracking-wider text-xs transition-all duration-200 hover:scale-105"
            >
              FARHAN ANSARI
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
