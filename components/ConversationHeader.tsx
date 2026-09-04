'use client';

import React from 'react';

interface ConversationHeaderProps {
  participantUsername: string;
}

export function ConversationHeader({ participantUsername }: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-instagram-purple via-instagram-pink to-instagram-orange p-[1.5px]">
          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-zinc-200 font-semibold text-xs">
            {participantUsername.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-100 text-sm">
            {participantUsername}
          </h2>
          <p className="text-[11px] text-zinc-400">Instagram User</p>
        </div>
      </div>
    </div>
  );
}
