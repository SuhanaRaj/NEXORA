// // import React from "react";
// // import { AnimatePresence, motion } from "framer-motion";
// // import { X, MapPin, Radar, Gauge, Radio, Send, PackagePlus, Mic } from "lucide-react";
// // import { PRIORITY_META } from "../data/mock.js";

// // const ACTIONS = [
// //   { key: "dispatch", label: "Dispatch Rescue", icon: Send },
// //   { key: "supply", label: "Supply Package", icon: PackagePlus },
// //   { key: "voice", label: "Voice Message", icon: Mic },
// // ];

// // export default function SurvivorDrawer({ survivor, onClose, onAction }) {
// //   export default function SurvivorDrawer({ survivor, onClose, onAction }) {
// //   const priorityMeta =
// //     PRIORITY_META[survivor?.priority] || PRIORITY_META.medium;

// //   return (
// //     <AnimatePresence>
// //       {survivor && (
// //         <>
// //           <motion.div
// //             className="drawer-backdrop"
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             exit={{ opacity: 0 }}
// //             transition={{ duration: 0.2 }}
// //             onClick={onClose}
// //           />
// //           <motion.div
// //             className="drawer-panel"
// //             initial={{ x: "100%" }}
// //             animate={{ x: 0 }}
// //             exit={{ x: "100%" }}
// //             transition={{ type: "spring", stiffness: 320, damping: 34 }}
// //           >
// //             <div className="drawer-head">
// //               <div className="drawer-title">Survivor Details</div>
// //               <button className="drawer-close" onClick={onClose}>
// //                 <X size={16} />
// //               </button>
// //             </div>

// //             <div className="drawer-body">
// //               {/* <span className={`badge badge-lg ${PRIORITY_META[survivor.priority].cls}`}>
// //                 <span className="badge-dot" />
// //                 {PRIORITY_META[survivor.priority].label.toUpperCase()}
// //               </span> */}
// //               <span className={`badge badge-lg ${priorityMeta.cls}`}>
// //                 <span className="badge-dot" />
// //                 {priorityMeta.label.toUpperCase()}
// //               </span>

// //               <div className="drawer-id">{survivor.id}</div>
// //               <div className="drawer-desc">{survivor.type}</div>

// //               <div className="drawer-grid">
// //                 <div className="drawer-field">
// //                   <div className="drawer-field-label">
// //                     <MapPin size={13} /> Location
// //                   </div>
// //                   <div className="drawer-field-value">{survivor.locationLabel || `Sector ${survivor.sector}`}</div>
// //                 </div>
// //                 <div className="drawer-field">
// //                   <div className="drawer-field-label">
// //                     <Radar size={13} /> Detection confidence
// //                   </div>
// //                   <div className="drawer-field-value tabular">{survivor.confidence}%</div>
// //                 </div>
// //                 <div className="drawer-field">
// //                   <div className="drawer-field-label">
// //                     <Gauge size={13} /> Detected by
// //                   </div>
// //                   <div className="drawer-field-value">{survivor.detectedBy}</div>
// //                 </div>
// //                 <div className="drawer-field">
// //                   <div className="drawer-field-label">
// //                     <Radio size={13} /> Current status
// //                   </div>
// //                   <div className="drawer-field-value drawer-status">{survivor.status}</div>
// //                 </div>
// //               </div>

// //               <div className="drawer-actions">
// //                 {ACTIONS.map((a) => (
// //                   <motion.button
// //                     key={a.key}
// //                     className="drawer-action-btn"
// //                     whileHover={{ y: -1 }}
// //                     whileTap={{ scale: 0.97 }}
// //                     onClick={() => onAction(survivor.id, a.key)}
// //                   >
// //                     <a.icon size={14} />
// //                     {a.label}
// //                   </motion.button>
// //                 ))}
// //               </div>
// //             </div>
// //           </motion.div>
// //         </>
// //       )}
// //     </AnimatePresence>
// //   );
// //   }


// import React from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   X,
//   MapPin,
//   Radar,
//   Gauge,
//   Radio,
//   Send,
//   PackagePlus,
//   Mic,
// } from "lucide-react";
// import { PRIORITY_META } from "../data/mock.js";

// const ACTIONS = [
//   { key: "dispatch", label: "Dispatch Rescue", icon: Send },
//   { key: "supply", label: "Supply Package", icon: PackagePlus },
//   { key: "voice", label: "Voice Message", icon: Mic },
// ];

// export default function SurvivorDrawer({
//   survivor,
//   onClose,
//   onAction,
// }) {
//   const priorityMeta =
//     PRIORITY_META[survivor?.priority] || PRIORITY_META.medium;

//   return (
//     <AnimatePresence>
//       {survivor && (
//         <>
//           <motion.div
//             className="drawer-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             onClick={onClose}
//           />

//           <motion.div
//             className="drawer-panel"
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{
//               type: "spring",
//               stiffness: 320,
//               damping: 34,
//             }}
//           >
//             <div className="drawer-head">
//               <div className="drawer-title">
//                 Survivor Details
//               </div>

//               <button
//                 className="drawer-close"
//                 onClick={onClose}
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             <div className="drawer-body">

//               {/* Priority */}
//               <span
//                 className={`badge badge-lg ${priorityMeta.cls}`}
//               >
//                 <span className="badge-dot" />
//                 {priorityMeta.label.toUpperCase()}
//               </span>

//               {/* Survivor ID */}
//               <div className="drawer-id">
//                 {survivor.id}
//               </div>

//               <div className="drawer-desc">
//                 {survivor.type}
//               </div>

//               {/* Details */}
//               <div className="drawer-grid">

//                 <div className="drawer-field">
//                   <div className="drawer-field-label">
//                     <MapPin size={13} />
//                     Location
//                   </div>

//                   <div className="drawer-field-value">
//                     {survivor.locationLabel ||
//                       `Sector ${survivor.sector}`}
//                   </div>
//                 </div>

//                 <div className="drawer-field">
//                   <div className="drawer-field-label">
//                     <Radar size={13} />
//                     Detection confidence
//                   </div>

//                   <div className="drawer-field-value tabular">
//                     {survivor.confidence}%
//                   </div>
//                 </div>

//                 <div className="drawer-field">
//                   <div className="drawer-field-label">
//                     <Gauge size={13} />
//                     Detected by
//                   </div>

//                   <div className="drawer-field-value">
//                     {survivor.detectedBy}
//                   </div>
//                 </div>

//                 <div className="drawer-field">
//                   <div className="drawer-field-label">
//                     <Radio size={13} />
//                     Current status
//                   </div>

//                   <div className="drawer-field-value drawer-status">
//                     {survivor.status}
//                   </div>
//                 </div>

//               </div>

//               {/* Actions */}
//               <div className="drawer-actions">
//                 {ACTIONS.map((a) => (
//                   <motion.button
//                     key={a.key}
//                     className="drawer-action-btn"
//                     whileHover={{ y: -1 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() =>
//                       onAction(survivor.id, a.key)
//                     }
//                   >
//                     <a.icon size={14} />
//                     {a.label}
//                   </motion.button>
//                 ))}
//               </div>

//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Radar,
  Gauge,
  Radio,
  Send,
  PackagePlus,
  Mic,
  Navigation,
  Target,
} from "lucide-react";

import { PRIORITY_META } from "../data/mock.js";

const ACTIONS = [
  {
    key: "dispatch",
    label: "Dispatch Rescue",
    icon: Send,
  },
  {
    key: "supply",
    label: "Supply Package",
    icon: PackagePlus,
  },
  {
    key: "voice",
    label: "Voice Message",
    icon: Mic,
  },
];

export default function SurvivorDrawer({
  survivor,
  onClose,
  onAction,
}) {
  /*
   * No survivor selected = don't render drawer.
   */
  if (!survivor) {
    return null;
  }

  /*
   * Defensive priority handling.
   *
   * This prevents the whole React page from crashing if
   * the backend sends an unexpected priority.
   */
  const priorityKey =
    String(survivor.priority || "medium").toLowerCase();

  const priorityMeta =
    PRIORITY_META[priorityKey] ||
    PRIORITY_META.medium || {
      cls: "",
      label: "Medium",
      color: "#FACC15",
    };


  /*
   * Check whether we actually have GPS coordinates.
   */
  const hasLocation =
    typeof survivor.lat === "number" &&
    typeof survivor.lng === "number";


  return (
    <AnimatePresence>
      <>
        {/* ================================================= */}
        {/* BACKDROP                                         */}
        {/* ================================================= */}

        <motion.div
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />


        {/* ================================================= */}
        {/* DRAWER                                            */}
        {/* ================================================= */}

        <motion.div
          className="drawer-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 34,
          }}
        >

          {/* ------------------------------------------------ */}
          {/* HEADER                                           */}
          {/* ------------------------------------------------ */}

          <div className="drawer-head">

            <div className="drawer-title">
              Survivor Details
            </div>

            <button
              className="drawer-close"
              onClick={onClose}
              aria-label="Close survivor details"
            >
              <X size={16} />
            </button>

          </div>


          {/* ------------------------------------------------ */}
          {/* BODY                                             */}
          {/* ------------------------------------------------ */}

          <div className="drawer-body">


            {/* PRIORITY */}
            <span
              className={`badge badge-lg ${priorityMeta.cls}`}
            >
              <span className="badge-dot" />

              {String(
                priorityMeta.label || "Medium"
              ).toUpperCase()}
            </span>


            {/* SURVIVOR ID */}
            <div className="drawer-id">
              {survivor.id || "Unknown Survivor"}
            </div>


            {/* DESCRIPTION */}
            <div className="drawer-desc">
              {survivor.type ||
                "Person detected by onboard AI"}
            </div>


            {/* ================================================= */}
            {/* INFORMATION GRID                                  */}
            {/* ================================================= */}

            <div className="drawer-grid">


              {/* LOCATION */}
              <div className="drawer-field">

                <div className="drawer-field-label">
                  <MapPin size={13} />
                  Location
                </div>

                <div className="drawer-field-value">

                  {hasLocation
                    ? survivor.locationLabel ||
                      "Detection point near drone"
                    : "Location unavailable"}

                </div>

              </div>


              {/* GPS COORDINATES */}
              <div className="drawer-field">

                <div className="drawer-field-label">
                  <Navigation size={13} />
                  GPS Coordinates
                </div>

                <div className="drawer-field-value tabular">

                  {hasLocation ? (
                    <>
                      {survivor.lat.toFixed(6)}
                      <br />
                      {survivor.lng.toFixed(6)}
                    </>
                  ) : (
                    "No GPS fix"
                  )}

                </div>

              </div>


              {/* CONFIDENCE */}
              <div className="drawer-field">

                <div className="drawer-field-label">
                  <Radar size={13} />
                  Detection confidence
                </div>

                <div className="drawer-field-value tabular">

                  {Number.isFinite(
                    survivor.confidence
                  )
                    ? `${survivor.confidence}%`
                    : "—"}

                </div>

              </div>


              {/* TRACK ID */}
              <div className="drawer-field">

                <div className="drawer-field-label">
                  <Target size={13} />
                  AI Track ID
                </div>

                <div className="drawer-field-value tabular">

                  {survivor.trackId ?? "—"}

                </div>

              </div>


              {/* DETECTED BY */}
              <div className="drawer-field">

                <div className="drawer-field-label">
                  <Gauge size={13} />
                  Detected by
                </div>

                <div className="drawer-field-value">

                  {survivor.detectedBy ||
                    "AI backend"}

                </div>

              </div>


              {/* STATUS */}
              <div className="drawer-field">

                <div className="drawer-field-label">
                  <Radio size={13} />
                  Current status
                </div>

                <div className="drawer-field-value drawer-status">

                  {survivor.status ||
                    "Awaiting Response"}

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* LOCATION NOTE                                    */}
            {/* ================================================= */}

            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 11,
                lineHeight: 1.5,
                background: "rgba(255,255,255,0.04)",
                color: "var(--c-text-dim)",
              }}
            >

              <strong>
                Location:
              </strong>{" "}

              {hasLocation
                ? survivor.locationApproximate
                  ? "Approximate detection position based on the drone GPS at the time of detection."
                  : "GPS position available."
                : "GPS position was not available when the person was detected."}

            </div>


            {/* ================================================= */}
            {/* ACTIONS                                          */}
            {/* ================================================= */}

            <div className="drawer-actions">

              {ACTIONS.map((action) => (

                <motion.button
                  key={action.key}
                  className="drawer-action-btn"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onAction(
                      survivor.id,
                      action.key
                    )
                  }
                >

                  <action.icon size={14} />

                  {action.label}

                </motion.button>

              ))}

            </div>

          </div>

        </motion.div>
      </>
    </AnimatePresence>
  );
}