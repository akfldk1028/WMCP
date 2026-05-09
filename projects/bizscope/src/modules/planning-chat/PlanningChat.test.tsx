import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanningChat } from './PlanningChat';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Mock fetch to prevent network errors in tests
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
  ok: false,
  json: () => Promise.resolve({ error: 'test' }),
})));

describe('PlanningChat', () => {
  it('should render with message list and input', () => {
    render(<PlanningChat config={{ apiEndpoint: '/api/planning/chat', mode: 'both' }} />);
    expect(screen.getByTestId('planning-chat')).toBeDefined();
    expect(screen.getByTestId('message-list')).toBeDefined();
    expect(screen.getByTestId('chat-input')).toBeDefined();
  });

  it('should add user message when sending', async () => {
    render(<PlanningChat config={{ apiEndpoint: '/api/planning/chat', mode: 'bmc' }} />);
    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'Create BMC for my startup' } });
    fireEvent.click(screen.getByTestId('chat-send'));
    await waitFor(() => {
      expect(screen.getByText('Create BMC for my startup')).toBeDefined();
    });
  });

  it('should show BMC placeholder in bmc mode', () => {
    render(<PlanningChat config={{ apiEndpoint: '/api/planning/chat', mode: 'bmc' }} />);
    expect((screen.getByTestId('chat-textarea') as HTMLTextAreaElement).placeholder).toContain('BMC');
  });
});
