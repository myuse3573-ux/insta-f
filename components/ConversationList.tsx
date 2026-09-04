'use client';

import React from 'react';
import { User, MessageSquare, Clock } from 'lucide-react';

export interface ConversationItem {
  id: string;
  instagramConversationId: string;
  participantId: string;
  participantUsername: string;
  lastMessage?: string | null;
  lastMessageAt: string | Date;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  loading = false,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-zinc-800 rounded w-24" />
              <div className="h-3 bg-zinc-800/60 rounded w-36" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 my-auto">
        <MessageSquare className="w-10 h-10 mb-3 text-zinc-600" />
        <p className="font-medium text-zinc-300">No conversations yet</p>
        <p className="text-xs mt-1 text-zinc-500">
          Messages sent to your connected Instagram account will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-800/60 overflow-y-auto">
      {conversations.map((conv) => {
        const isActive = conv.id === activeConversationId;
        const timeAgo = formatTimeAgo(conv.lastMessageAt);

        return (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`w-full flex items-start gap-3 p-3.5 text-left transition-all hover:bg-zinc-800/60 ${
              isActive ? 'bg-zinc-800/90 border-l-2 border-instagram-accent' : ''
            }`}
          >
            {/* User Avatar */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-instagram-purple via-instagram-pink to-instagram-orange p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 font-semibold text-sm">
                {conv.participantUsername.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-semibold text-sm text-zinc-100 truncate">
                  {conv.participantUsername}
                </span>
                <span className="text-[11px] text-zinc-500 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {conv.lastMessage || 'No messages yet'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatTimeAgo(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
}
