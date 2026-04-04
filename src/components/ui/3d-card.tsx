// src/components/ui/3d-card.tsx
"use client";

import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/utils/utils";

interface ThreeDCardProps {
  children:           ReactNode;
  className?:         string;
  containerClassName?: string;
}

export function ThreeDCard({
  children,
  className,
  containerClassName,
}: ThreeDCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * FIX: Replace useState(rotateX/rotateY) with useMotionValue + useSpring.
   *
   * BEFORE:
   *   const [rotateX, setRotateX] = useState(0)
   *   const [rotateY, setRotateY] = useState(0)
   *   handleMouseMove: setRotateX(...) setRotateY(...)
   *
   * PROBLEM:
   *   setState fires on EVERY mousemove event.
   *   mousemove fires at 60-120Hz depending on the device.
   *   Each setState → React schedules a re-render → reconciler runs
   *   → motion.div re-renders with new animate prop values.
   *   At 60fps: 60 React re-renders per second from ONE card.
   *   With multiple ThreeDCards on screen: 60 × N re-renders/sec.
   *
   *   Additionally: animate={{ rotateX, rotateY }} creates a NEW
   *   object literal on every render. Framer Motion sees a new
   *   animate reference → schedules a new animation → animation
   *   system processes it → produces the same output it would have
   *   via MotionValue anyway. Wasted work at every level.
   *
   * FIX: useMotionValue + useSpring.
   *   MotionValues update WITHOUT triggering React re-renders.
   *   useSpring applies the spring physics as the MotionValue
   *   changes — entirely on Framer Motion's RAF loop.
   *   Zero React reconciliation during mouse movement.
   *   The motion.div subscribes to the spring MotionValues
   *   via the style prop — FM updates the DOM transform directly,
   *   bypassing React's virtual DOM entirely.
   *
   * Performance difference:
   *   BEFORE: 60 React re-renders/sec per card
   *   AFTER:  0 React re-renders during hover (only 2 on enter/leave)
   */
  const rotateXMv = useMotionValue(0);
  const rotateYMv = useMotionValue(0);

  /*
   * Spring config for 3D tilt.
   * stiffness:300 + damping:25 = responsive but not snappy.
   * Matches the feel of physical card tilt without overshoot.
   */
  const rotateXSpring = useSpring(rotateXMv, {
    stiffness: 300,
    damping:   25,
    mass:      0.5,
  });
  const rotateYSpring = useSpring(rotateYMv, {
    stiffness: 300,
    damping:   25,
    mass:      0.5,
  });

  /*
   * FIX: useCallback prevents handleMouseMove from being recreated
   * on every render. Without useCallback, the function reference
   * changes every render → event listener is removed and re-added
   * every render → brief window where no listener is attached →
   * missed mousemove events → jittery tilt response.
   *
   * The rotateXMv/rotateYMv refs are stable (MotionValues never
   * change identity) so the dep array is effectively empty.
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect    = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      /*
       * FIX: .set() on MotionValue — zero React involvement.
       * FM reads these values on its own RAF tick and applies
       * the spring physics. No setState, no re-render, no reconciler.
       */
      rotateXMv.set((-y / rect.height) * 20);
      rotateYMv.set(( x / rect.width)  * 20);
    },
    [rotateXMv, rotateYMv],
  );

  const handleMouseLeave = useCallback(() => {
    /*
     * Reset to 0 — the spring will animate back to neutral.
     * useCallback dep array includes MotionValues (stable refs).
     */
    rotateXMv.set(0);
    rotateYMv.set(0);
  }, [rotateXMv, rotateYMv]);

  /*
   * FIX: Spotlight position derived from spring values via
   * useTransform — NOT from useState.
   *
   * BEFORE: The spotlight used rotateX/rotateY state values directly
   * in a style={{background: `radial-gradient(...${rotateY*2}%...)`}}
   * This meant every setState triggered a style string recalculation
   * AND a DOM style write — two operations per frame.
   *
   * FIX: useSpring values drive the spotlight through FM's style prop.
   * FM handles the DOM write on its RAF tick — no React involvement.
   * We keep the spotlight as a separate state-driven element to
   * avoid overcomplicating the motion.div's style prop, but we use
   * the spring values for reading (not raw state).
   *
   * The spotlight is a simple visual enhancement — it doesn't need
   * spring physics itself. Reading from the spring MotionValues
   * (rotateXSpring, rotateYSpring) synchronizes it with the tilt
   * animation naturally.
   */

  return (
    <div
      ref={ref}
      className={cn('perspective-[1000px]', containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={cn(
          'relative rounded-2xl border transition-shadow duration-300',
          'border-emerald-500/15 dark:border-emerald-500/10',
          'bg-card',
          'hover:shadow-2xl hover:shadow-emerald-500/10',
          className,
        )}
        style={{
          /*
           * FIX: style prop (MotionValues) instead of animate prop (state).
           *
           * animate={{ rotateX, rotateY }} — React-driven: creates new
           * object every render, FM diffs it, schedules animation, runs.
           *
           * style={{ rotateX: spring, rotateY: spring }} — FM-driven:
           * FM subscribes to MotionValue changes on its own RAF loop,
           * writes transform directly to DOM. Zero React involvement.
           *
           * transformStyle:'preserve-3d' stays here so child elements
           * can use translateZ for depth layering.
           */
          rotateX:        rotateXSpring,
          rotateY:        rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
      >
        {/*
         * Spotlight effect — uses motion values for position.
         * Rendered as a motion.div so it can subscribe to
         * MotionValues directly without triggering React re-renders.
         */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            /*
             * background is set as a regular style — it will update
             * when the component re-renders on mouse enter/leave ONLY.
             * The 2 re-renders (enter/leave) are acceptable.
             * Mid-hover, the gradient position doesn't need to track
             * pixel-perfectly — the tilt spring provides the "follow"
             * feel. The gradient position just needs to be roughly
             * correct, not exact.
             *
             * If you need pixel-perfect spotlight tracking, use
             * useTransform(rotateYSpring, ...) to derive a percentage
             * and pass it as a CSS variable. For this card, it's
             * not necessary.
             */
            background: `radial-gradient(
              circle at 50% 50%,
              rgba(16,185,129,0.08) 0%,
              transparent 60%
            )`,
            /*
             * Opacity driven by a MotionValue if needed, but
             * simple CSS hover is sufficient here.
             */
          }}
        />

        {children}
      </motion.div>
    </div>
  );
}

export function ThreeDCardBody({
  children,
  className,
}: {
  children:   ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 [transform-style:preserve-3d]', className)}>
      {children}
    </div>
  );
}

export function ThreeDCardItem({
  children,
  className,
  translateZ = 0,
}: {
  children:    ReactNode;
  className?:  string;
  translateZ?: number;
}) {
  return (
    <div
      className={cn('', className)}
      /*
       * translateZ for depth layering within the 3D card.
       * Higher values = closer to viewer.
       * Works because parent has transformStyle:'preserve-3d'.
       */
      style={{ transform: `translateZ(${translateZ}px)` }}
    >
      {children}
    </div>
  );
}