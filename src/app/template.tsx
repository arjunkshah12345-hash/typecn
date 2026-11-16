"use client";

import { motion, useReducedMotion } from "motion/react";

/** Route transition: content rises and resolves in; a thin accent rule sweeps across. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <>
      {!reduce ? (
        <motion.span
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ scaleX: { duration: 0.7, ease: [0.87, 0, 0.13, 1] }, opacity: { delay: 0.6, duration: 0.3 } }}
        />
      ) : null}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
