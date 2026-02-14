import type {
  WebMCPProConfig,
  ToolRegistration,
  ToolResult,
  ToolInfo,
  ToolAnalyticsEvent,
  ToolErrorEvent,
} from './types.js';
import { SecurityGuard } from './security.js';
import { RateLimiter } from './rate-limiter.js';
import { AnalyticsTracker } from './analytics.js';
import type { AggregateStats } from './analytics.js';
import type { UsageStats } from './rate-limiter.js';
import { ToolDiscovery } from './discovery.js';

/**
 * Shape of the `navigator.modelContext` polyfill surface.
 * This mirrors the minimal WebMCP browser API.
 */
interface ModelContextAPI {
  registerTool: (tool: ToolRegistration) => void;
  tools: ToolRegistration[];
}

/**
 * Augment the global Navigator interface so TypeScript recognises
 * `navigator.modelContext`.
 */
declare global {
  interface Navigator {
    modelContext?: ModelContextAPI;
  }
}

/**
 * Safely check whether the `navigator` global is available.
 * Returns false in Node.js and other non-browser runtimes.
 */
function hasNavigator(): boolean {
  return typeof navigator !== 'undefined';
}

/**
 * WebMCPPro is the main entry point for the premium WebMCP polyfill.
 *
 * It orchestrates security validation, rate limiting, analytics tracking,
 * and tool discovery, wrapping either the native `navigator.modelContext`
 * API or providing a full polyfill when the native API is absent.
 */
export class WebMCPPro {
  private readonly config: WebMCPProConfig;
  private readonly security: SecurityGuard;
  private readonly rateLimiter: RateLimiter;
  private readonly analytics: AnalyticsTracker;
  private readonly discovery: ToolDiscovery;
  private readonly tools: Map<string, ToolRegistration> = new Map();

  /** Reference to the original native API, if one existed before install. */
  private originalModelContext: ModelContextAPI | undefined;

  /** Whether the polyfill has been installed. */
  private installed = false;

  constructor(config: WebMCPProConfig = {}) {
    this.config = config;

    this.security = new SecurityGuard(config.security);
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.analytics = new AnalyticsTracker(config.analytics ?? { enabled: false });
    this.discovery = new ToolDiscovery(config.discovery ?? { enabled: false });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Install the polyfill.
   *
   * If `navigator.modelContext` already exists (native WebMCP), the existing
   * API is preserved and its `registerTool` method is wrapped with pro features.
   *
   * If `navigator.modelContext` does not exist, a polyfill object is created
   * and attached to `navigator.modelContext`.
   */
  install(): void {
    if (this.installed) {
      this.log('WebMCPPro is already installed.');
      return;
    }

    if (hasNavigator()) {
      if (navigator.modelContext) {
        // Wrap the existing native API
        this.originalModelContext = navigator.modelContext;
        const originalRegister = navigator.modelContext.registerTool.bind(navigator.modelContext);

        navigator.modelContext.registerTool = (tool: ToolRegistration) => {
          this.registerTool(tool);
          // Also forward to the native implementation
          originalRegister(tool);
        };

        this.log('Installed WebMCPPro (wrapping native navigator.modelContext).');
      } else {
        // Create the polyfill from scratch
        const self = this;
        const polyfillTools: ToolRegistration[] = [];

        navigator.modelContext = {
          registerTool: (tool: ToolRegistration) => {
            self.registerTool(tool);
            polyfillTools.push(self.getWrappedTool(tool));
          },
          get tools() {
            return polyfillTools;
          },
        };

        this.log('Installed WebMCPPro (polyfill mode).');
      }
    } else {
      // Non-browser environment (Node.js): operate in headless mode
      this.log('Installed WebMCPPro (headless mode, no navigator available).');
    }

    this.installed = true;
  }

  /**
   * Register a tool with full pro-feature wrapping.
   *
   * Validates the tool via SecurityGuard, registers it in ToolDiscovery,
   * tracks the registration via AnalyticsTracker, and wraps the execute
   * function with rate limiting, input sanitization, timing, and error
   * tracking.
   */
  registerTool(tool: ToolRegistration): void {
    // --- Security validation ---
    const validation = this.security.validateTool(tool);
    if (!validation.valid) {
      const message = `Tool "${tool.name}" failed validation: ${validation.issues.join('; ')}`;
      this.log(message);
      throw new Error(message);
    }

    if (this.security.isToolBlocked(tool.name)) {
      const message = `Tool "${tool.name}" is blocked by security policy.`;
      this.log(message);
      throw new Error(message);
    }

    // --- Wrap the execute function ---
    const wrappedTool = this.getWrappedTool(tool);

    // --- Store ---
    this.tools.set(tool.name, wrappedTool);

    // --- Discovery registration ---
    this.discovery.register(tool);

    // --- Analytics ---
    this.analytics.trackRegistration(tool.name);

    this.log(`Registered tool: ${tool.name}`);
  }

  /**
   * Get information about all registered tools.
   */
  getTools(): ToolInfo[] {
    return this.discovery.getTools();
  }

  /**
   * Get aggregate analytics statistics.
   */
  getAnalytics(): AggregateStats {
    return this.analytics.getStats();
  }

  /**
   * Get an analytics summary as a human-readable string.
   */
  getAnalyticsSummary(): string {
    return this.analytics.getSummary();
  }

  /**
   * Get rate limit usage stats for a specific tool.
   */
  getRateLimit(toolName: string): UsageStats {
    return this.rateLimiter.getUsage(toolName);
  }

  /**
   * Generate a JSON-LD discovery manifest for all registered tools.
   */
  getManifest(): string {
    return this.discovery.toManifest();
  }

  /**
   * Generate HTML meta tags for tool discovery.
   */
  getDiscoveryHTML(): string {
    return this.discovery.toHTML();
  }

  /**
   * Find tools by name or description text search.
   */
  findTools(query: string): ToolInfo[] {
    return this.discovery.findTool(query);
  }

  /**
   * Uninstall the polyfill and restore the original navigator.modelContext
   * (if one existed), or remove the polyfill entirely.
   */
  uninstall(): void {
    if (!this.installed) {
      return;
    }

    if (hasNavigator()) {
      if (this.originalModelContext) {
        // Restore the original native API
        navigator.modelContext = this.originalModelContext;
        this.originalModelContext = undefined;
      } else {
        // Remove the polyfill entirely
        navigator.modelContext = undefined;
      }
    }

    // Clean up internal state
    this.tools.clear();
    this.rateLimiter.destroy();
    this.installed = false;

    this.log('WebMCPPro uninstalled.');
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Create a copy of the tool registration with a wrapped execute function
   * that enforces rate limits, sanitizes inputs, tracks timing, and reports
   * analytics/errors.
   */
  private getWrappedTool(tool: ToolRegistration): ToolRegistration {
    const self = this;

    const wrappedExecute = async (
      input: Record<string, unknown>,
      client?: unknown,
    ): Promise<ToolResult> => {
      const toolName = tool.name;
      const startTime = Date.now();

      // --- Rate limit check ---
      const rateCheck = self.rateLimiter.acquire(toolName);
      if (!rateCheck.allowed) {
        const errorEvent: ToolErrorEvent = {
          toolName,
          error: `Rate limited. Retry after ${rateCheck.retryAfterMs}ms.`,
          timestamp: Date.now(),
        };
        self.analytics.trackError(errorEvent);
        throw new Error(
          `Tool "${toolName}" is rate limited. Retry after ${rateCheck.retryAfterMs}ms.`,
        );
      }

      try {
        // --- Input size check ---
        if (!self.security.checkInputSize(input)) {
          throw new Error(`Input payload for tool "${toolName}" exceeds maximum allowed size.`);
        }

        // --- Input sanitization ---
        let processedInput = input;
        if (self.config.security?.sanitizeInputs) {
          processedInput = self.security.sanitizeInput(input);
        }

        // --- Execute the original tool ---
        const result = await tool.execute(processedInput, client);
        const duration = Date.now() - startTime;

        // --- Analytics tracking ---
        const analyticsEvent: ToolAnalyticsEvent = {
          toolName,
          timestamp: startTime,
          duration,
          success: true,
          agentInvoked: client !== undefined,
          inputKeys: Object.keys(input),
        };
        self.analytics.trackToolCall(analyticsEvent);
        self.discovery.recordCall(toolName, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        // --- Error analytics ---
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorEvent: ToolErrorEvent = {
          toolName,
          error: errorMessage,
          timestamp: Date.now(),
        };
        self.analytics.trackError(errorEvent);

        // --- Track as failed call ---
        const analyticsEvent: ToolAnalyticsEvent = {
          toolName,
          timestamp: startTime,
          duration,
          success: false,
          agentInvoked: client !== undefined,
          inputKeys: Object.keys(input),
        };
        self.analytics.trackToolCall(analyticsEvent);

        throw error;
      } finally {
        // --- Always release the rate limiter slot ---
        self.rateLimiter.release(toolName);
      }
    };

    return {
      ...tool,
      execute: wrappedExecute,
    };
  }

  /** Conditional debug logging. */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[WebMCPPro] ${message}`);
    }
  }
}
