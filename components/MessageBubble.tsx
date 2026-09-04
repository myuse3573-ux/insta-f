'use client';

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export interface MessageData {
  id: string;
  senderId: string;
  senderUsername: string;
  text: string;
  direction: 'INBOUND' | 'OUTBOUND';
  createdAt: string | Date;
}

interface MessageBubbleProps {
  message: MessageData;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'OUTBOUND';

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'} my-1`}>
      <div
        className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
          isOutbound
            ? 'bg-instagram-accent text-white rounded-br-xs'
            : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
            isOutbound ? 'text-blue-100/70' : 'text-zinc-400'
          }`}
        >
          <span>{timeString}</span>
          {isOutbound && <CheckCheck className="w-3 h-3 text-blue-200" />}
        </div>
      </div>
    </div>
  );
}
