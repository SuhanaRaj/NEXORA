import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, Radar, Gauge, Radio, Send, PackagePlus, Mic } from "lucide-react";
import { PRIORITY_META } from "../data/mock.js";

const ACTIONS = [
  { key: "dispatch", label: "Dispatch Rescue", icon: Send },
  { key: "supply", label: "Supply Package", icon: PackagePlus },
  { key: "voice", label: "Voice Message", icon: Mic },
];

export default function SurvivorDrawer({ survivor, onClose, onAction }) {
  // Same defensive fallback as SurvivorCard.jsx — never let an unexpected
  // priority value crash the drawer.
  const meta = survivor ? PRIORITY_META[survivor.priority] || PRIORITY_META.medium : null;

  return (
    <AnimatePresence>
      {survivor && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="drawer-head">
              <div className="drawer-title">Survivor Details</div>
              <button className="drawer-close" onClick={onClose}>
                <X size={16} />
              </button>
            </div>

            <div className="drawer-body">
              <span className={`badge badge-lg ${meta.cls}`}>
                <span className="badge-dot" />
                {meta.label.toUpperCase()}
              </span>

              <div className="drawer-id">{survivor.id}</div>
              <div className="drawer-desc">{survivor.type}</div>

              <div className="drawer-grid">
                <div className="drawer-field">
                  <div className="drawer-field-label">
                    <MapPin size={13} /> Location
                  </div>
                  <div className="drawer-field-value">{survivor.locationLabel || `Sector ${survivor.sector}`}</div>
                </div>
                <div className="drawer-field">
                  <div className="drawer-field-label">
                    <Radar size={13} /> Detection confidence
                  </div>
                  <div className="drawer-field-value tabular">{survivor.confidence}%</div>
                </div>
                <div className="drawer-field">
                  <div className="drawer-field-label">
                    <Gauge size={13} /> Detected by
                  </div>
                  <div className="drawer-field-value">{survivor.detectedBy}</div>
                </div>
                <div className="drawer-field">
                  <div className="drawer-field-label">
                    <Radio size={13} /> Current status
                  </div>
                  <div className="drawer-field-value drawer-status">{survivor.status}</div>
                </div>
              </div>

              <div className="drawer-actions">
                {ACTIONS.map((a) => (
                  <motion.button
                    key={a.key}
                    className="drawer-action-btn"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onAction(survivor.id, a.key)}
                  >
                    <a.icon size={14} />
                    {a.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
