"use client";

import { Button, Link } from "@heroui/react";
import { IoLockClosedOutline } from "react-icons/io5";

interface UnauthorizedNoticeProps {
  title: string;
  description: string;
}

const UnauthorizedNotice: React.FC<UnauthorizedNoticeProps> = ({ title, description }) => {
  return (
    <div className="cinema-panel mx-auto flex min-h-[52dvh] w-full max-w-xl flex-col items-center justify-center gap-4 rounded-3xl px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-[#E50914]/15 text-[#E50914] ring-1 ring-[#E50914]/30">
        <IoLockClosedOutline size={28} />
      </div>
      <p className="text-[11px] font-bold tracking-[0.28em] text-[#E50914] uppercase">Members only</p>
      <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h3>
      <p className="max-w-md text-sm text-zinc-400 sm:text-base">{description}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button
          as={Link}
          href="/auth"
          className="bg-white font-bold text-black"
        >
          Sign in
        </Button>
        <Button
          as={Link}
          href="/auth?form=register"
          variant="bordered"
          className="border-white/15 font-semibold text-white"
        >
          Create account
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedNotice;
