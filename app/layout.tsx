import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Personal Instagram Messaging Dashboard',
  description: 'A simple private web application to view and reply to Instagram Direct Messages using official Meta Instagram APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
