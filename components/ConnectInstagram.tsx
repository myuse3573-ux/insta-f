'use client';

import React, { useState } from 'react';
import { Instagram, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface ConnectInstagramProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  connected?: boolean;
  username?: string;
}

export function ConnectInstagram({
  size = 'md',
  label = 'Connect Instagram',
  connected = false,
  username,
}: ConnectInstagramProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    window.location.href = '/api/instagram/login';
  };

  if (connected && username) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>@{username}</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`relative inline-flex items-center justify-center gap-2.5 font-semibold text-white transition-all duration-200 rounded-xl shadow-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-95 hover:shadow-instagram-pink/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none ${sizeClasses[size]}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to Meta...</span>
        </>
      ) : (
        <>
          <Instagram className="w-5 h-5" />
          <span>{label}</span>
          <ArrowRight className="w-4 h-4 opacity-75" />
        </>
      )}
    </button>
  );
}
