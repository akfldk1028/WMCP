import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanningChat } from './PlanningChat';

describe('PlanningChat', () => {
  it('should render with message list and input', () => {
    render(<PlanningChat config={{ apiEndpoint: '/api/planning/chat', mode: 'both' }} />);
    expect(screen.getByTestId('planning-chat')).toBeDefined();
    expect(screen.getByTestId('message-list')).toBeDefined();
    expect(screen.getByTestId('chat-input')).toBeDefined();
  });

  it('should add user message when sending', () => {
    render(<PlanningChat config={{ apiEndpoint: '/api/planning/chat', mode: 'bmc' }} />);
    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'Create BMC for my startup' } });
    fireEvent.click(screen.getByTestId('chat-send'));
    expect(screen.getByText('Create BMC for my startup')).toBeDefined();
  });

  it('should show BMC placeholder in bmc mode', () => {
    render(<PlanningChat config={{ apiEndpoint: '/api/planning/chat', mode: 'bmc' }} />);
    expect((screen.getByTestId('chat-textarea') as HTMLTextAreaElement).placeholder).toContain('BMC');
  });
});
