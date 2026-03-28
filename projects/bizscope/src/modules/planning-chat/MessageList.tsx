'use client';

import React from 'react';
import type { PlanningMessage } from './types';
import { A2UIRenderer } from '@/modules/a2ui/renderer';
import type { A2UIEvent } from '@/modules/a2ui/types';

interface MessageListProps {
  messages: PlanningMessage[];
  dataModel: Record<string, unknown>;
  onA2UIEvent?: (event: A2UIEvent) => void;
}

export function MessageList({ messages, dataModel, onA2UIEvent }: MessageListProps) {
  return (
    <div data-testid="message-list">
      {messages.map((msg) => (
        <div key={msg.id} data-role={msg.role} data-testid={`message-${msg.id}`}>
          <div data-testid="message-content">{msg.content}</div>
          {msg.a2ui?.updateComponents && (
            <div data-testid="a2ui-surface">
              <A2UIRenderer
                components={msg.a2ui.updateComponents.components}
                dataModel={dataModel}
                surfaceId={msg.a2ui.updateComponents.surfaceId}
                onEvent={onA2UIEvent}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
