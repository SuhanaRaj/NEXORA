// ---------------------------------------------------------------------------
// SPADE drone — component documentation data.
//
// IMPORTANT CONTEXT (read before editing anchors):
// The uploaded CAD export (public/models/spade-drone.glb) was produced by a
// generic "3D Viewer" pipeline that FUSES the entire SolidWorks assembly into
// a single mesh with one material ("SolidWorks Default"). There are no named
// sub-parts, sub-meshes, or per-component materials in the file — verified by
// parsing the glTF JSON chunk directly (scene → 1 "assembly" node → 1 mesh
// node → 1 primitive → 1 material).
//
// Because of that, `anchor` below is NOT a coordinate pulled from a named
// node — it doesn't exist. It's a normalized position (0–1 on each axis)
// inside the model's actual bounding box, computed at runtime from the real
// loaded geometry (see DroneModelViewer.jsx). Treat these as a starting
// placement for the callout markers, not verified part locations. Open the
// viewer, see where each marker lands relative to the real model, and adjust
// the x/y/z fractions here until they sit where the real component is.
//
// x: 0 = left,   1 = right
// y: 0 = bottom, 1 = top
// z: 0 = back,   1 = front
// ---------------------------------------------------------------------------

export const DRONE_COMPONENTS = [
  {
    id: "frame",
    name: "Drone Frame / Body",
    short: "Structural chassis",
    anchor: { x: 0.5, y: 0.42, z: 0.5 },
    purpose:
      "The frame is the structural backbone of the drone — it holds every other component in a fixed, rigid arrangement.",
    technical:
      "A rigid, lightweight structure (the SolidWorks assembly you exported) that the motors, flight controller, battery, and sensors all mount to. Its geometry determines the drone's weight distribution, rotor spacing, and center of gravity.",
    role:
      "In SPADE, the frame is what makes every other component's position — and therefore the drone's flight stability — predictable and repeatable across units.",
  },
  {
    id: "motors",
    name: "Motors",
    short: "Rotational power",
    anchor: { x: 0.16, y: 0.5, z: 0.18 },
    purpose:
      "Motors spin the propellers to generate lift and enable directional control.",
    technical:
      "Typically brushless DC motors mounted at the end of each arm. Each motor's speed is independently controlled to tilt, climb, descend, or rotate the drone.",
    role:
      "The motors are what let SPADE's drone physically reach and hover over a disaster zone long enough to scan it.",
  },
  {
    id: "propellers",
    name: "Propellers",
    short: "Lift & thrust",
    anchor: { x: 0.16, y: 0.62, z: 0.18 },
    purpose:
      "Propellers convert the motors' rotation into airflow, producing the thrust that lifts and steers the drone.",
    technical:
      "Fixed-pitch blades attached directly to each motor shaft. Paired motor/propeller sets typically spin in opposite directions to cancel out rotational torque on the frame.",
    role:
      "Propeller configuration directly determines flight time and stability — both of which affect how long the drone can stay over a survivor detection area.",
  },
  {
    id: "flight-controller",
    name: "Flight Controller",
    short: "Onboard brain",
    anchor: { x: 0.5, y: 0.5, z: 0.5 },
    purpose:
      "The flight controller is the onboard computer that keeps the drone stable and executes flight commands.",
    technical:
      "Reads data from onboard sensors (e.g. an IMU) many times per second and adjusts each motor's speed to hold attitude, altitude, or a commanded flight path.",
    role:
      "It's what turns raw motor/sensor hardware into controllable, stable flight — the foundation everything else in SPADE's aerial monitoring depends on.",
  },
  {
    id: "battery",
    name: "Battery",
    short: "Power source",
    anchor: { x: 0.5, y: 0.3, z: 0.5 },
    purpose:
      "The battery supplies electrical power to the motors, flight controller, and all onboard electronics.",
    technical:
      "A rechargeable pack mounted near the frame's center of gravity to keep the drone balanced. Its capacity is the primary limit on how long a single flight can last.",
    role:
      "Battery level is one of the live stats shown on the SPADE dashboard, since it directly caps how long a monitoring mission can run before the drone must return.",
  },
  {
    id: "gps",
    name: "GPS Module",
    short: "Positioning",
    anchor: { x: 0.5, y: 0.78, z: 0.42 },
    purpose:
      "The GPS module determines the drone's real-world position, letting it hold a location or follow a planned route.",
    technical:
      "Receives satellite signals to estimate latitude, longitude, and altitude. This is fed to the flight controller for position-hold and navigation.",
    role:
      "GPS position is what lets SPADE plot the drone's location on the live map and tie detected survivors to real map coordinates.",
  },
  {
    id: "camera",
    name: "Camera",
    short: "Visual sensing",
    anchor: { x: 0.5, y: 0.2, z: 0.82 },
    purpose:
      "The camera is the drone's primary sensing input for observing the area below and ahead of it.",
    technical:
      "Typically gimbal- or fixed-mounted, facing downward or forward to capture the search area during flight.",
    role:
      "Camera footage is the raw visual input behind survivor detection in SPADE — it's the reason the drone can act as a set of eyes over a disaster zone.",
  },
  {
    id: "speaker",
    name: "Speaker",
    short: "Audio output",
    anchor: { x: 0.82, y: 0.42, z: 0.4 },
    purpose:
      "The speaker provides an audio output channel from the drone to people on the ground.",
    technical:
      "An onboard audio output device. What plays through it — warnings, announcements, or pre-set messages — depends entirely on the system built around it.",
    role:
      "In SPADE, this is a one-way audio channel only: the drone can play sound outward. It is not a two-way communication system unless that is separately implemented.",
  },
];

export const COMPONENT_MAP = Object.fromEntries(DRONE_COMPONENTS.map((c) => [c.id, c]));
