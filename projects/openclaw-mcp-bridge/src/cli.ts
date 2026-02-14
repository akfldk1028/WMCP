#!/usr/bin/env node

/**
 * CLI entry point for the OpenClaw MCP Bridge.
 *
 * Usage:
 *   openclaw-mcp-bridge --url https://example.com --url https://other.com
 *   openclaw-mcp-bridge --config bridge.json
 */

import { MCPBridgeServer } from './bridge.js';
import type { BridgeConfig } from './types.js';

function parseArgs(argv: string[]): BridgeConfig {
  const urls: string[] = [];
  let debug = false;
  let autoRefresh = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if ((arg === '--url' || arg === '-u') && i + 1 < argv.length) {
      urls.push(argv[++i]);
    } else if (arg === '--debug' || arg === '-d') {
      debug = true;
    } else if (arg === '--auto-refresh') {
      autoRefresh = true;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else {
      // Treat bare arguments as URLs
      if (arg.startsWith('http://') || arg.startsWith('https://')) {
        urls.push(arg);
      }
    }
  }

  if (urls.length === 0) {
    console.error('Error: At least one --url is required');
    printUsage();
    process.exit(1);
  }

  return {
    targetUrls: urls,
    transport: 'stdio',
    debug,
    autoRefresh,
  };
}

function printUsage(): void {
  console.error(`
OpenClaw MCP Bridge - Expose WebMCP tools as MCP tools

Usage:
  openclaw-mcp-bridge --url <URL> [--url <URL>...] [options]

Options:
  --url, -u <URL>    Website URL to scan for WebMCP tools (repeatable)
  --debug, -d        Enable debug logging to stderr
  --auto-refresh     Periodically re-scan URLs for new tools
  --help, -h         Show this help message

Examples:
  openclaw-mcp-bridge --url https://example.com
  openclaw-mcp-bridge -u https://site1.com -u https://site2.com --debug
`);
}

async function main(): Promise<void> {
  const config = parseArgs(process.argv);
  const server = new MCPBridgeServer(config);

  process.on('SIGINT', () => {
    server.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    server.destroy();
    process.exit(0);
  });

  await server.startStdio();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
