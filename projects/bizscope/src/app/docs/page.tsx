import Link from 'next/link';
import { headers } from 'next/headers';
import { ArrowLeft, Terminal, Package, Puzzle, Globe, Wrench } from 'lucide-react';
import { getMessages, detectLocale } from '@/i18n';
import type { Locale } from '@/i18n/types';
import LocaleSwitcher from '@/components/LocaleSwitcher';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Terminal; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10">
          <Icon className="size-5 text-indigo-500" />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

const TOOLS_TABLE = [
  { cat: 'Company Analysis', count: 18, ex: 'company-overview, pest-analysis, swot-summary, final-implications' },
  { cat: 'Idea Validation', count: 15, ex: 'idea-overview, market-size, unit-economics, action-plan' },
  { cat: 'Planning (BMC)', count: 2, ex: 'bmc-generate, bmc-update' },
  { cat: 'Planning (Service)', count: 9, ex: 'plan-executive-summary, plan-dev-roadmap, plan-status' },
  { cat: 'Planning Bridge', count: 1, ex: 'plan-to-analysis' },
  { cat: 'Utilities', count: 5, ex: 'web-search, financial-data, income-history, balance-sheet, stock-history' },
];

function content(locale: Locale) {
  const isKo = locale === 'ko';
  return {
    title: isKo ? 'API & MCP 문서' : 'API & MCP Documentation',
    subtitle: isKo
      ? 'Claude Code, AI 에이전트, 또는 직접 API 호출로 BizScope AI의 50개 분석 도구를 사용하세요.'
      : 'Use BizScope AI\'s 50 analysis tools via Claude Code, AI agents, or direct API calls.',
    quickStart: isKo ? '빠른 시작 (1줄)' : 'Quick Start (1 line)',
    quickStartDesc: isKo
      ? 'Claude Code에서 이 명령어 하나면 50개 도구가 즉시 활성화됩니다:'
      : 'Run this single command in Claude Code to activate all 50 tools:',
    withKey: isKo ? 'API 키가 있는 경우:' : 'With API key:',
    directUrl: isKo ? '또는 npm 없이 직접 URL:' : 'Or direct URL without npm:',
    npmTitle: isKo ? 'npm 패키지' : 'npm Package',
    npmDesc: isKo
      ? '로컬 stdio 프록시로 동작합니다. BizScope 서버에 연결하여 JSON-RPC를 중계합니다.'
      : 'Runs as a local stdio proxy. Connects to BizScope server and relays JSON-RPC.',
    desktopTitle: isKo ? 'Claude Desktop' : 'Claude Desktop',
    desktopDesc: isKo
      ? 'Claude Desktop 앱에서 사용하려면 설정 파일에 아래 내용을 추가하세요:'
      : 'To use with Claude Desktop app, add this to your config file:',
    desktopPath: isKo
      ? '설정 파일 위치:'
      : 'Config file location:',
    pluginTitle: isKo ? 'Claude Code 플러그인' : 'Claude Code Plugin',
    pluginDesc: isKo
      ? '슬래시 커맨드와 자동 스킬이 포함된 플러그인입니다. 마켓플레이스 등록 후 사용 가능합니다.'
      : 'Plugin with slash commands and auto-skills. Available after marketplace approval.',
    pluginCommands: isKo ? '포함된 커맨드:' : 'Included commands:',
    mcpTitle: isKo ? 'MCP 엔드포인트 (직접 호출)' : 'MCP Endpoint (Direct)',
    mcpDesc: isKo
      ? '어떤 MCP 클라이언트에서든 직접 연결할 수 있습니다. Streamable HTTP (권장) 또는 SSE를 지원합니다.'
      : 'Connect from any MCP client. Supports Streamable HTTP (recommended) or SSE.',
    httpLabel: isKo ? 'Streamable HTTP (권장)' : 'Streamable HTTP (recommended)',
    sseLabel: isKo ? 'SSE (레거시)' : 'SSE (legacy)',
    toolsTitle: isKo ? '도구 목록 (50개)' : 'Tools (50 total)',
    authTitle: isKo ? '인증' : 'Authentication',
    authDesc: isKo
      ? 'API 키가 설정된 경우 Bearer 토큰으로 인증합니다. 키가 없으면 오픈 액세스입니다.'
      : 'Uses Bearer token auth when API key is configured. Open access when no key is set.',
    catLabel: isKo ? '카테고리' : 'Category',
    countLabel: isKo ? '개수' : 'Count',
    exLabel: isKo ? '예시' : 'Examples',
    thenAsk: isKo
      ? '설치 후 Claude에게 이렇게 말하세요:'
      : 'After setup, just ask Claude:',
  };
}

export default async function DocsPage() {
  const hdrs = await headers();
  const locale = detectLocale(null, hdrs.get('accept-language'), hdrs.get('cookie'));
  const { ui } = getMessages(locale);
  const c = content(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="size-4" />
            {ui.appName}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {ui.nav.pricing}
            </Link>
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">{c.title}</h1>
        <p className="mt-3 text-muted-foreground">{c.subtitle}</p>

        <div className="mt-10 space-y-6">
          {/* Quick Start */}
          <Section icon={Terminal} title={c.quickStart}>
            <p>{c.quickStartDesc}</p>
            <CodeBlock>claude mcp add bizscope -- npx -y @bizscope-ai/mcp</CodeBlock>
            <p>{c.withKey}</p>
            <CodeBlock>claude mcp add bizscope -- npx -y @bizscope-ai/mcp --key YOUR_API_KEY</CodeBlock>
            <p>{c.directUrl}</p>
            <CodeBlock>claude mcp add --transport http bizscope https://bizscope-rho.vercel.app/api/mcp</CodeBlock>
            <div className="mt-4 rounded-lg border bg-emerald-500/5 p-4">
              <p className="font-medium text-foreground">{c.thenAsk}</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>&quot;Analyze Samsung Electronics&quot;</li>
                <li>&quot;Validate my startup idea for an AI tutoring app&quot;</li>
                <li>&quot;Run a SWOT analysis on Apple&quot;</li>
              </ul>
            </div>
          </Section>

          {/* npm Package */}
          <Section icon={Package} title={c.npmTitle}>
            <p>{c.npmDesc}</p>
            <CodeBlock>{`# npmjs.com/package/@bizscope-ai/mcp
npx -y @bizscope-ai/mcp
npx -y @bizscope-ai/mcp --key YOUR_API_KEY`}</CodeBlock>
          </Section>

          {/* Claude Desktop */}
          <Section icon={Terminal} title={c.desktopTitle}>
            <p>{c.desktopDesc}</p>
            <CodeBlock>{`{
  "mcpServers": {
    "bizscope": {
      "command": "npx",
      "args": ["-y", "@bizscope-ai/mcp"],
      "env": {
        "BIZSCOPE_API_KEY": "your_key_here"
      }
    }
  }
}`}</CodeBlock>
            <p>{c.desktopPath}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li><code className="rounded bg-muted px-1.5 py-0.5">macOS</code> ~/Library/Application Support/Claude/claude_desktop_config.json</li>
              <li><code className="rounded bg-muted px-1.5 py-0.5">Windows</code> %APPDATA%\Claude\claude_desktop_config.json</li>
            </ul>
          </Section>

          {/* Plugin */}
          <Section icon={Puzzle} title={c.pluginTitle}>
            <p>{c.pluginDesc}</p>
            <CodeBlock>/plugin install bizscope-ai@claude-plugins-official</CodeBlock>
            <p>{c.pluginCommands}</p>
            <ul className="list-inside list-disc space-y-1">
              <li><code className="rounded bg-muted px-1.5 py-0.5 text-xs">/analyze Samsung Electronics</code> &mdash; Company analysis</li>
              <li><code className="rounded bg-muted px-1.5 py-0.5 text-xs">/analyze idea: AI tutoring app</code> &mdash; Idea validation</li>
              <li><code className="rounded bg-muted px-1.5 py-0.5 text-xs">/search market trends AI</code> &mdash; Web search</li>
              <li><code className="rounded bg-muted px-1.5 py-0.5 text-xs">/finance Tesla</code> &mdash; Financial data</li>
              <li><code className="rounded bg-muted px-1.5 py-0.5 text-xs">/planning AI tutoring app</code> &mdash; BMC + Service plan</li>
            </ul>
          </Section>

          {/* MCP Endpoint */}
          <Section icon={Globe} title={c.mcpTitle}>
            <p>{c.mcpDesc}</p>
            <p className="font-medium text-foreground">{c.httpLabel}</p>
            <CodeBlock>{`POST https://bizscope-rho.vercel.app/api/mcp
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"bizscope-web-search","arguments":{"query":"Samsung Electronics revenue 2025"}}}`}</CodeBlock>
            <p className="font-medium text-foreground">{c.sseLabel}</p>
            <CodeBlock>{`GET https://bizscope-rho.vercel.app/api/mcp  -> SSE stream
POST https://bizscope-rho.vercel.app/api/mcp?sessionId=xxx  -> JSON-RPC`}</CodeBlock>
          </Section>

          {/* Tools Table */}
          <Section icon={Wrench} title={c.toolsTitle}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase text-muted-foreground">
                    <th className="pb-2 pr-4">{c.catLabel}</th>
                    <th className="pb-2 pr-4">{c.countLabel}</th>
                    <th className="pb-2">{c.exLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS_TABLE.map((row) => (
                    <tr key={row.cat} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{row.cat}</td>
                      <td className="py-2.5 pr-4 tabular-nums">{row.count}</td>
                      <td className="py-2.5"><code className="text-xs">{row.ex}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Auth */}
          <Section icon={Terminal} title={c.authTitle}>
            <p>{c.authDesc}</p>
            <CodeBlock>{`# Header
Authorization: Bearer YOUR_API_KEY

# Or via environment variable
export BIZSCOPE_API_KEY=your_key_here

# Or via CLI argument
npx -y @bizscope-ai/mcp --key your_key_here`}</CodeBlock>
          </Section>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        {ui.appName} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
