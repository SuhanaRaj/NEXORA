// import React from "react";
// import SurvivorCard from "./SurvivorCard.jsx";

// const FILTERS = [
//   { key: "all", label: "All" },
//   { key: "critical", label: "Critical" },
//   { key: "high", label: "High" },
// ];

// export default function SurvivorList({ survivors, selectedId, onView, filter, onFilterChange }) {
//   const filtered = survivors.filter((s) => (filter === "all" ? true : s.priority === filter));

//   return (
//     <>
//       <div className="pane-header">
//         <div className="pane-title">Survivor detection</div>
//         <div style={{ fontSize: 12, color: "var(--c-text-dim)" }}>{survivors.length} detected</div>
//       </div>

//       <div className="filters">
//         {FILTERS.map((f) => (
//           <button
//             key={f.key}
//             className={`filter-pill${filter === f.key ? " active" : ""}`}
//             onClick={() => onFilterChange(f.key)}
//           >
//             {f.label}
//           </button>
//         ))}
//       </div>

//       <div className="survivor-scroll">
//         {filtered.map((s) => (
//           <SurvivorCard key={s.id} survivor={s} selected={s.id === selectedId} onView={onView} />
//         ))}
//       </div>
//     </>
//   );
// }

import React from "react";
import { AnimatePresence } from "framer-motion";
import SurvivorCard from "./SurvivorCard.jsx";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
];

export default function SurvivorList({ survivors, selectedId, onView, onOpenDetails, filter, onFilterChange }) {
  const filtered = survivors.filter((s) => (filter === "all" ? true : s.priority === filter));

  return (
    <>
      <div className="pane-header">
        <div className="pane-title">Survivor detection</div>
        <div style={{ fontSize: 12, color: "var(--c-text-dim)" }}>{survivors.length} detected</div>
      </div>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-pill${filter === f.key ? " active" : ""}`}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="survivor-scroll">
        <AnimatePresence initial={false}>
          {filtered.map((s) => (
            <SurvivorCard
              key={s.id}
              survivor={s}
              selected={s.id === selectedId}
              onView={onView}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
