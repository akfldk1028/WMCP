#!/usr/bin/env node
import { Command } from 'commander';
import { defaultRegistry, PipelineExecutor } from '../runtime/index.js';
import { registerAllNodes } from '../nodes/index.js';
import { MemoryAdapter } from '../storage/memory.js';
import { createAnalyzePagePipeline } from '../presets/analyze-page.js';
import { createTrackPricePipeline } from '../presets/track-price.js';
import { createCompareSitesPipeline } from '../presets/compare-sites.js';
import type { PipelineContext } from '../runtime/types.js';

registerAllNodes(defaultRegistry);

const program = new Command();
program
  .name('price-shield')
  .description('AI-powered price protection — detect hidden fees, track prices, compare across sites')
  .version('0.2.0');

function createContext(storage = new MemoryAdapter()): PipelineContext {
  return { storage, results: new Map() };
}

program
  .command('analyze')
  .description('Analyze a single page for pricing issues')
  .argument('<url>', 'URL to analyze')
  .option('-f, --format <format>', 'Output format (json|markdown|text)', 'json')
  .action(async (url: string, opts: { format: string }) => {
    const executor = new PipelineExecutor(defaultRegistry);
    const pipeline = createAnalyzePagePipeline(url, opts.format as 'json' | 'markdown' | 'text');
    const ctx = createContext();

    try {
      const result = await executor.execute(pipeline, ctx);
      const report = result.outputs.get('report') as { formatted: string } | undefined;
      if (report) {
        console.log(report.formatted);
      }
      console.error(`\nCompleted in ${result.durationMs}ms (${result.executionOrder.length} nodes)`);
    } catch (err) {
      console.error('Analysis failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command('track')
  .description('Track price changes over time')
  .argument('<url>', 'URL to track')
  .option('-n, --name <name>', 'Product name', 'product')
  .option('-d, --days <days>', 'Days of history', '30')
  .option('--drop-threshold <percent>', 'Drop alert threshold %', '10')
  .option('--spike-threshold <percent>', 'Spike alert threshold %', '15')
  .option('--webhook <url>', 'Webhook URL for alerts')
  .action(async (url: string, opts: Record<string, string>) => {
    const executor = new PipelineExecutor(defaultRegistry);
    const pipeline = createTrackPricePipeline(url, opts.name, {
      days: parseInt(opts.days, 10),
      dropThreshold: parseFloat(opts.dropThreshold),
      spikeThreshold: parseFloat(opts.spikeThreshold),
      webhookUrl: opts.webhook,
    });
    const ctx = createContext();

    try {
      const result = await executor.execute(pipeline, ctx);

      const drop = result.outputs.get('drop') as { message: string } | undefined;
      const spike = result.outputs.get('spike') as { message: string } | undefined;
      const extract = result.outputs.get('extract') as { count: number } | undefined;

      console.log(`Tracked: ${url}`);
      console.log(`Prices found: ${extract?.count ?? 0}`);
      if (drop) console.log(`Drop: ${drop.message}`);
      if (spike) console.log(`Spike: ${spike.message}`);
      console.error(`\nCompleted in ${result.durationMs}ms`);
    } catch (err) {
      console.error('Tracking failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command('compare')
  .description('Compare prices across multiple sites')
  .argument('<urls...>', 'URLs to compare (at least 2)')
  .option('-n, --name <name>', 'Product name', 'product')
  .action(async (urls: string[], opts: { name: string }) => {
    const executor = new PipelineExecutor(defaultRegistry);
    const pipeline = createCompareSitesPipeline(urls, opts.name);
    const ctx = createContext();

    try {
      const result = await executor.execute(pipeline, ctx);
      const compare = result.outputs.get('compare') as {
        comparison: {
          cheapest: { url: string; priceCents: number };
          mostExpensive: { url: string; priceCents: number };
          spreadPercent: number;
        } | null;
      } | undefined;

      if (compare?.comparison) {
        const c = compare.comparison;
        console.log(`Product: ${opts.name}`);
        console.log(`Cheapest: ${c.cheapest.url} — $${(c.cheapest.priceCents / 100).toFixed(2)}`);
        console.log(`Most expensive: ${c.mostExpensive.url} — $${(c.mostExpensive.priceCents / 100).toFixed(2)}`);
        console.log(`Price spread: ${c.spreadPercent}%`);
      } else {
        console.log('Could not compare — insufficient price data from provided URLs');
      }
      console.error(`\nCompleted in ${result.durationMs}ms`);
    } catch (err) {
      console.error('Comparison failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parse();
