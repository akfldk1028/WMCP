#!/bin/bash
# Quick test for mcp2web CLI
set -e

echo "=== Testing mcp2web CLI ==="

# Generate example file
node projects/mcp2web-cli/dist/cli.js example --output /tmp/test-mcp-tools.json
echo "Generated example file"

# Scan
node projects/mcp2web-cli/dist/cli.js scan --file /tmp/test-mcp-tools.json
echo ""

# Generate all formats
node projects/mcp2web-cli/dist/cli.js generate --file /tmp/test-mcp-tools.json --output /tmp/webmcp-output
echo ""
echo "Generated files:"
ls -la /tmp/webmcp-output/

echo ""
echo "=== All tests passed ==="
