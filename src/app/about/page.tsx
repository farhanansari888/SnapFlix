import { siteConfig } from "@/config/site";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { NextPage } from "next";
import Footer from "@/components/ui/layout/Footer";

const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

export const metadata: Metadata = {
  title: `Help Center & FAQ | ${siteConfig.name}`,
};

const AboutPage: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen justify-between pt-20">
      <div className="flex w-full justify-center px-4 md:px-8 py-8">
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left border-b border-white/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-black text-white">
              SnapFlix <span className="text-[#E50914]">Help Center</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Frequently asked questions and guides for your private streaming experience.
            </p>
          </div>

          <Suspense>
            <FAQ />
          </Suspense>

          <div className="mt-8 rounded-lg bg-[#181818] border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">Need more assistance?</h3>
              <p className="text-xs text-gray-400 mt-1">Our customer support specialists are available 24/7.</p>
            </div>
            <a
              href="mailto:support@snapflix.internal"
              className="bg-[#E50914] hover:bg-[#B81D24] text-white font-semibold text-xs md:text-sm px-5 py-2.5 rounded-sm transition-colors shadow-md"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
