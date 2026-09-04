import React from 'react';
import Link from 'next/link';
import { ConnectInstagram } from '@/components/ConnectInstagram';
import { ShieldCheck, Zap, Lock, MessageCircle, Info } from 'lucide-react';

interface HomePageProps {
  searchParams: { error?: string };
}

export default function HomePage({ searchParams }: HomePageProps) {
  const errorMessage = searchParams.error;
  const isPlaceholderAppId = !process.env.META_APP_ID || process.env.META_APP_ID === 'your_meta_app_id_here';

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-[#0d0d12] to-zinc-950">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-instagram-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-instagram-orange/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Placeholder App ID Warning */}
        {isPlaceholderAppId && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-3 text-left">
            <Info className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">Setup Required: Meta App Credentials</p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Your <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-200">.env</code> file currently contains placeholder credentials (<code className="text-amber-200">your_meta_app_id_here</code>).
                Please open your <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-200">.env</code> file and paste your real <strong>META_APP_ID</strong> and <strong>META_APP_SECRET</strong> from your <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="underline font-bold">Meta Developer Dashboard</a>.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3 text-left">
            <Info className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="text-xs text-red-300/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-instagram-accent" />
          <span>Meta Official Instagram Graph API v22.0</span>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Personal Instagram <br />
            <span className="bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange bg-clip-text text-transparent">
              Messaging Dashboard
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            A minimal, private dashboard to view incoming Instagram Direct Messages, receive real-time webhook updates, and reply to friends securely.
          </p>
        </div>

        {/* OAuth Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <ConnectInstagram size="lg" label="Connect Instagram Account" />
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all text-sm font-medium"
          >
            Open Dashboard →
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-200">Zero Password Storage</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Uses official Meta OAuth login. Access tokens are encrypted server-side with AES-256.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-200">Real-Time Webhooks</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Incoming messages update instantly via Meta Webhooks and Server-Sent Events.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-200">Official Messaging</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sends DMs cleanly through Meta&apos;s verified Instagram Messaging API endpoints.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
