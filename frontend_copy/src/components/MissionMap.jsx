// import React, { useEffect, useRef, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from "react-leaflet";
// import L from "leaflet";
// import { CENTER, ZONES, PRIORITY_META } from "../data/mock.js";
// import { VIDEO_FEED_URL } from "../config/backend.js";

// function markerIcon(html) {
//   return L.divIcon({ className: "", html, iconSize: [14, 14], iconAnchor: [7, 7] });
// }

// const droneIcon = markerIcon(
//   `<div class="marker-wrap"><div class="marker-ring"></div><div class="marker-dot m-cyan"></div></div>`
// );

// function priorityIcon(priority) {
//   const cls = priority === "critical" ? "m-red" : priority === "high" ? "m-orange" : "m-yellow";
//   return markerIcon(`<div class="marker-wrap"><div class="marker-dot ${cls}"></div></div>`);
// }

// // Flies the map to a survivor and opens its popup whenever flyToId changes.
// function FlyTo({ flyToId, survivors, markerRefs }) {
//   const map = useMap();
//   useEffect(() => {
//     if (!flyToId) return;
//     const s = survivors.find((x) => x.id === flyToId);
//     if (!s) return;
//     map.flyTo([s.lat, s.lng], 16, { duration: 0.8 });
//     const marker = markerRefs.current[flyToId];
//     if (marker) marker.openPopup();
//   }, [flyToId, survivors, map]);
//   return null;
// }

// export default function MissionMap({ drone, survivors, onSelectSurvivor, flyToId }) {
//   const markerRefs = useRef({});
//   const [showCamera, setShowCamera] = useState(false);
//   const [feedError, setFeedError] = useState(false);

//   return (
//     <div className="map-canvas">
//       <MapContainer
//         center={CENTER}
//         zoom={14.3}
//         zoomControl={false}
//         attributionControl={false}
//         style={{ position: "absolute", inset: 0 }}
//       >
//         {/* <TileLayer
//           url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//           subdomains="abcd"
//           maxZoom={19}
//         /> */}

//         {/* <TileLayer
//           attribution="Tiles &copy; Esri"
//           url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//           maxZoom={19}
//         /> */}

//       <TileLayer
//   attribution="Tiles &copy; Esri"
//   url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//   maxZoom={19}
// />

// <TileLayer
//   attribution="&copy; Esri"
//   url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
//   maxZoom={19}
// />

//         {ZONES.map((z) => (
//           <Circle
//             key={z.id}
//             center={z.center}
//             radius={z.radius}
//             pathOptions={{ color: z.color, weight: 1.4, fillColor: z.color, fillOpacity: 0.08, dashArray: "5 6" }}
//           >
//             <Tooltip direction="top">{z.label}</Tooltip>
//           </Circle>
//         ))}

//         <Marker position={[drone.lat, drone.lng]} icon={droneIcon}>
//           <Popup>
//             <div className="popup-title">{drone.id}</div>
//             <div className="popup-row">
//               Status: <b>{drone.status}</b>
//             </div>
//             <div className="popup-row">
//               Battery: <b>{drone.battery}%</b>
//             </div>
//           </Popup>
//         </Marker>

//         {survivors
//           .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
//           .map((s) => {
//           const meta = PRIORITY_META[s.priority];
//           return (
//             <Marker
//               key={s.id}
//               position={[s.lat, s.lng]}
//               icon={priorityIcon(s.priority)}
//               ref={(el) => {
//                 if (el) markerRefs.current[s.id] = el;
//               }}
//               eventHandlers={{ click: () => onSelectSurvivor(s.id) }}
//             >
//               <Popup>
//                 <div className="popup-title">{s.id}</div>
//                 <div className="popup-row">
//                   Priority: <b>{meta.label}</b>
//                 </div>
//                 <div className="popup-row">
//                   {s.locationLabel || `Sector ${s.sector}`}
//                 </div>
//               </Popup>
//             </Marker>
//           );
//         })}

//         <FlyTo flyToId={flyToId} survivors={survivors} markerRefs={markerRefs} />
//       </MapContainer>

//       <div className="legend">
//         <div className="legend-item"><span className="legend-swatch" style={{ background: "#22D3EE" }} />Drone</div>
//         <div className="legend-item"><span className="legend-swatch" style={{ background: "#EF4444" }} />Critical survivor</div>
//         <div className="legend-item"><span className="legend-swatch" style={{ background: "#F59E0B" }} />High priority</div>
//         <div className="legend-item"><span className="legend-swatch" style={{ background: "#FACC15" }} />Medium priority</div>
//       </div>

//       <button
//         className="camera-toggle"
//         onClick={() => {
//           setShowCamera((v) => !v);
//           setFeedError(false);
//         }}
//       >
//         {showCamera ? "Hide camera" : "Live camera"}
//       </button>

//       {showCamera && (
//         <div className="camera-feed-box">
//           {feedError ? (
//             <div className="camera-feed-error">Camera feed unavailable</div>
//           ) : (
//             <img
//               src={VIDEO_FEED_URL}
//               alt="Live AI camera feed"
//               className="camera-feed-img"
//               onError={() => setFeedError(true)}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Tooltip,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  CENTER,
  ZONES,
  PRIORITY_META,
} from "../data/mock.js";

import {
  VIDEO_FEED_URL,
} from "../config/backend.js";


function markerIcon(html) {
  return L.divIcon({
    className: "",
    html,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}


const droneIcon = markerIcon(
  `
  <div class="marker-wrap">
    <div class="marker-ring"></div>
    <div class="marker-dot m-cyan"></div>
  </div>
  `
);


function priorityIcon(priority) {

  const cls =
    priority === "critical"
      ? "m-red"
      : priority === "high"
      ? "m-orange"
      : "m-yellow";

  return markerIcon(
    `
    <div class="marker-wrap">
      <div class="marker-dot ${cls}"></div>
    </div>
    `
  );
}


/* ========================================================= */
/* Fly map to selected survivor                              */
/* ========================================================= */

function FlyTo({
  flyToId,
  survivors,
  markerRefs,
}) {

  const map = useMap();

  useEffect(() => {

    if (!flyToId) {
      return;
    }

    const survivor =
      survivors.find(
        (item) =>
          item.id === flyToId
      );

    if (!survivor) {
      return;
    }

    if (
      typeof survivor.lat !== "number" ||
      typeof survivor.lng !== "number"
    ) {
      return;
    }

    map.flyTo(
      [
        survivor.lat,
        survivor.lng,
      ],
      17,
      {
        duration: 0.8,
      }
    );

    const marker =
      markerRefs.current[
        flyToId
      ];

    if (marker) {
      marker.openPopup();
    }

  }, [
    flyToId,
    survivors,
    map,
    markerRefs,
  ]);

  return null;
}


/* ========================================================= */
/* Mission Map                                                */
/* ========================================================= */

export default function MissionMap({
  drone,
  survivors,
  onSelectSurvivor,
  flyToId,
}) {

  const markerRefs =
    useRef({});

  const [
    showCamera,
    setShowCamera,
  ] = useState(false);

  const [
    feedError,
    setFeedError,
  ] = useState(false);


  return (

    <div className="map-canvas">

      <MapContainer
        center={CENTER}
        zoom={14.3}
        zoomControl={false}
        attributionControl={false}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >


        {/* ================================================= */}
        {/* MAP TILES                                         */}
        {/* ================================================= */}

        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        <TileLayer
          attribution="&copy; Esri"
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />


        {/* ================================================= */}
        {/* ZONES                                             */}
        {/* ================================================= */}

        {Array.isArray(ZONES) &&
          ZONES.map((zone) => (

            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                weight: 1.4,
                fillColor: zone.color,
                fillOpacity: 0.08,
                dashArray: "5 6",
              }}
            >

              <Tooltip direction="top">
                {zone.label}
              </Tooltip>

            </Circle>

          ))}


        {/* ================================================= */}
        {/* DRONE                                             */}
        {/* ================================================= */}

        {drone &&
          typeof drone.lat === "number" &&
          typeof drone.lng === "number" && (

          <Marker
            position={[
              drone.lat,
              drone.lng,
            ]}
            icon={droneIcon}
          >

            <Popup>

              <div className="popup-title">
                {drone.id}
              </div>

              <div className="popup-row">
                Status:{" "}
                <b>
                  {drone.status}
                </b>
              </div>

              <div className="popup-row">
                Battery:{" "}
                <b>
                  {drone.battery}%
                </b>
              </div>

              <div className="popup-row">
                GPS:{" "}
                <b>
                  {drone.lat.toFixed(6)},
                  {" "}
                  {drone.lng.toFixed(6)}
                </b>
              </div>

            </Popup>

          </Marker>

        )}


        {/* ================================================= */}
        {/* SURVIVORS                                         */}
        {/* ================================================= */}

        {Array.isArray(survivors) &&

          survivors
            .filter(
              (survivor) =>
                typeof survivor.lat ===
                  "number" &&
                typeof survivor.lng ===
                  "number"
            )
            .map((survivor) => {

              const meta =
                PRIORITY_META[
                  String(
                    survivor.priority ||
                      "medium"
                  ).toLowerCase()
                ] ||
                PRIORITY_META.medium || {
                  label: "Medium",
                };


              return (

                <Marker
                  key={survivor.id}
                  position={[
                    survivor.lat,
                    survivor.lng,
                  ]}
                  icon={priorityIcon(
                    survivor.priority
                  )}
                  ref={(element) => {

                    if (element) {

                      markerRefs.current[
                        survivor.id
                      ] = element;

                    }

                  }}
                  eventHandlers={{
                    click: () =>
                      onSelectSurvivor(
                        survivor.id
                      ),
                  }}
                >

                  <Popup>

                    <div className="popup-title">
                      {survivor.id}
                    </div>

                    <div className="popup-row">
                      Priority:{" "}
                      <b>
                        {meta.label}
                      </b>
                    </div>

                    <div className="popup-row">
                      Confidence:{" "}
                      <b>
                        {survivor.confidence}%
                      </b>
                    </div>

                    <div className="popup-row">
                      Track ID:{" "}
                      <b>
                        {survivor.trackId ?? "—"}
                      </b>
                    </div>

                    <div className="popup-row">
                      Latitude:{" "}
                      <b>
                        {survivor.lat.toFixed(6)}
                      </b>
                    </div>

                    <div className="popup-row">
                      Longitude:{" "}
                      <b>
                        {survivor.lng.toFixed(6)}
                      </b>
                    </div>

                    <div className="popup-row">
                      <b>
                        {survivor.locationLabel}
                      </b>
                    </div>

                  </Popup>

                </Marker>

              );

            })}


        {/* ================================================= */}
        {/* AUTO FLY TO SURVIVOR                              */}
        {/* ================================================= */}

        <FlyTo
          flyToId={flyToId}
          survivors={survivors}
          markerRefs={markerRefs}
        />

      </MapContainer>


      {/* =================================================== */}
      {/* MAP LEGEND                                         */}
      {/* =================================================== */}

      <div className="legend">

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: "#22D3EE",
            }}
          />
          Drone
        </div>

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: "#EF4444",
            }}
          />
          Critical survivor
        </div>

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: "#F59E0B",
            }}
          />
          High priority
        </div>

        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background: "#FACC15",
            }}
          />
          Medium priority
        </div>

      </div>


      {/* =================================================== */}
      {/* CAMERA BUTTON                                       */}
      {/* =================================================== */}

      <button
        className="camera-toggle"
        onClick={() => {

          setShowCamera(
            (previous) =>
              !previous
          );

          setFeedError(false);

        }}
      >

        {showCamera
          ? "Hide camera"
          : "Live camera"}

      </button>


      {/* =================================================== */}
      {/* CAMERA FEED                                         */}
      {/* =================================================== */}

      {showCamera && (

        <div className="camera-feed-box">

          {feedError ? (

            <div className="camera-feed-error">
              Camera feed unavailable
            </div>

          ) : (

            <img
              src={VIDEO_FEED_URL}
              alt="Live AI camera feed"
              className="camera-feed-img"
              onError={() =>
                setFeedError(true)
              }
            />

          )}

        </div>

      )}

    </div>
  );
}