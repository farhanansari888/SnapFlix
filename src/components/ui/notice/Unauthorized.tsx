"use client";

import { Button, Link } from "@heroui/react";
import React from "react";

interface UnauthorizedNoticeProps {
  title: string;
  description: string;
}

const UnauthorizedNotice: React.FC<UnauthorizedNoticeProps> = ({ title, description }) => {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center px-4 py-8">
      <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base max-w-md">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        <Button color="primary" variant="flat" as={Link} href="/auth?form=register" className="font-medium">
          Sign Up
        </Button>
        <Button color="primary" as={Link} href="/auth" className="font-medium">
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedNotice;
