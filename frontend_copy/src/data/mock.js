// export const CENTER = [28.6692, 77.4538];

// export const DRONE_STATUSES = ["Searching", "Scanning area", "Returning to base"];

// export const DRONE = {
//   id: "UAV-01",
//   alias: "Eagle",
//   status: "Searching",
//   battery: 82,
//   altitude: 120,
//   speed: 15,
//   lat: 28.6704,
//   lng: 77.4552,
// };

// export const ZONES = [
//   { id: "z1", center: [28.6725, 77.4498], radius: 260, color: "#EF4444", label: "Flood zone A" },
//   { id: "z2", center: [28.6658, 77.4585], radius: 200, color: "#F59E0B", label: "Collapse zone B" },
// ];

// export const INITIAL_SURVIVORS = [
//   { id: "SRV-025", priority: "critical", type: "Structural collapse", sector: "D1", locationLabel: "Sector D1", time: "4 min ago", lat: 28.6718, lng: 77.4503, confidence: 96, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-021", priority: "high", type: "Flooded residential area", sector: "B4", locationLabel: "Sector B4", time: "9 min ago", lat: 28.6667, lng: 77.4578, confidence: 91, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-019", priority: "medium", type: "Debris field", sector: "C2", locationLabel: "Sector C2", time: "11 min ago", lat: 28.6689, lng: 77.4531, confidence: 87, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-018", priority: "critical", type: "Trapped, partial collapse", sector: "D2", locationLabel: "Sector D2", time: "14 min ago", lat: 28.6733, lng: 77.4512, confidence: 94, status: "Rescue Team Dispatched", detectedBy: "UAV-01" },
//   { id: "SRV-016", priority: "high", type: "Stranded, rising water", sector: "B2", locationLabel: "Sector B2", time: "18 min ago", lat: 28.6672, lng: 77.4562, confidence: 89, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-015", priority: "medium", type: "Blocked stairwell", sector: "C4", locationLabel: "Sector C4", time: "21 min ago", lat: 28.6701, lng: 77.4520, confidence: 83, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-013", priority: "high", type: "Isolated, roof access", sector: "B1", locationLabel: "Sector B1", time: "26 min ago", lat: 28.6658, lng: 77.4547, confidence: 90, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-012", priority: "medium", type: "Minor injury reported", sector: "A3", locationLabel: "Sector A3", time: "29 min ago", lat: 28.6742, lng: 77.4570, confidence: 79, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-010", priority: "critical", type: "Unresponsive, needs extraction", sector: "D3", locationLabel: "Sector D3", time: "33 min ago", lat: 28.6711, lng: 77.4495, confidence: 97, status: "Supply Package En Route", detectedBy: "UAV-01" },
//   { id: "SRV-008", priority: "medium", type: "Sheltering in place", sector: "A1", locationLabel: "Sector A1", time: "38 min ago", lat: 28.6748, lng: 77.4540, confidence: 81, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-006", priority: "high", type: "Vehicle submerged nearby", sector: "B3", locationLabel: "Sector B3", time: "41 min ago", lat: 28.6662, lng: 77.4595, confidence: 88, status: "Awaiting Response", detectedBy: "UAV-01" },
//   { id: "SRV-004", priority: "medium", type: "Debris field, mobile", sector: "C1", locationLabel: "Sector C1", time: "47 min ago", lat: 28.6695, lng: 77.4515, confidence: 85, status: "Awaiting Response", detectedBy: "UAV-01" },
// ];

// export const PRIORITY_META = {
//   critical: { label: "Critical", color: "#EF4444", cls: "critical" },
//   high: { label: "High priority", color: "#F59E0B", cls: "high" },
//   medium: { label: "Medium", color: "#FACC15", cls: "medium" },
// };

// export const SIM_TYPES = [
//   "Structural collapse",
//   "Flooded residential area",
//   "Debris field",
//   "Blocked stairwell",
//   "Stranded, rising water",
//   "Trapped, partial collapse",
//   "Isolated, roof access",
// ];
// export const SIM_SECTORS = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "D4"];
// export const SIM_PRIORITIES = ["critical", "high", "medium"];

export const CENTER = [28.6692, 77.4538];

export const DRONE_STATUSES = [
  "Searching",
  "Scanning area",
  "Returning to base",
];

export const DRONE = {
  id: "UAV-01",
  alias: "Eagle",
  status: "Searching",
  battery: 82,
  altitude: 120,
  speed: 15,
  lat: 28.6704,
  lng: 77.4552,
};

export const ZONES = [
  {
    id: "z1",
    center: [28.6725, 77.4498],
    radius: 260,
    color: "#EF4444",
    label: "Flood zone A",
  },
  {
    id: "z2",
    center: [28.6658, 77.4585],
    radius: 200,
    color: "#F59E0B",
    label: "Collapse zone B",
  },
];

export const PRIORITY_META = {
  critical: {
    label: "Critical",
    color: "#EF4444",
    cls: "critical",
  },

  high: {
    label: "High priority",
    color: "#F59E0B",
    cls: "high",
  },

  medium: {
    label: "Medium",
    color: "#FACC15",
    cls: "medium",
  },
};

export const SIM_TYPES = [
  "Structural collapse",
  "Flooded residential area",
  "Debris field",
  "Blocked stairwell",
  "Stranded, rising water",
  "Trapped, partial collapse",
  "Isolated, roof access",
];

export const SIM_SECTORS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "B3",
  "C1",
  "C2",
  "D1",
  "D2",
  "D4",
];

export const SIM_PRIORITIES = [
  "critical",
  "high",
  "medium",
];