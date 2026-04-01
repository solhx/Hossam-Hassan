// src/components/chat/ChatWidgetLoader.tsx
'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// ✅ dynamic with ssr: false is allowed here — this IS a Client Component
const ChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then((m) => ({ default: m.ChatWidget })),
  {
    ssr: false,
    loading: () => null,
  }
);

const ChatWidgetLoader = React.memo(function ChatWidgetLoader() {
  return <ChatWidget />;
});
ChatWidgetLoader.displayName = 'ChatWidgetLoader';
export { ChatWidgetLoader };