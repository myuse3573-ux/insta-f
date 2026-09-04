'use client';

import React, { useRef, useEffect } from 'react';
import { MessageBubble, MessageData } from './MessageBubble';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageData[];
  loading?: boolean;
}

export function MessageList({ messages, loading = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-instagram-accent" />
        <span className="text-sm">Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm">
        <p>No messages in this conversation yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
