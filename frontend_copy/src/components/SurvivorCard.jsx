// import React from "react";
// import { ChevronRight } from "lucide-react";
// import { PRIORITY_META } from "../data/mock.js";

// export default function SurvivorCard({ survivor, selected, onView }) {
//   const meta = PRIORITY_META[survivor.priority];
//   return (
//     <div
//       className={`s-card${selected ? " selected" : ""}`}
//       style={{ "--edge": meta.color }}
//       onClick={() => onView(survivor.id)}
//     >
//       <div className="s-card-top">
//         <span className={`badge ${meta.cls}`}>
//           <span className="badge-dot" />
//           {meta.label}
//         </span>
//         <span className="s-card-code">{survivor.id}</span>
//       </div>
//       <div className="s-card-desc">{survivor.type}</div>
//       <div className="s-card-meta">
//         Sector {survivor.sector} · {survivor.time}
//       </div>
//       <button
//         className="s-card-btn"
//         onClick={(e) => {
//           e.stopPropagation();
//           onView(survivor.id);
//         }}
//       >
//         View details
//         <ChevronRight size={13} />
//       </button>
//     </div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { PRIORITY_META } from "../data/mock.js";

export default function SurvivorCard({ survivor, selected, onView, onOpenDetails }) {
  // const meta = PRIORITY_META[survivor.priority];
  const meta =
  PRIORITY_META[survivor?.priority] || PRIORITY_META.medium;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={`s-card${selected ? " selected" : ""}`}
      style={{ "--edge": meta.color }}
      onClick={() => onView(survivor.id)}
    >
      <div className="s-card-top">
        <span className={`badge ${meta.cls}`}>
          <span className="badge-dot" />
          {meta.label}
        </span>
        <span className="s-card-code">{survivor.id}</span>
      </div>
      <div className="s-card-desc">{survivor.type}</div>
      <div className="s-card-meta">
        {survivor.locationLabel || `Sector ${survivor.sector}`} · {survivor.time}
      </div>
      <div className="s-card-status">{survivor.status}</div>
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        className="s-card-btn"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(survivor.id);
        }}
      >
        View details
        <ChevronRight size={13} />
      </motion.button>
    </motion.div>
  );
}
