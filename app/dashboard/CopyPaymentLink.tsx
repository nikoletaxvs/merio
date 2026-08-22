"use client";

import { useState } from "react";

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
    <button
      type="button"
      onClick={copyLink}
      className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-[0.99]"
    >
      {copied ? "✓ Link copied" : "Copy payment link"}{" "}
    </button>
  );
}
