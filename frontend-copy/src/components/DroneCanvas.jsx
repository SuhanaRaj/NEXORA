import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DroneCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x8fa4c2, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0x22d3ee, 2.2, 12);
    rim.position.set(-2.4, -1, 2.5);
    scene.add(rim);

    const drone = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1b2638, metalness: 0.55, roughness: 0.35 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.9,
      metalness: 0.2,
      roughness: 0.4,
    });
    const armMat = new THREE.MeshStandardMaterial({ color: 0x2a3a52, metalness: 0.6, roughness: 0.35 });
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x0e1524,
      metalness: 0.3,
      roughness: 0.6,
      transparent: true,
      opacity: 0.55,
    });

    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 32), bodyMat);
    pod.scale.set(1, 0.62, 1.15);
    drone.add(pod);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 16, 48), accentMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.16;
    drone.add(ring);

    const armLen = 1.35;
    const positions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    positions.forEach(([sx, sz]) => {
      const hubPos = new THREE.Vector3(sx * 1.35, 0, sz * 1.35);
      const midPos = hubPos.clone().multiplyScalar(0.5);
      const direction = hubPos.clone().normalize();

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, armLen, 12), armMat);
      arm.position.copy(midPos);
      arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      drone.add(arm);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 20), bodyMat);
      hub.position.set(hubPos.x, 0.02, hubPos.z);
      drone.add(hub);

      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 28), rotorMat);
      rotor.position.set(hubPos.x, 0.09, hubPos.z);
      drone.add(rotor);

      const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), accentMat);
      led.position.set(hubPos.x, -0.03, hubPos.z);
      drone.add(led);
    });

    drone.rotation.x = 0.12;
    scene.add(drone);

    function resize() {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const mouse = { x: 0, y: 0 };
    function onMove(e) {
      const r = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    }
    window.addEventListener("mousemove", onMove);

    let raf;
    const clock = new THREE.Clock();
    function tick() {
      const t = clock.getElapsedTime();
      drone.rotation.y += 0.0032;
      drone.position.y = Math.sin(t * 0.7) * 0.14;
      drone.rotation.x = 0.12 + mouse.y * -0.12;
      drone.rotation.z = mouse.x * 0.1;
      rim.intensity = 1.8 + Math.sin(t * 1.4) * 0.4;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="hero-canvas" />;
}
