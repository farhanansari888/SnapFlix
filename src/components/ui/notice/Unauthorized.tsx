"use client";

import { Button, Link } from "@heroui/react";
import React from "react";

interface UnauthorizedNoticeProps {
  title: string;
  description: string;
}

const UnauthorizedNotice: React.FC<UnauthorizedNoticeProps> = ({ title, description }) => {
  return (
    <div className="flex h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-default-500">{description}</p>
      <div className="flex gap-2">
        <Button color="primary" variant="flat" as={Link} href="/auth?form=register">
          Sign Up
        </Button>
        <Button color="primary" as={Link} href="/auth">
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedNotice;
