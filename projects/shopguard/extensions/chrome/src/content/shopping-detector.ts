/** Detect whether the current page is a shopping site */

const SHOPPING_DOMAINS = [
  'amazon.', 'coupang.com', 'ebay.', 'aliexpress.com', 'walmart.com',
  'etsy.com', 'temu.com', 'shein.com', 'gmarket.co.kr', '11st.co.kr',
  'shopping.naver.com', 'shop.naver.com', 'smartstore.naver.com',
  'target.com', 'bestbuy.com', 'newegg.com', 'shopee.', 'lazada.',
  'rakuten.', 'mercari.com', 'taobao.com', 'jd.com', 'musinsa.com',
  'zigzag.kr', 'brandi.co.kr', 'ssg.com', 'lotteon.com', 'kurly.com',
  'oliveyoung.co.kr', 'auction.co.kr', 'interpark.com', 'wemakeprice.com',
  'tmon.co.kr',
];

function matchesDomain(hostname: string): boolean {
  return SHOPPING_DOMAINS.some((d) => hostname.includes(d));
}

function hasProductMeta(): boolean {
  const ogType = document.querySelector('meta[property="og:type"]');
  if (ogType?.getAttribute('content')?.includes('product')) return true;

  const ldJsons = document.querySelectorAll('script[type="application/ld+json"]');
  for (const el of ldJsons) {
    try {
      const data = JSON.parse(el.textContent ?? '');
      const type = data?.['@type'];
      if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) return true;
    } catch { /* ignore */ }
  }

  return false;
}

export function isShoppingSite(): boolean {
  return matchesDomain(location.hostname) || hasProductMeta();
}
