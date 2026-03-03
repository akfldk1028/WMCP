import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://shopguard-api.vercel.app';

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/seller`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${base}/refund`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${base}/leaderboard`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
  ];

  const blogSlugs = [
    'amazon-fake-review-checker',
    'hidden-fees-online-shopping',
    'is-this-product-legit',
    'dark-pattern-examples-shopping',
    'online-shopping-safety-tips',
    'fakespot-alternatives',
    'dark-patterns-guide',
    'honey-alternatives',
  ];

  const blogPages = blogSlugs.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
