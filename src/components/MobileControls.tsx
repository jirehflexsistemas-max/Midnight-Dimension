import React, { useRef, useEffect } from 'react';
import { Zap, Clock, Compass, Shield, Flame } from 'lucide-react';

interface MobileControlsProps {
  onMove: (vx: number, vy: number) => void;
  onAim: (dx: number, dy: number, isShooting: boolean) => void;
  onDash: () => void;
  onSpecial: () => void;
  onUltimate: () => void;
  specialReady: boolean;
  ultimateReady: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onAim,
  onDash,
  onSpecial,
  onUltimate,
  specialReady,
  ultimateReady,
}) => {
  const stickRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const el = stickRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      const rect = el.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          const dx = touch.clientX - originRef.current.x;
          const dy = touch.clientY - originRef.current.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 45;
          const clampedX = dist > 0 ? (dx / Math.max(dist, maxDist)) * Math.min(dist, maxDist) : 0;
          const clampedY = dist > 0 ? (dy / Math.max(dist, maxDist)) * Math.min(dist, maxDist) : 0;
          onMove(clampedX / maxDist, clampedY / maxDist);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          onMove(0, 0);
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onMove]);

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none p-4 flex items-end justify-between select-none z-30 sm:hidden">
      {/* Virtual Joystick */}
      <div
        ref={stickRef}
        className="w-24 h-24 rounded-full bg-slate-950/60 border-2 border-purple-500/40 pointer-events-auto flex items-center justify-center backdrop-blur-sm shadow-xl active:border-purple-400"
      >
        <div className="w-10 h-10 rounded-full bg-purple-600/70 shadow-md border border-purple-300 pointer-events-none" />
      </div>

      {/* Action Buttons cluster */}
      <div className="flex flex-col gap-2 pointer-events-auto items-end">
        <div className="flex items-center gap-2">
          {/* Chrono-Stasis */}
          <button
            onClick={onSpecial}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
              specialReady
                ? 'bg-purple-600 text-white border border-purple-300 shadow-purple-900/50'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <Clock className="w-5 h-5" />
          </button>

          {/* Ultimate: Reality Rewrite */}
          <button
            onClick={onUltimate}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
              ultimateReady
                ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-amber-900/50 animate-pulse'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        {/* Dash Button */}
        <button
          onClick={onDash}
          className="w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center shadow-xl shadow-sky-950/60 border border-sky-300 active:scale-95"
        >
          <Shield className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
