import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { posts, getPostBySlug } from '../posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://shopguard-api.vercel.app/blog/${post.slug}`;
  return {
    title: `${post.title} — ShopGuard Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Simple markdown-to-HTML: headings, bold, links, lists, paragraphs
  const html = post.content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    description: post.description,
    author: { '@type': 'Organization', name: 'ShopGuard' },
    publisher: { '@type': 'Organization', name: 'ShopGuard' },
  };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/blog" style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none' }}>
        &larr; Back to Blog
      </a>
      <time style={{ display: 'block', fontSize: 13, color: '#999', marginTop: 16 }}>
        {post.date}
      </time>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 24px' }}>{post.title}</h1>
      <article
        style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
