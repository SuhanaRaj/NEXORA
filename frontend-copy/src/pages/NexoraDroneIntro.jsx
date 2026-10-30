import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NEXORA - Cinematic 3D Drone Launch Sequence (Clean Plain Background & Zero Flashes)
 * 
 * - Phase 1: Minimalist intro screen showing "NEXORA"
 * - Phase 2: Ultra slow-motion 3D drone flight gliding from the distance into a steady hover
 * - Phase 3: Seamless transition navigating to '/dashboard'
 * - Instant Skip: Clicking ANYWHERE on the screen of the drone immediately moves to '/dashboard'
 *   without waiting for the simulation to finish.
 * - Solid plain background, zero flashes, self-contained single-file component.
 */
export default function NexoraDroneIntro({ dashboardPath = '/landing' } = {}) {
  let navigate = null;
  try {
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const [stage, setStage] = useState('INTRO'); // 'INTRO' | 'FLY_IN' | 'HOVER_SETTLE'
  const audioCtxRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const navTimerRef = useRef(null);

  // Soft synthesized sound effect
  const playSfx = (type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio fallback
    }
  };

  // Immediate jump to dashboard on click anywhere during drone simulation
  const goToDashboard = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);

    if (navigate) {
      navigate(dashboardPath);
    } else if (typeof window !== 'undefined') {
      window.location.href = dashboardPath;
    }
  };

  const startDroneLaunch = () => {
    playSfx('click');
    setStage('FLY_IN');

    // After 7.0s smooth slow-motion flight, settle into stabilized hover
    hoverTimerRef.current = setTimeout(() => {
      setStage('HOVER_SETTLE');
    }, 7000);

    // If untouched, automatically navigate to dashboard after simulation ends
    navTimerRef.current = setTimeout(() => {
      goToDashboard();
    }, 10500);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  return (
    <div 
      className={`nx-root ${stage !== 'INTRO' ? 'is-drone-active' : ''}`} 
      id="nexora-root"
      onClick={() => {
        // Clicking anywhere on the screen during the drone simulation immediately moves to dashboard
        if (stage !== 'INTRO') {
          goToDashboard();
        }
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@500;600;700&display=swap');

        .nx-root {
          --nx-cyan: #00f0ff;
          --nx-blue: #0284c7;
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background-color: #030712; /* Solid plain background */
          color: #f1f5f9;
          font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          user-select: none;
        }

        .nx-root.is-drone-active {
          cursor: pointer;
        }

        .nx-root * {
          box-sizing: border-box;
        }

        /* ---------------- PHASE 1: INTRO SCREEN ---------------- */
        .nx-intro-view {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 30;
          text-align: center;
          padding: 20px;
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nx-intro-view.hide {
          opacity: 0;
          transform: scale(1.15) translateY(-30px);
          pointer-events: none;
        }

        .nx-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(64px, 12vw, 130px);
          font-weight: 900;
          letter-spacing: clamp(6px, 2vw, 16px);
          line-height: 1;
          margin: 0;
          background: linear-gradient(180deg, #ffffff 20%, #7dd3fc 70%, #00f0ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 35px rgba(0, 240, 255, 0.45));
          text-transform: uppercase;
        }

        .nx-subtitle {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(13px, 1.8vw, 18px);
          font-weight: 600;
          letter-spacing: 4px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-top: 14px;
        }

        .nx-launch-btn {
          margin-top: 42px;
          appearance: none;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(2, 132, 199, 0.4) 100%);
          border: 1px solid var(--nx-cyan);
          color: #ffffff;
          font-family: 'Orbitron', sans-serif;
          font-weight: 800;
          font-size: clamp(14px, 1.5vw, 16px);
          letter-spacing: 3px;
          padding: 16px 40px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 35px rgba(0, 240, 255, 0.35);
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .nx-launch-btn:hover {
          transform: translateY(-2px) scale(1.03);
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.45) 0%, rgba(2, 132, 199, 0.65) 100%);
          box-shadow: 0 0 50px rgba(0, 240, 255, 0.6);
        }

        /* ---------------- PHASE 2: 3D DRONE STAGE ---------------- */
        .nx-drone-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          transform-style: preserve-3d;
          z-index: 25;
        }

        .nx-drone-actor {
          position: relative;
          width: 760px;
          height: 520px;
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .nx-drone-actor.state-intro {
          opacity: 0;
          transform: translate3d(0, -80px, -1500px) scale3d(0.08, 0.08, 0.08) rotateX(25deg);
        }

        /* Smooth slow-motion arrival (7.0 seconds) */
        .nx-drone-actor.state-fly-in {
          opacity: 1;
          animation: drone-rush-in 7s cubic-bezier(0.16, 0.9, 0.25, 1) forwards;
        }

        @keyframes drone-rush-in {
          0% {
            opacity: 0;
            transform: translate3d(0, -180px, -1400px) scale3d(0.05, 0.05, 0.05) rotateX(40deg) rotateY(-20deg) rotateZ(15deg);
          }
          15% {
            opacity: 1;
          }
          70% {
            transform: translate3d(0, 20px, 120px) scale3d(1.18, 1.18, 1.18) rotateX(12deg) rotateY(14deg) rotateZ(-6deg);
          }
          85% {
            transform: translate3d(0, -15px, 20px) scale3d(1.02, 1.02, 1.02) rotateX(18deg) rotateY(-4deg) rotateZ(2deg);
          }
          100% {
            transform: translate3d(0, 0px, 0px) scale3d(1, 1, 1) rotateX(15deg) rotateY(0deg) rotateZ(0deg);
          }
        }

        /* Natural hovering drift (12 seconds loop) */
        .nx-drone-actor.state-hover {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          animation: drone-alive-hover 12s ease-in-out infinite;
        }

        @keyframes drone-alive-hover {
          0% { transform: translate3d(0, 0, 0) rotateX(14deg) rotateY(-6deg) rotateZ(1deg); }
          25% { transform: translate3d(0, -22px, 10px) rotateX(17deg) rotateY(4deg) rotateZ(-1.5deg); }
          50% { transform: translate3d(0, -32px, 20px) rotateX(12deg) rotateY(-8deg) rotateZ(1.5deg); }
          75% { transform: translate3d(0, -12px, 5px) rotateX(16deg) rotateY(2deg) rotateZ(-0.5deg); }
          100% { transform: translate3d(0, 0, 0) rotateX(14deg) rotateY(-6deg) rotateZ(1deg); }
        }

        /* Slow-motion rotor blades (0.75s per rotation) */
        .nx-prop-cw {
          transform-origin: center;
          animation: spin-prop 0.75s linear infinite;
        }

        .nx-prop-ccw {
          transform-origin: center;
          animation: spin-prop 0.75s linear infinite reverse;
        }

        @keyframes spin-prop {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Subtle on-screen click indicator */
        .nx-skip-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(0, 240, 255, 0.4);
          color: #e0f2fe;
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 8px 22px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          pointer-events: none;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
          animation: pulse-skip 3s ease-in-out infinite;
        }

        @keyframes pulse-skip {
          0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.03); }
        }

        @media (max-width: 768px) {
          .nx-drone-actor { width: 90vw; height: 60vw; }
        }
      `}</style>

      {/* =========================================================================
          PHASE 1: STARTING SCREEN ("NEXORA")
          ========================================================================= */}
      <div 
        className={`nx-intro-view ${stage !== 'INTRO' ? 'hide' : ''}`} 
        id="nexora-intro-screen"
        onClick={(e) => {
          if (stage === 'INTRO') {
            e.stopPropagation();
            startDroneLaunch();
          }
        }}
        style={{ cursor: stage === 'INTRO' ? 'pointer' : 'default' }}
      >
        <h1 className="nx-title">NEXORA</h1>
        <div className="nx-subtitle">AUTONOMOUS AERIAL RECONNAISSANCE</div>

        <button 
          className="nx-launch-btn"
          id="nexora-launch-btn"
          onClick={(e) => {
            e.stopPropagation();
            startDroneLaunch();
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          LAUNCH DRONE
        </button>
      </div>

      {/* =========================================================================
          PHASE 2: 3D DRONE FLY-IN (Smooth slow-motion arrival)
          ========================================================================= */}
      <div className="nx-drone-stage" id="nexora-drone-stage">
        <div 
          className={`nx-drone-actor ${
            stage === 'INTRO'
              ? 'state-intro'
              : stage === 'FLY_IN'
              ? 'state-fly-in'
              : 'state-hover'
          }`}
          id="nexora-drone-actor"
          onClick={(e) => {
            e.stopPropagation();
            if (stage !== 'INTRO') {
              goToDashboard();
            }
          }}
          title="Click to move to dashboard"
        >
          {/* HIGH-PRECISION 3D-STYLE RESCUE QUADCOPTER DRONE SVG */}
          <svg 
            viewBox="0 0 800 560" 
            width="100%" 
            height="100%" 
            style={{ overflow: 'visible', filter: 'drop-shadow(0 20px 45px rgba(0, 0, 0, 0.8))' }}
          >
            <defs>
              <linearGradient id="nxCarbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2d3748" />
                <stop offset="50%" stopColor="#141c2b" />
                <stop offset="100%" stopColor="#080c14" />
              </linearGradient>

              <linearGradient id="nxChassis" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3f495a" />
                <stop offset="60%" stopColor="#1e2533" />
                <stop offset="100%" stopColor="#0b0f17" />
              </linearGradient>

              <radialGradient id="nxHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.25" />
                <stop offset="75%" stopColor="#0284c7" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="nxCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#00f0ff" />
                <stop offset="75%" stopColor="#0284c7" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#030712" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 4 QUADCOPTER CHASSIS ARMS */}
            <g id="nx-arms">
              <polygon points="380,280 180,140 205,125 400,265" fill="url(#nxChassis)" stroke="#1e293b" strokeWidth="2" />
              <line x1="375" y1="270" x2="190" y2="135" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.8" />

              <polygon points="420,280 620,140 595,125 400,265" fill="url(#nxChassis)" stroke="#1e293b" strokeWidth="2" />
              <line x1="425" y1="270" x2="610" y2="135" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.8" />

              <polygon points="360,340 100,420 125,455 375,370" fill="url(#nxChassis)" stroke="#334155" strokeWidth="2.5" />
              <line x1="355" y1="350" x2="115" y2="435" stroke="#00f0ff" strokeWidth="3.5" opacity="0.9" />

              <polygon points="440,340 700,420 675,455 425,370" fill="url(#nxChassis)" stroke="#334155" strokeWidth="2.5" />
              <line x1="445" y1="350" x2="685" y2="435" stroke="#00f0ff" strokeWidth="3.5" opacity="0.9" />
            </g>

            {/* 4 MOTORS & ROTOR BLADES */}
            <g transform="translate(190, 126)">
              <ellipse cx="0" cy="4" rx="44" ry="18" fill="#1f2937" stroke="#00f0ff" strokeWidth="1.5" />
              <ellipse cx="0" cy="0" rx="100" ry="34" fill="url(#nxHalo)" />
              <g className="nx-prop-cw">
                <ellipse cx="0" cy="0" rx="95" ry="7" fill="#090d16" opacity="0.85" />
                <ellipse cx="0" cy="0" rx="7" ry="95" fill="#090d16" opacity="0.85" />
                <line x1="-92" y1="0" x2="92" y2="0" stroke="#00f0ff" strokeWidth="2" />
                <line x1="0" y1="-92" x2="0" y2="92" stroke="#00f0ff" strokeWidth="2" />
                <circle cx="0" cy="0" r="8" fill="#00f0ff" />
              </g>
            </g>

            <g transform="translate(610, 126)">
              <ellipse cx="0" cy="4" rx="44" ry="18" fill="#1f2937" stroke="#00f0ff" strokeWidth="1.5" />
              <ellipse cx="0" cy="0" rx="100" ry="34" fill="url(#nxHalo)" />
              <g className="nx-prop-ccw">
                <ellipse cx="0" cy="0" rx="95" ry="7" fill="#090d16" opacity="0.85" />
                <ellipse cx="0" cy="0" rx="7" ry="95" fill="#090d16" opacity="0.85" />
                <line x1="-92" y1="0" x2="92" y2="0" stroke="#00f0ff" strokeWidth="2" />
                <line x1="0" y1="-92" x2="0" y2="92" stroke="#00f0ff" strokeWidth="2" />
                <circle cx="0" cy="0" r="8" fill="#00f0ff" />
              </g>
            </g>

            <g transform="translate(110, 430)">
              <ellipse cx="0" cy="5" rx="58" ry="24" fill="#1f2937" stroke="#00f0ff" strokeWidth="2" />
              <circle cx="0" cy="35" r="5" fill="#00f0ff" style={{ filter: 'drop-shadow(0 0 6px #00f0ff)' }} />
              <ellipse cx="0" cy="0" rx="135" ry="46" fill="url(#nxHalo)" />
              <g className="nx-prop-ccw">
                <ellipse cx="0" cy="0" rx="128" ry="10" fill="#090d16" opacity="0.9" />
                <ellipse cx="0" cy="0" rx="10" ry="128" fill="#090d16" opacity="0.9" />
                <line x1="-125" y1="0" x2="125" y2="0" stroke="#00f0ff" strokeWidth="3" />
                <line x1="0" y1="-125" x2="0" y2="125" stroke="#00f0ff" strokeWidth="3" />
                <circle cx="0" cy="0" r="14" fill="#38bdf8" />
                <circle cx="0" cy="0" r="7" fill="#ffffff" />
              </g>
            </g>

            <g transform="translate(690, 430)">
              <ellipse cx="0" cy="5" rx="58" ry="24" fill="#1f2937" stroke="#00f0ff" strokeWidth="2" />
              <circle cx="0" cy="35" r="5" fill="#00f0ff" style={{ filter: 'drop-shadow(0 0 6px #00f0ff)' }} />
              <ellipse cx="0" cy="0" rx="135" ry="46" fill="url(#nxHalo)" />
              <g className="nx-prop-cw">
                <ellipse cx="0" cy="0" rx="128" ry="10" fill="#090d16" opacity="0.9" />
                <ellipse cx="0" cy="0" rx="10" ry="128" fill="#090d16" opacity="0.9" />
                <line x1="-125" y1="0" x2="125" y2="0" stroke="#00f0ff" strokeWidth="3" />
                <line x1="0" y1="-125" x2="0" y2="125" stroke="#00f0ff" strokeWidth="3" />
                <circle cx="0" cy="0" r="14" fill="#38bdf8" />
                <circle cx="0" cy="0" r="7" fill="#ffffff" />
              </g>
            </g>

            {/* CENTRAL FUSELAGE / CHASSIS */}
            <polygon 
              points="400,200 495,255 485,355 400,395 315,355 305,255" 
              fill="url(#nxCarbon)" 
              stroke="#00f0ff" 
              strokeWidth="2.5" 
            />
            <polygon points="400,200 435,255 425,375 400,395" fill="#1f293d" opacity="0.95" />
            <polygon points="400,200 365,255 375,375 400,395" fill="#111827" opacity="0.95" />

            {/* Avionics Core */}
            <circle cx="400" cy="295" r="34" fill="#050b14" stroke="#00f0ff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px #00f0ff)' }} />
            <circle cx="400" cy="295" r="24" fill="url(#nxCore)" />
            <circle cx="400" cy="295" r="10" fill="#ffffff" />

            <text x="400" y="245" fill="#38bdf8" fontSize="11" fontFamily="'Orbitron', sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="3">
              NEXORA-9
            </text>

            {/* FLIR Gimbal Camera */}
            <g id="nx-gimbal">
              <path d="M 385 395 L 415 395 L 420 430 L 380 430 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <circle cx="400" cy="440" r="24" fill="#080d1a" stroke="#00f0ff" strokeWidth="2" />
              <circle cx="393" cy="440" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="393" cy="440" r="3.5" fill="#ffffff" />
              <circle cx="411" cy="440" r="5" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </div>

      {/* Floating prompt indicating clicking anywhere advances to dashboard */}
    </div>
  );
}