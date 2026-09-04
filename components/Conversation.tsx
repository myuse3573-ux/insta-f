'use client';

import React from 'react';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { MessageData } from './MessageBubble';
import { ConversationItem } from './ConversationList';
import { Info, MessageSquare } from 'lucide-react';

interface ConversationProps {
  conversation: ConversationItem | null;
  messages: MessageData[];
  loading?: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

export function Conversation({
  conversation,
  messages,
  loading = false,
  onSendMessage,
}: ConversationProps) {
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full p-8 text-center bg-zinc-950/40 text-zinc-500">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
          <MessageSquare className="w-10 h-10 text-instagram-accent" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-200">Your Messages</h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm">
          Select a conversation from the left menu to view messages and reply.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0b0d] flex-1 min-w-0">
      {/* Header */}
      <ConversationHeader participantUsername={conversation.participantUsername} />

      {/* Official API Disclaimer Notice (Section 15) */}
      <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/30 flex items-center gap-2 text-[11px] text-blue-300">
        <Info className="w-3.5 h-3.5 shrink-0 text-blue-400" />
        <span>
          Showing conversations available through Instagram&apos;s official API (`graph.instagram.com`).
        </span>
      </div>

      {/* Message History List */}
      <MessageList messages={messages} loading={loading} />

      {/* Message Input Bar */}
      <MessageInput onSendMessage={onSendMessage} disabled={loading} />
    </div>
  );
}
