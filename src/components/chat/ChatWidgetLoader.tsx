// src/components/chat/ChatWidgetLoader.tsx
'use client';

import dynamic from 'next/dynamic';

// ✅ dynamic with ssr: false is allowed here — this IS a Client Component
const ChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then((m) => ({ default: m.ChatWidget })),
  {
    ssr: false,
    loading: () => null,
  }
);

export function ChatWidgetLoader() {
  return <ChatWidget />;
}