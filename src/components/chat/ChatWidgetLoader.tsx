// src/components/chat/ChatWidgetLoader.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// ✅ ssr:false — ChatWidget uses browser-only APIs (localStorage, WebSocket)
// loading: () => null — no spinner shown during load; widget appears fully formed
const ChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then((m) => ({ default: m.ChatWidget })),
  { ssr: false, loading: () => null }
);

export function ChatWidgetLoader() {
  // ✅ shouldLoad gates whether ChatWidget is in the DOM at all.
  // false = ChatWidget not rendered, its bundle not downloaded.
  // true  = ChatWidget renders, dynamic import() fires.
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // ── Trigger 1: User interaction ──────────────────────────────
    // First mousedown/touchstart/keydown/scroll means user is active.
    // Load chat immediately so it's ready if they navigate to Contact.
    const loadOnInteraction = () => {
      setShouldLoad(true);
      cleanup();
    };

    // ── Trigger 2: Idle timeout ───────────────────────────────────
    // If user hasn't interacted after 4 seconds (e.g. landed, paused),
    // load chat in the background during idle time.
    // 4000ms chosen to be after LCP and TTI are complete.
    const idleTimer = setTimeout(() => {
      setShouldLoad(true);
      cleanup();
    }, 4000);

    // ── Trigger 3: Contact section proximity ──────────────────────
    // Load when contact section is 200px away from viewport edge.
    // User gets the widget before they even see the contact form.
    // This is the most targeted trigger — chat is most relevant here.
    let observer: IntersectionObserver | null = null;
    const contactSection = document.getElementById('contact');

    if (contactSection) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            cleanup();
          }
        },
        {
          // ✅ rootMargin: expand the "visible" zone by 200px downward.
          // Widget loads before user reaches the section.
          rootMargin: '0px 0px 200px 0px',
        }
      );
      observer.observe(contactSection);
    }

    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'] as const;
    events.forEach((e) =>
      window.addEventListener(e, loadOnInteraction, {
        once:    true,
        passive: true,
      })
    );

    function cleanup() {
      clearTimeout(idleTimer);
      events.forEach((e) =>
        window.removeEventListener(e, loadOnInteraction)
      );
      if (observer && contactSection) {
        observer.unobserve(contactSection);
        observer.disconnect();
      }
    }

    return cleanup;
  }, []);

  // ✅ Return null until triggered — zero bundle cost, zero DOM nodes
  if (!shouldLoad) return null;

  return <ChatWidget />;
}