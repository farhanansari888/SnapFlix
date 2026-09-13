"use client";

import { siteConfig } from "@/config/site";
import { useDocumentTitle } from "@mantine/hooks";
import { Button } from "@heroui/react";
import Link from "next/link";

export default function NotFound() {
  useDocumentTitle(`404 Not Found | ${siteConfig.name}`);

  return (
    <div className="absolute-center text-center">
      <h1>404</h1>
      <h4>Not Found</h4>
      <p>The page you are looking for doesn't exist.</p>
      <Button as={Link} href="/" className="mt-8">
        Home
      </Button>
    </div>
  );
}
