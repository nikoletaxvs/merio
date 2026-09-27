"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

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
//add icons for svg in icon component and make a button component as well
  return (
    <button
      type="button"
      onClick={copyLink}
      aria-label={copied ? "Link copied" : "Copy payment link"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        copied
          ? "bg-brand text-black"
          : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
      }`}
    >
      <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
