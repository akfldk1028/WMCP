export const metadata = {
  title: 'ShopGuard API — Fake Review & Dark Pattern Detection',
  description: 'REST API for detecting fake reviews, hidden fees, and dark patterns on shopping pages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
