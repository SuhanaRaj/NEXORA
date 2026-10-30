// import React, { useState } from "react";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// export default function CameraFeed() {
//   const [cameraError, setCameraError] = useState(false);

//   const videoUrl = `${API_BASE_URL}/video_feed`;

//   return (
//     <div className="camera-feed">
//       <div className="camera-feed-header">
//         <div>
//           <div className="camera-feed-title">AI Camera Feed</div>
//           <div className="camera-feed-subtitle">
//             YOLO + BoT-SORT detection
//           </div>
//         </div>

//         <div className="camera-live">
//           <span className="dot red dot-pulse" />
//           LIVE
//         </div>
//       </div>

//       <div className="camera-screen">
//         {!cameraError ? (
//           <img
//             src={videoUrl}
//             alt="AI camera detection feed"
//             className="camera-video"
//             onError={() => setCameraError(true)}
//           />
//         ) : (
//           <div className="camera-offline">
//             <div className="camera-offline-icon">◉</div>
//             <div>Camera feed unavailable</div>
//             <small>
//               Make sure the FastAPI backend and camera are running.
//             </small>
//           </div>
//         )}

//         {!cameraError && (
//           <div className="camera-overlay">
//             <span>AI DETECTION</span>
//             <span>YOLO</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function CameraFeed() {
  const [cameraError, setCameraError] = useState(false);

  const videoUrl = `${API_BASE_URL}/video_feed`;

  return (
    <div className="camera-feed">

      <div className="camera-feed-header">
        <div>
          <div className="camera-feed-title">
            AI Camera Feed
          </div>

          <div className="camera-feed-subtitle">
            YOLO + BoT-SORT detection
          </div>
        </div>

        <div className="camera-live">
          <span className="dot red dot-pulse" />
          LIVE
        </div>
      </div>

      <div className="camera-screen">

        {!cameraError ? (
          <img
            src={videoUrl}
            alt="AI detection camera feed"
            className="camera-video"
            onLoad={() => setCameraError(false)}
            onError={() => setCameraError(true)}
          />
        ) : (
          <div className="camera-offline">

            <div className="camera-offline-icon">
              ◉
            </div>

            <div>
              Camera feed unavailable
            </div>

            <small>
              Backend: {API_BASE_URL}
            </small>

            <small>
              Check /video_feed and camera status
            </small>

          </div>
        )}

        {!cameraError && (
          <div className="camera-overlay">
            <span>AI DETECTION</span>
            <span>YOLO</span>
          </div>
        )}

      </div>
    </div>
  );
}