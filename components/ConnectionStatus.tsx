'use client';

import React from 'react';

interface ConnectionStatusProps {
  connected: boolean;
  username?: string;
}

export function ConnectionStatus({ connected, username }: ConnectionStatusProps) {
  if (connected && username) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Connected as @{username}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      <span>Not Connected</span>
    </div>
  );
}
