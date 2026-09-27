"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";

export default function CopyPaymentLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/pay/${token}`;

    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={copyLink}
      aria-label={copied ? "Link copied" : "Copy payment link"}
    >
      <Icon name={copied ? "check" : "copy"} className="h-3 w-3" />
      {copied ? "Copied" : "Copy pay link"}
    </Button>
  );
}
