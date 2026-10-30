const state = {
  mode: "flood",
  map: null,
  layers: {},
  drone: null,
  home: null,
  trail: null,
  zone: null,
  lastPosition: null
};

const $ = id => document.getElementById(id);

function icon(cls, text) {
  return L.divIcon({className:"", html:`<div class="${cls}">${text}</div>`, iconSize:null});
}

function initMap() {
  state.map = L.map("map", {zoomControl:true, preferCanvas:true}).setView([20.5937,78.9629], 5);
  const attribution = "Esri";
  state.layers.street = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution});
  state.layers.topo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution});
  state.layers.imagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution});
  state.layers.terrain = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution});
  state.layers.street.addTo(state.map);
}

function setLayer(name) {
  Object.values(state.layers).forEach(l => state.map.removeLayer(l));
  (state.layers[name] || state.layers.street).addTo(state.map);
}

function updateMap(s) {
  if (!s.position) return;
  const p = [s.position.latitude, s.position.longitude];
  if (!state.drone) state.drone = L.marker(p, {icon:icon("drone-marker","D")}).addTo(state.map).bindTooltip("PHONE / DRONE", {permanent:true, direction:"top"});
  else state.drone.setLatLng(p);

  if (s.home) {
    const h = [s.home.latitude, s.home.longitude];
    if (!state.home) state.home = L.marker(h, {icon:icon("home-marker","H")}).addTo(state.map).bindTooltip("HOME / LAUNCH", {permanent:true, direction:"bottom"});
    else state.home.setLatLng(h);
  }

  const pts = (s.trail || []).map(x => [x.latitude,x.longitude]);
  if (pts.length) {
    if (!state.trail) state.trail = L.polyline(pts, {color:"#19d9ff",weight:4,opacity:.9}).addTo(state.map);
    else state.trail.setLatLngs(pts);
  }

  const score = s.ai?.priority_score || 0;
  const radius = 30 + score * 1.8;
  if (score > 0) {
    if (!state.zone) state.zone = L.circle(p, {radius,color:"#ff3f58",fillColor:"#ff3f58",fillOpacity:.12,weight:2}).addTo(state.map);
    else state.zone.setLatLng(p);
    state.zone.setRadius(radius);
  } else if (state.zone) {
    state.map.removeLayer(state.zone); state.zone=null;
  }
}

function render(s) {
  $("systemStatus").textContent = s.position ? "● LIVE POSITION" : "● GPS WAITING";
  $("engineName").textContent = s.ai.engine;
  $("priority").textContent = s.ai.priority;
  $("priority").className = "priority " + s.ai.priority.toLowerCase();
  $("priorityLabel").textContent = s.ai.priority_label;
  $("score").textContent = s.ai.priority_score;
  $("scoreMeter").style.width = `${s.ai.priority_score}%`;
  $("currentPeople").textContent = s.ai.current_people;
  $("uniquePeople").textContent = s.ai.unique_people;
  $("aiFps").textContent = s.ai.ai_fps;
  $("capFps").textContent = s.camera.capture_fps;
  $("device").textContent = s.ai.device;
  $("visionPeople").textContent = `PEOPLE ${s.ai.current_people}`;
  $("camStatus").textContent = s.camera.status.toUpperCase();
  $("camStatus").className = s.camera.status === "online" ? "live" : "label";

  const p = s.position;
  $("lat").textContent = p ? p.latitude.toFixed(6) : "—";
  $("lon").textContent = p ? p.longitude.toFixed(6) : "—";
  $("alt").textContent = p ? `${Number(p.altitude||0).toFixed(1)} m` : "—";
  $("speed").textContent = p ? `${Number(p.speed||0).toFixed(1)} m/s` : "—";
  $("battery").textContent = p ? `${Number(p.battery||0).toFixed(0)}%` : "—";
  $("gpsAge").textContent = s.gps_age == null ? "—" : `${s.gps_age}s`;
  $("gpsSource").textContent = `GPS: ${p?.source || "—"}`;
  $("phoneGps").textContent = s.phone_gps_status.toUpperCase();

  $("homeCoord").textContent = s.home ? `${s.home.latitude.toFixed(6)}, ${s.home.longitude.toFixed(6)}` : "Waiting for position";
  $("failsafeText").textContent = s.failsafe ? "RETURN-TO-HOME CONDITION" : "SAFE / MONITORING";
  $("failsafeText").style.color = s.failsafe ? "#ff3f58" : "#39f58a";
  $("failsafeReason").textContent = s.failsafe_reason;
  $("mapSub").textContent = p ? `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)} • ${p.source}` : "Waiting for live position";

  const modeTitle = s.mode === "flood" ? "Flood Rescue AI" : s.mode === "earthquake" ? "Earthquake Rescue AI" : "Landslide Rescue AI";
  $("guidanceTitle").textContent = modeTitle;
  $("guidanceCards").innerHTML = s.ai.guidance.map((g,i)=>`<div class="guidance-card"><b>POLICY ${i+1}</b><p>${g}</p></div>`).join("");

  updateMap(s);
}

async function post(url, body={}) {
  const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  return r.json();
}

document.querySelectorAll(".mode").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    document.querySelectorAll(".mode").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    await post("/api/mode",{mode:btn.dataset.mode});
  });
});
document.querySelectorAll("[data-layer]").forEach(btn=>btn.addEventListener("click",()=>setLayer(btn.dataset.layer)));
$("recenter").addEventListener("click",()=>{ if(state.lastPosition) state.map.setView([state.lastPosition.latitude,state.lastPosition.longitude],17); });
$("connectCamera").addEventListener("click",async ()=>{
  const source = $("cameraUrl").value.trim();
  if(!source) return;
  await post("/api/camera",{source});
});
$("resetTracking").addEventListener("click",()=>post("/api/reset-tracking"));
$("rthBtn").addEventListener("click",()=>post("/api/rth"));
$("warningBtn").addEventListener("click",()=>{
  const text = `${$("priority").textContent} emergency. ${$("priorityLabel").textContent}. ${$("engineName").textContent} has prioritized this observation.`;
  if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  alert(text);
});


async function loadNetworkInfo(){
  try{
    const r=await fetch("/api/network");
    const n=await r.json();
    $("phoneBridgeUrl").textContent=n.phone_gps_url;
    $("openGpsBridge").onclick=()=>window.open(n.phone_gps_url,"_blank");
  }catch(e){
    $("phoneBridgeUrl").textContent="Open the backend terminal to see the HTTPS phone GPS URL";
    $("openGpsBridge").disabled=true;
  }
}

function startSocket() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${proto}://${location.host}/ws`);
  ws.onmessage = e => {
    const s = JSON.parse(e.data);
    state.lastPosition = s.position;
    render(s);
  };
  ws.onclose = ()=>setTimeout(startSocket,1000);
}
initMap();
loadNetworkInfo();
startSocket();
