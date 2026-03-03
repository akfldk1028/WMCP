import './globals.css';
import { WebMCPRegistration } from './webmcp';

export const metadata = {
  title: 'ShopGuard — Evidence-Based Shopping Protection',
  description: 'Detect fake reviews, hidden fees, and dark patterns before you buy. Chrome Extension, REST API, and MCP Server.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WebMCPRegistration />
        {children}
      </body>
    </html>
  );
}
