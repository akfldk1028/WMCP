'use client';

import { useState } from 'react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://shopguard-api.vercel.app/leaderboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  };

  return (
    <button
      className="btn-secondary"
      style={{ fontSize: 14, padding: '10px 20px', cursor: 'pointer' }}
      onClick={handleCopy}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
