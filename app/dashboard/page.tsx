'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ConversationList, ConversationItem } from '@/components/ConversationList';
import { Conversation } from '@/components/Conversation';
import { MessageData } from '@/components/MessageBubble';
import { ConnectInstagram } from '@/components/ConnectInstagram';
import { Instagram, RefreshCw, AlertCircle, ArrowLeft, Wifi, WifiOff } from 'lucide-react';

export default function DashboardPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<{ username: string; instagramUserId: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    setError(null);
    try {
      const res = await fetch('/api/instagram/conversations');
      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.connected === false) {
          setConnected(false);
        } else {
          setError(data.error || 'Failed to fetch conversations');
        }
        setLoadingConvs(false);
        return;
      }

      setConnected(true);
      setConnectedAccount(data.account || null);
      setConversations(data.conversations || []);

      // Auto-select first conversation if none selected
      if (!activeConversationId && data.conversations?.length > 0) {
        setActiveConversationId(data.conversations[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching conversations');
    } finally {
      setLoadingConvs(false);
    }
  }, [activeConversationId]);

  // 2. Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/instagram/messages?conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();

      if (res.ok && data.messages) {
        setMessages(data.messages);
      } else {
        console.error('[Fetch Messages Error]', data.error);
      }
    } catch (err: any) {
      console.error('[Fetch Messages Network Error]', err.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Fetch initial conversations
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  // 3. Connect to Real-time Webhook SSE Stream
  useEffect(() => {
    const eventSource = new EventSource('/api/instagram/stream');

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    eventSource.addEventListener('message_received', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const { message, conversationId } = payload;

        // Update conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
              : c
          )
        );

        // If currently viewing this conversation, append message
        if (activeConversationId === conversationId && message) {
          setMessages((prev) => [...prev, message]);
        }
      } catch (err) {
        console.error('[SSE Message Received Error]', err);
      }
    });

    eventSource.addEventListener('message_sent', (e: MessageEvent) => {
      try {
        const sentMsg = JSON.parse(e.data);
        if (activeConversationId === sentMsg.conversationId) {
          setMessages((prev) => [...prev, sentMsg]);
        }
      } catch (err) {
        console.error('[SSE Message Sent Error]', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [activeConversationId]);

  // 4. Handle sending a reply
  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return;

    const res = await fetch('/api/instagram/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: activeConversationId, text }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to send message via Instagram API');
    }

    const createdMsg = data.message;
    setMessages((prev) => [...prev, createdMsg]);

    // Update conversation list item
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, lastMessage: text, lastMessageAt: new Date() }
          : c
      )
    );
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-instagram-pink" />
            <h1 className="font-bold text-base text-white tracking-tight">
              Personal Instagram Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Webhook Stream Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              sseConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
            title={sseConnected ? 'Real-time Webhook Live' : 'Connecting real-time webhook listener...'}
          >
            {sseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{sseConnected ? 'Webhooks Live' : 'Connecting Webhooks...'}</span>
          </div>

          {/* Sync Refresh Button */}
          <button
            onClick={() => fetchConversations()}
            disabled={loadingConvs}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all disabled:opacity-50"
            title="Sync Conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loadingConvs ? 'animate-spin' : ''}`} />
          </button>

          {/* Connection Status / Connect Button */}
          <ConnectInstagram
            size="sm"
            connected={connected}
            username={connectedAccount?.username}
          />
        </div>
      </header>

      {/* Main Split-Pane Layout matching Section 7 layout spec */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Conversations List */}
        <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-zinc-900/40 border-r border-zinc-800 shrink-0">
          <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-zinc-200">Conversations</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full font-mono">
              {conversations.length}
            </span>
          </div>

          {error && (
            <div className="p-3 m-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => setActiveConversationId(id)}
              loading={loadingConvs}
            />
          </div>
        </aside>

        {/* Right Pane: Current Conversation */}
        <section className="flex-1 flex flex-col h-full overflow-hidden bg-[#09090b]">
          <Conversation
            conversation={activeConversation}
            messages={messages}
            loading={loadingMsgs}
            onSendMessage={handleSendMessage}
          />
        </section>
      </main>
    </div>
  );
}
