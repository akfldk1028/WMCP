export { WebMCPPro } from './polyfill.js';
export { SecurityGuard } from './security.js';
export { RateLimiter } from './rate-limiter.js';
export { AnalyticsTracker } from './analytics.js';
export { ToolDiscovery } from './discovery.js';

// Gateway aliases for the rebranded API
export { WebMCPPro as MCPGateway } from './polyfill.js';
export { SecurityGuard as GatewaySecurity } from './security.js';
export { RateLimiter as GatewayRateLimiter } from './rate-limiter.js';

export type {
  WebMCPProConfig,
  AnalyticsConfig,
  SecurityConfig,
  RateLimitConfig,
  DiscoveryConfig,
  ToolRegistration,
  ToolResult,
  ToolInfo,
  ToolAnalyticsEvent,
  ToolErrorEvent,
} from './types.js';
