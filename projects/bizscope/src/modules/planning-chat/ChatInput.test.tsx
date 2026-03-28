import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('should render textarea and send button', () => {
    render(<ChatInput onSend={() => {}} />);
    expect(screen.getByTestId('chat-textarea')).toBeDefined();
    expect(screen.getByTestId('chat-send')).toBeDefined();
  });

  it('should call onSend with trimmed text on button click', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: '  Hello  ' } });
    fireEvent.click(screen.getByTestId('chat-send'));
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('should clear input after send', () => {
    render(<ChatInput onSend={() => {}} />);
    const textarea = screen.getByTestId('chat-textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.click(screen.getByTestId('chat-send'));
    expect(textarea.value).toBe('');
  });

  it('should not send empty messages', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    fireEvent.click(screen.getByTestId('chat-send'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('should disable when disabled prop is true', () => {
    render(<ChatInput onSend={() => {}} disabled />);
    expect((screen.getByTestId('chat-textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });
});
