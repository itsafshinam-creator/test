import React, { useRef, useState, useEffect } from 'react';
import { Sword, Shield, Wind, ArrowUp, Footprints, Hand } from 'lucide-react';
import * as THREE from 'three';

interface MobileControlsProps {
  onMoveChange: (dir: THREE.Vector2) => void;
  onCameraRotate: (deltaX: number, deltaY: number) => void;
  onAttack: () => void;
  onHeavyAttack: () => void;
  onDodge: () => void;
  onJump: () => void;
  onStealthToggle: () => void;
  onInteract: () => void;
  isCrouched: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveChange,
  onCameraRotate,
  onAttack,
  onHeavyAttack,
  onDodge,
  onJump,
  onStealthToggle,
  onInteract,
  isCrouched,
}) => {
  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchId = useRef<number | null>(null);

  // Camera Swipe state
  const cameraTouchId = useRef<number | null>(null);
  const lastCameraPos = useRef({ x: 0, y: 0 });

  // Joystick touch handlers
  const handleJoystickStart = (e: React.TouchEvent) => {
    if (joystickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setIsJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        onMoveChange(new THREE.Vector2(0, 0));
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setJoystickPos({ x: dx, y: dy });

    // Normalized vector (-1 to 1)
    const normX = dx / maxRadius;
    const normY = dy / maxRadius;
    onMoveChange(new THREE.Vector2(normX, normY));
  };

  // Camera swipe handlers across upper screen / right screen
  const handleCamStart = (e: React.TouchEvent) => {
    // Only accept touch if not on joystick or right action buttons
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier !== joystickTouchId.current && cameraTouchId.current === null) {
        cameraTouchId.current = touch.identifier;
        lastCameraPos.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleCamMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchId.current) {
        const deltaX = touch.clientX - lastCameraPos.current.x;
        const deltaY = touch.clientY - lastCameraPos.current.y;
        lastCameraPos.current = { x: touch.clientX, y: touch.clientY };
        onCameraRotate(deltaX, deltaY);
        break;
      }
    }
  };

  const handleCamEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === cameraTouchId.current) {
        cameraTouchId.current = null;
        break;
      }
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto z-10 touch-none select-none"
      onTouchStart={handleCamStart}
      onTouchMove={handleCamMove}
      onTouchEnd={handleCamEnd}
      onTouchCancel={handleCamEnd}
    >
      {/* LEFT: Virtual Joystick Base */}
      <div
        ref={joystickBaseRef}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleJoystickStart(e);
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          handleJoystickMove(e);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleJoystickEnd(e);
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          handleJoystickEnd(e);
        }}
        className="absolute bottom-8 left-6 w-32 h-32 rounded-full bg-slate-900/60 backdrop-blur-sm border-2 border-slate-700/60 shadow-xl flex items-center justify-center pointer-events-auto"
      >
        <div className="w-10 h-10 rounded-full border border-slate-700/40 pointer-events-none" />
        <div
          className={`absolute w-14 h-14 rounded-full bg-amber-500/80 border-2 border-amber-300 shadow-md transition-transform pointer-events-none ${
            isJoystickActive ? 'scale-105 bg-amber-400' : ''
          }`}
          style={{
            transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
          }}
        />
      </div>

      {/* RIGHT: Action Touch Buttons Cluster */}
      <div
        className="absolute bottom-6 right-5 pointer-events-auto flex flex-col items-end gap-2"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Upper Row: Stealth & Heavy Attack */}
        <div className="flex items-center gap-3">
          {/* Stealth / Crouch Button */}
          <button
            onClick={onStealthToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg active:scale-90 transition-all ${
              isCrouched
                ? 'bg-sky-600 text-white border-sky-300 shadow-sky-900/50'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 shadow-black/40'
            }`}
            title="Stealth / Crouch"
          >
            <Footprints className="w-5 h-5" />
          </button>

          {/* Heavy Attack / Block */}
          <button
            onClick={onHeavyAttack}
            className="w-13 h-13 rounded-full bg-rose-950/80 border-2 border-rose-600 text-rose-300 shadow-lg active:scale-90 transition-all flex items-center justify-center"
            title="Heavy Attack"
          >
            <Shield className="w-6 h-6" />
          </button>
        </div>

        {/* Lower Row: Jump, Dodge, Interact, and Primary Attack */}
        <div className="flex items-center gap-3">
          {/* Dodge / Roll Button */}
          <button
            onClick={onDodge}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 shadow-lg active:scale-90 transition-all flex items-center justify-center"
            title="Dodge Roll"
          >
            <Wind className="w-5 h-5 text-amber-400" />
          </button>

          {/* Jump / Vault Button */}
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-slate-800/90 border-2 border-slate-600 text-white shadow-xl active:scale-90 transition-all flex items-center justify-center"
            title="Jump / Vault"
          >
            <ArrowUp className="w-7 h-7 text-sky-400" />
          </button>

          {/* Primary Attack Button */}
          <button
            onClick={onAttack}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 border-2 border-amber-300 text-slate-950 shadow-2xl active:scale-90 transition-all flex items-center justify-center"
            title="Attack"
          >
            <Sword className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};
