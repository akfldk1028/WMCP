#!/usr/bin/env node
/**
 * mcp2web CLI - Convert MCP server tools to WebMCP browser code
 *
 * Usage:
 *   npx mcp2web scan --url http://localhost:3000
 *   npx mcp2web scan --file ./tools.json
 *   npx mcp2web generate --format all --output ./webmcp/
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { convertMCPToWebMCP } from '@wmcp/mcp-bridge';
import type { MCPSource } from '@wmcp/mcp-bridge';

const program = new Command();

program
  .name('mcp2web')
  .description('Convert MCP server tools to WebMCP browser code')
  .version('0.1.0');

// ===== scan command =====
program
  .command('scan')
  .description('Read tools from an MCP server and display them')
  .option('--url <url>', 'MCP server HTTP/SSE endpoint URL')
  .option('--file <path>', 'JSON file with MCP tools/list response')
  .action(async (opts) => {
    const spinner = ora('Reading MCP tools...').start();
    try {
      const source = getSource(opts);
      const result = await convertMCPToWebMCP(source, { format: 'all' });

      spinner.succeed(`Found ${chalk.bold(result.toolCount)} tools`);
      console.log();

      for (const tool of result.tools) {
        console.log(`  ${chalk.cyan('>')} ${chalk.bold(tool.name)}`);
        console.log(`    ${tool.description}`);
        const propCount = Object.keys(tool.inputSchema.properties ?? {}).length;
        const reqCount = (tool.inputSchema.required ?? []).length;
        console.log(`    ${chalk.dim(`${propCount} params, ${reqCount} required`)}`);
        console.log();
      }
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// ===== generate command =====
program
  .command('generate')
  .description('Generate WebMCP code from MCP tools')
  .option('--url <url>', 'MCP server HTTP/SSE endpoint URL')
  .option('--file <path>', 'JSON file with MCP tools/list response')
  .option('--format <format>', 'Output format: imperative-js, declarative-html, typescript, all', 'all')
  .option('--output <dir>', 'Output directory', './webmcp-output')
  .option('--proxy <url>', 'Base URL for API proxy in generated code', '/api')
  .option('--polyfill', 'Include @mcp-b/global polyfill import', false)
  .action(async (opts) => {
    const spinner = ora('Generating WebMCP code...').start();
    try {
      const source = getSource(opts);
      const outDir = resolve(opts.output);
      await mkdir(outDir, { recursive: true });

      const result = await convertMCPToWebMCP(source, {
        format: opts.format,
        proxyBaseUrl: opts.proxy,
        includePolyfill: opts.polyfill,
        includeFeatureDetection: true,
      });

      spinner.text = 'Writing files...';

      for (const [filename, content] of result.files) {
        const filePath = join(outDir, filename);
        await writeFile(filePath, content, 'utf-8');
      }

      spinner.succeed(`Generated ${chalk.bold(result.files.size)} files from ${chalk.bold(result.toolCount)} tools`);
      console.log();
      console.log(`  Output directory: ${chalk.cyan(outDir)}`);
      console.log();
      for (const [filename] of result.files) {
        console.log(`  ${chalk.green('+')} ${filename}`);
      }
      console.log();
      console.log(chalk.dim('Next steps:'));
      console.log(chalk.dim('  1. Add execute() implementations to webmcp-tools.js'));
      console.log(chalk.dim('  2. Include in your web page'));
      console.log(chalk.dim('  3. Test with Chrome 146+ (enable WebMCP flag)'));
    } catch (err) {
      spinner.fail(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// ===== example command =====
program
  .command('example')
  .description('Generate an example MCP tools JSON file')
  .option('--output <path>', 'Output file path', './example-mcp-tools.json')
  .action(async (opts) => {
    const example = {
      tools: [
        {
          name: 'search-products',
          description: 'Search for products by keyword, category, or price range',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search keyword' },
              category: { type: 'string', description: 'Product category', enum: ['electronics', 'clothing', 'food'] },
              maxPrice: { type: 'number', description: 'Maximum price filter' },
            },
            required: ['query'],
          },
        },
        {
          name: 'add-to-cart',
          description: 'Add a product to the shopping cart',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'Product ID' },
              quantity: { type: 'number', description: 'Quantity to add' },
            },
            required: ['productId', 'quantity'],
          },
        },
        {
          name: 'get-weather',
          description: 'Get current weather for a location',
          inputSchema: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'City name or zip code' },
              units: { type: 'string', description: 'Temperature units', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location'],
          },
        },
      ],
    };

    await writeFile(opts.output, JSON.stringify(example, null, 2), 'utf-8');
    console.log(`${chalk.green('+')} Created example file: ${chalk.cyan(opts.output)}`);
    console.log();
    console.log(`Try: ${chalk.bold(`mcp2web scan --file ${opts.output}`)}`);
    console.log(`Or:  ${chalk.bold(`mcp2web generate --file ${opts.output}`)}`);
  });

function getSource(opts: { url?: string; file?: string }): MCPSource {
  if (opts.url) {
    return { type: 'http', url: opts.url };
  }
  if (opts.file) {
    return { type: 'file', path: resolve(opts.file) };
  }
  console.error(chalk.red('Error: Provide --url or --file'));
  console.error('  Example: mcp2web scan --file ./tools.json');
  console.error('  Example: mcp2web scan --url http://localhost:3000');
  process.exit(1);
}

program.parse();
