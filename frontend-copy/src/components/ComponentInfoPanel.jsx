import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { COMPONENT_MAP } from "../data/droneComponents.js";

export default function ComponentInfoPanel({ activeId, onClose }) {
  const component = activeId ? COMPONENT_MAP[activeId] : null;

  return (
    <AnimatePresence mode="wait">
      {component ? (
        <motion.div
          key={component.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="doc-info-panel"
        >
          <div className="doc-info-head">
            <div>
              <div className="doc-info-kicker">{component.short}</div>
              <div className="doc-info-title">{component.name}</div>
            </div>
            <button className="drawer-close" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          <div className="doc-info-block">
            <div className="doc-info-label">What it is</div>
            <p>{component.purpose}</p>
          </div>
          <div className="doc-info-block">
            <div className="doc-info-label">Function / purpose</div>
            <p>{component.technical}</p>
          </div>
          <div className="doc-info-block">
            <div className="doc-info-label">Role in SPADE</div>
            <p>{component.role}</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="doc-info-panel doc-info-empty"
        >
          <div className="doc-info-title">Select a component</div>
          <p>Click any highlighted point on the model, or a card below, to see its details here.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
