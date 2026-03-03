'use client';

import { useState } from 'react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          ...(storeUrl.trim() ? { storeUrl: storeUrl.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setStoreUrl('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        padding: '20px 28px',
        borderRadius: 12,
        background: 'var(--green-bg)',
        color: 'var(--green)',
        fontWeight: 600,
        fontSize: 15,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            padding: '14px 18px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            fontSize: 15,
            fontFamily: 'var(--font)',
            outline: 'none',
            width: '100%',
          }}
        />
        <input
          type="url"
          placeholder="https://yourstore.com (optional)"
          value={storeUrl}
          onChange={e => setStoreUrl(e.target.value)}
          style={{
            padding: '14px 18px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            fontSize: 15,
            fontFamily: 'var(--font)',
            outline: 'none',
            width: '100%',
          }}
        />
      </div>
      <button
        type="submit"
        className="btn-primary"
        disabled={status === 'loading'}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {status === 'error' && (
        <p style={{ color: 'var(--red)', fontSize: 14, marginTop: 10 }}>
          {message}
        </p>
      )}
    </form>
  );
}
