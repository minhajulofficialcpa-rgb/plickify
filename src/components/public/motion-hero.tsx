"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function MotionHero({ children }: PropsWithChildren) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
