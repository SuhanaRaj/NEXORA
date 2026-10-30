import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reuses the self-signed certificate the FastAPI backend already generates
// on startup (backend_copy/.runtime/phone_gps_cert.pem/key.pem — see
// backend/main.py's ensure_tls_certificate()). That certificate already
// lists this machine's current LAN IP as a Subject Alternative Name, so
// there's no need to generate a second certificate just for the Vite dev
// server, and no IP is hardcoded here.
//
// Order of operations: start the backend at least once (it writes the
// certificate on startup) before starting the frontend over HTTPS.
//
// Override the location with VITE_SSL_CERT_DIR (in .env) if the backend
// project lives somewhere other than the default sibling `backend_copy`
// folder.
function resolveDevCertificate(env) {
  const certDir = env.VITE_SSL_CERT_DIR || path.resolve(__dirname, "../backend_copy/.runtime");
  const certFile = path.join(certDir, "phone_gps_cert.pem");
  const keyFile = path.join(certDir, "phone_gps_key.pem");
  try {
    if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
      return { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) };
    }
  } catch {
    // fall through to HTTP below
  }
  return null;
}

export default defineConfig(({ mode }) => {
  // Loads .env / .env.local into a plain object without the VITE_ prefix
  // filter (the 3rd arg ""), since VITE_SSL_CERT_DIR is only ever read here
  // in Node — it's never sent to client code via import.meta.env.
  const env = loadEnv(mode, __dirname, "");
  const devCertificate = resolveDevCertificate(env);

  if (!devCertificate) {
    // eslint-disable-next-line no-console
    console.warn(
      "\n[vite] No dev TLS certificate found at ../backend_copy/.runtime — falling back to plain HTTP.\n" +
        "       localhost still works fine. Phone camera/geolocation access over the LAN IP requires\n" +
        "       HTTPS: start the backend once first (it generates the certificate on launch), then\n" +
        "       restart `npm run dev`.\n"
    );
  }

  return {
    plugins: [react()],
    server: {
      host: true, // 0.0.0.0 — reachable from other devices on the same Wi-Fi
      port: 5173,
      strictPort: true,
      // https: devCertificate || undefined,
    },
  };
});
