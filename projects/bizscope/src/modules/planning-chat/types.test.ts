import { describe, it, expect } from 'vitest';
import type { PlanningMessage, PlanningChatState, PlanningChatConfig, PlanningChatEvent } from './types';

describe('Planning Chat Types', () => {
  it('should allow creating a user message', () => {
    const msg: PlanningMessage = { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() };
    expect(msg.role).toBe('user');
  });

  it('should allow creating an assistant message with A2UI', () => {
    const msg: PlanningMessage = {
      id: '2', role: 'assistant', content: 'Here is the canvas',
      a2ui: { version: 'v0.9', updateComponents: { surfaceId: 'bmc', components: [{ id: 't', component: 'Text', text: 'Hi' }] } },
      timestamp: Date.now(),
    };
    expect(msg.a2ui?.updateComponents?.surfaceId).toBe('bmc');
  });

  it('should allow creating chat state', () => {
    const state: PlanningChatState = { messages: [], isLoading: false, error: null, activeSurfaceIds: new Set() };
    expect(state.messages).toHaveLength(0);
  });

  it('should allow creating chat config', () => {
    const config: PlanningChatConfig = { apiEndpoint: '/api/planning/chat', mode: 'both' };
    expect(config.mode).toBe('both');
  });

  it('should allow creating a chat event', () => {
    const event: PlanningChatEvent = { type: 'block-complete', data: { block: 'value-proposition' } };
    expect(event.type).toBe('block-complete');
  });
});
