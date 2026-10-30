const statusEl=document.getElementById("status");
const startBtn=document.getElementById("start");
const latEl=document.getElementById("lat");
const lonEl=document.getElementById("lon");
const accEl=document.getElementById("acc");
const altEl=document.getElementById("alt");
document.getElementById("url").textContent=location.href;
let watchId=null;
let sending=false;

function status(text,kind=""){statusEl.textContent=text;statusEl.className="status "+kind;}

async function sendPosition(pos){
  const c=pos.coords;
  latEl.textContent=c.latitude.toFixed(6);
  lonEl.textContent=c.longitude.toFixed(6);
  accEl.textContent=`±${Math.round(c.accuracy||0)} m`;
  altEl.textContent=c.altitude==null?"—":`${c.altitude.toFixed(1)} m`;
  try{
    const r=await fetch("/api/phone-gps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({latitude:c.latitude,longitude:c.longitude,altitude:c.altitude,speed:c.speed,accuracy:c.accuracy,heading:c.heading})});
    if(!r.ok) throw new Error("Backend rejected GPS");
    status(`PHONE GPS LIVE • ±${Math.round(c.accuracy||0)} m`,"live");
  }catch(e){status("GPS FOUND, BUT DASHBOARD CONNECTION FAILED","err");}
}

function startGPS(){
  if(!window.isSecureContext){status("SECURE CONNECTION REQUIRED — open the HTTPS GPS URL","err");return;}
  if(!navigator.geolocation){status("THIS PHONE BROWSER DOES NOT PROVIDE GPS","err");return;}
  if(watchId!==null) navigator.geolocation.clearWatch(watchId);
  status("REQUESTING PHONE LOCATION…");
  watchId=navigator.geolocation.watchPosition(sendPosition,(err)=>{
    const messages={1:"Location permission denied. Allow location for Chrome.",2:"Phone location unavailable. Turn on Location and try again.",3:"GPS request timed out. Move near a window/outdoors and retry."};
    status(messages[err.code]||"Unable to read phone GPS.","err");
  },{enableHighAccuracy:true,maximumAge:1000,timeout:15000});
}
startBtn.addEventListener("click",startGPS);
// Attempt automatically after load; the button remains available for permission-retry.
startGPS();
