/**
 * Shared framer-motion mock for tests.
 *
 * Usage in test files:
 *   vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));
 */
import React from "react";

const MOTION_PROPS = new Set([
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
  "layout",
  "layoutId",
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "drag",
  "dragConstraints",
  "onDragEnd",
]);

function filterMotionProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROPS.has(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function createMotionProxy() {
  return new Proxy(
    {},
    {
      get(_target, tag: string) {
        return function MotionComponent({
          children,
          ...props
        }: Record<string, unknown>) {
          return React.createElement(
            tag,
            filterMotionProps(props),
            children as React.ReactNode,
          );
        };
      },
    },
  );
}

export const motion = createMotionProxy();

export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
