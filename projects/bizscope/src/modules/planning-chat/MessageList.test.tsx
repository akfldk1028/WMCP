import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import type { PlanningMessage } from './types';

describe('MessageList', () => {
  it('should render user and assistant messages', () => {
    const messages: PlanningMessage[] = [
      { id: '1', role: 'user', content: 'Create a BMC', timestamp: Date.now() },
      { id: '2', role: 'assistant', content: 'Here you go!', timestamp: Date.now() },
    ];
    render(<MessageList messages={messages} dataModel={{}} />);
    expect(screen.getByText('Create a BMC')).toBeDefined();
    expect(screen.getByText('Here you go!')).toBeDefined();
  });

  it('should render A2UI components inline', () => {
    const messages: PlanningMessage[] = [
      {
        id: '1', role: 'assistant', content: 'BMC block:',
        a2ui: {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'bmc-cs',
            components: [{ id: 'title', component: 'Text', text: 'Customer Segments' }],
          },
        },
        timestamp: Date.now(),
      },
    ];
    render(<MessageList messages={messages} dataModel={{}} />);
    expect(screen.getByText('Customer Segments')).toBeDefined();
    expect(screen.getByTestId('a2ui-surface')).toBeDefined();
  });

  it('should render empty state', () => {
    render(<MessageList messages={[]} dataModel={{}} />);
    expect(screen.getByTestId('message-list')).toBeDefined();
  });
});
