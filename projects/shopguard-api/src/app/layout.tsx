import './globals.css';

export const metadata = {
  title: 'ShopGuard — AI Shopping Protection',
  description: 'Detect fake reviews, hidden fees, and dark patterns before you buy. Chrome Extension, REST API, and MCP Server.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
