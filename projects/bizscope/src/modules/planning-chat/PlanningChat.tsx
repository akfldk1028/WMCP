'use client';

import React, { useState, useCallback } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import type { PlanningMessage, PlanningChatConfig } from './types';
import type { A2UIEvent } from '@/modules/a2ui/types';

interface PlanningChatProps {
  config: PlanningChatConfig;
  onEvent?: (event: { type: string; data: Record<string, unknown> }) => void;
}

export function PlanningChat({ config, onEvent }: PlanningChatProps) {
  const [messages, setMessages] = useState<PlanningMessage[]>([]);
  const [dataModel, setDataModel] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback((text: string) => {
    const userMsg: PlanningMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // AI response will be handled by the API route integration (Plan 5)
    // For now, this is the container structure
    setIsLoading(false);
  }, []);

  const handleA2UIEvent = useCallback((event: A2UIEvent) => {
    if (event.type === 'change') {
      setDataModel((prev) => ({ ...prev, [`${event.surfaceId}/${event.componentId}`]: event.value }));
    }
    if (event.type === 'action') {
      onEvent?.({ type: event.name ?? 'action', data: { surfaceId: event.surfaceId, componentId: event.componentId } });
    }
  }, [onEvent]);

  return (
    <div data-testid="planning-chat" data-mode={config.mode}>
      <MessageList messages={messages} dataModel={dataModel} onA2UIEvent={handleA2UIEvent} />
      <ChatInput onSend={handleSend} disabled={isLoading} placeholder={config.mode === 'bmc' ? 'BMC 블록을 작성해보세요...' : '기획을 시작해보세요...'} />
    </div>
  );
}
