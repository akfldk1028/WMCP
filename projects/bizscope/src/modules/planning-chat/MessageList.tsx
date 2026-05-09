'use client';

import React, { useRef, useEffect } from 'react';
import type { PlanningMessage } from './types';
import { A2UIRenderer } from '@/modules/a2ui/renderer';
import type { A2UIEvent } from '@/modules/a2ui/types';
import { Bot, User } from 'lucide-react';
import { useLocale } from '@/i18n';

interface MessageListProps {
  messages: PlanningMessage[];
  dataModel: Record<string, unknown>;
  onA2UIEvent?: (event: A2UIEvent) => void;
}

export function MessageList({ messages, dataModel, onA2UIEvent }: MessageListProps) {
  const { t } = useLocale();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div data-testid="message-list" className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl" style={{ background: '#2a2a2c' }}>
            <Bot className="size-7" style={{ color: '#8083ff' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#e5e1e4' }}>{t.ui.planning.title}</h3>
          <p className="mt-2 text-sm" style={{ color: '#908fa0' }}>
            {t.ui.planning.subtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="message-list" className="space-y-4 p-4">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            data-role={msg.role}
            data-testid={`message-${msg.id}`}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: isUser ? '#353437' : '#2a2a2c' }}
            >
              {isUser ? (
                <User className="size-3.5" style={{ color: '#c7c4d7' }} />
              ) : (
                <Bot className="size-3.5" style={{ color: '#8083ff' }} />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : ''}`}>
              <div
                data-testid="message-content"
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={isUser
                  ? { background: '#8083ff', color: '#fff', borderTopRightRadius: 6 }
                  : { background: '#201f22', color: '#e5e1e4', borderTopLeftRadius: 6 }
                }
              >
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                    {line}
                  </p>
                ))}
              </div>

              {/* A2UI Surface */}
              {msg.a2ui?.updateComponents && (
                <div
                  data-testid="a2ui-surface"
                  className="rounded-xl p-4"
                  style={{ background: '#2a2a2c' }}
                >
                  <A2UIRenderer
                    components={msg.a2ui.updateComponents.components}
                    dataModel={dataModel}
                    surfaceId={msg.a2ui.updateComponents.surfaceId}
                    onEvent={onA2UIEvent}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
