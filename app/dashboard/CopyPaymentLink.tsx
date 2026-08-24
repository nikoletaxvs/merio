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
      aria-label={copied ? "Link copied" : "Copy payment link"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        copied
          ? "bg-brand text-black"
          : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        {copied ? (
          <path
            d="M4 10.5 8 14.5 16 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <rect
              x="7"
              y="7"
              width="9"
              height="9"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M13 4.5H6A1.5 1.5 0 0 0 4.5 6v7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
