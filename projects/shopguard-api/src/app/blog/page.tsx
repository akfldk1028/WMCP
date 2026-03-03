import Link from 'next/link';
import type { Metadata } from 'next';
import { posts } from './posts';

export const metadata: Metadata = {
  title: 'ShopGuard Blog — Shopping Safety Tips & Guides',
  description:
    'Learn how to detect fake reviews, dark patterns, and hidden fees. Tips for safe online shopping.',
  openGraph: {
    title: 'ShopGuard Blog',
    description: 'Shopping safety tips, dark pattern guides, and product reviews.',
  },
};

export default function BlogIndex() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>ShopGuard Blog</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Guides, tips, and research on safe online shopping.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {posts.map((post) => (
          <article
            key={post.slug}
            style={{
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <time style={{ fontSize: 13, color: '#999' }}>{post.date}</time>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '4px 0 8px' }}>
              <Link href={`/blog/${post.slug}`} style={{ color: '#111', textDecoration: 'none' }}>
                {post.title}
              </Link>
            </h2>
            <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6 }}>{post.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
