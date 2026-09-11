import React, { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { AlertTriangle, RotateCw } from "lucide-react";
import { DRONE_COMPONENTS } from "../data/droneComponents.js";

const MODEL_URL = "/models/spade-drone.glb";

/* ------------------------------------------------------------------ */
/* Error boundary — Suspense catches the loading state, but a failed  */
/* fetch/parse (missing file, corrupt file) throws outside render and */
/* needs a real error boundary to avoid crashing the whole page.       */
/* ------------------------------------------------------------------ */
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn("SPADE drone model failed to load:", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function MissingModelNotice() {
  return (
    <div className="doc-viewer-fallback">
      <AlertTriangle size={22} />
      <div className="doc-viewer-fallback-title">3D model not found</div>
      <div className="doc-viewer-fallback-text">
        Place your exported file at <code>public/models/spade-drone.glb</code> and reload.
        The viewer will pick it up automatically — no code changes needed.
      </div>
    </div>
  );
}

function LoadingNotice() {
  return (
    <Html center>
      <div className="doc-viewer-loading">
        <RotateCw size={18} className="doc-viewer-spin" />
        Loading model…
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* Loads the GLB, auto-centers + auto-scales it (CAD exports can be in */
/* arbitrary units), and reports its real bounding box upward so       */
/* markers can be positioned from actual geometry, not guesses.        */
/* ------------------------------------------------------------------ */
function DroneModel({ onBoundsReady }) {
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.6 / maxDim;

    clone.position.set(-center.x, -center.y, -center.z);

    const group = new THREE.Group();
    group.add(clone);
    group.scale.setScalar(scale);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color(0xaeb9c9);
        child.material.metalness = 0.35;
        child.material.roughness = 0.55;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    return { group, size, center, scale };
  }, [scene]);

  useEffect(() => {
    onBoundsReady(prepared.size, prepared.scale);
  }, [prepared, onBoundsReady]);

  return <primitive object={prepared.group} />;
}

/* ------------------------------------------------------------------ */
/* One callout marker, positioned from the model's normalized bbox.    */
/* ------------------------------------------------------------------ */
function ComponentMarker({ component, size, scale, active, onSelect }) {
  const worldPos = useMemo(() => {
    const halfX = (size.x * scale) / 2;
    const halfY = (size.y * scale) / 2;
    const halfZ = (size.z * scale) / 2;
    return [
      (component.anchor.x - 0.5) * halfX * 2,
      (component.anchor.y - 0.5) * halfY * 2,
      (component.anchor.z - 0.5) * halfZ * 2,
    ];
  }, [component, size, scale]);

  return (
    <group position={worldPos}>
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={active ? "#22D3EE" : "#67E8F9"} transparent opacity={active ? 1 : 0.85} />
      </mesh>
      {active && (
        <mesh>
          <ringGeometry args={[0.055, 0.075, 32]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Html distanceFactor={8} occlude={false} zIndexRange={[10, 0]}>
        <button
          className={`doc-marker${active ? " active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(component.id);
          }}
        >
          {component.name}
        </button>
      </Html>
    </group>
  );
}

function SceneContent({ activeId, onSelect, onBoundsReady }) {
  const [bounds, setBounds] = useState(null);

  const handleBounds = (size, scale) => {
    setBounds({ size, scale });
    onBoundsReady?.();
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#dbeeff", "#0b1120", 0.5]} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} />
      <directionalLight position={[-4, -2, -4]} intensity={0.4} />

      <DroneModel onBoundsReady={handleBounds} />

      {bounds &&
        DRONE_COMPONENTS.map((c) => (
          <ComponentMarker
            key={c.id}
            component={c}
            size={bounds.size}
            scale={bounds.scale}
            active={activeId === c.id}
            onSelect={onSelect}
          />
        ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={1.4}
        maxDistance={9}
        makeDefault
      />
    </>
  );
}

function ResizeObserverFix() {
  // r3f sometimes needs an explicit invalidate on container resize inside flex layouts
  const { invalidate } = useThree();
  useEffect(() => {
    const id = window.setTimeout(invalidate, 60);
    return () => window.clearTimeout(id);
  }, [invalidate]);
  return null;
}

export default function DroneModelViewer({ activeId, onSelect }) {
  return (
    <div className="doc-viewer-frame">
      <ModelErrorBoundary fallback={<MissingModelNotice />}>
        <Canvas
          camera={{ position: [2.4, 1.6, 2.6], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={<LoadingNotice />}>
            <SceneContent activeId={activeId} onSelect={onSelect} />
          </Suspense>
          <ResizeObserverFix />
        </Canvas>
      </ModelErrorBoundary>
      <div className="doc-viewer-hint">Drag to rotate · Scroll to zoom · Right-drag to pan</div>
    </div>
  );
}

// Pre-warm the loader so navigating into the page doesn't stall on first render.
// Safe no-op if the file isn't there yet — the error boundary above still
// catches the eventual failure when the model actually renders.
try {
  useGLTF.preload(MODEL_URL);
} catch {
  // ignore — handled by ModelErrorBoundary when the model is actually used
}
