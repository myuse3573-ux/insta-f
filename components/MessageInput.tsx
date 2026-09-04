'use client';

import React, { useState } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending || disabled) return;

    const messageText = text.trim();
    setText('');
    setSending(true);
    setErrorMessage(null);

    try {
      await onSendMessage(messageText);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reply');
      setText(messageText); // restore text on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-900 border-t border-zinc-800">
      {errorMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300 font-bold ml-1"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message..."
          disabled={disabled || sending}
          className="flex-1 px-4 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-instagram-accent focus:ring-1 focus:ring-instagram-accent transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-instagram-accent hover:bg-instagram-hover text-white font-medium text-sm rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
