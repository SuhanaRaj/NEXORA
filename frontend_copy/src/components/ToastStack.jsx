import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="toast"
          >
            <CheckCircle2 size={15} className="toast-icon" />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
