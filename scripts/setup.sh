#!/bin/bash
# WebMCP Workspace Setup Script
# Run: bash scripts/setup.sh

set -e

echo "=== WebMCP Workspace Setup ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Error: Node.js required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }

echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"

# Install all workspace dependencies
echo ""
echo "=== Installing dependencies ==="
pnpm install

# Build shared packages first (order matters)
echo ""
echo "=== Building shared packages ==="
pnpm --filter @wmcp/core build
pnpm --filter @wmcp/mcp-bridge build
pnpm --filter @wmcp/scanner-engine build

# Build projects
echo ""
echo "=== Building projects ==="
pnpm --filter mcp2web build

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Quick start:"
echo "  pnpm --filter mcp2web start example    # Generate example MCP tools file"
echo "  pnpm --filter mcp2web start scan --file ./example-mcp-tools.json"
echo "  pnpm --filter mcp2web start generate --file ./example-mcp-tools.json"
echo ""
echo "  pnpm --filter wmcp-scanner dev          # Start scanner web app"
echo "  pnpm --filter wmcp-demo dev             # Start demo site"
