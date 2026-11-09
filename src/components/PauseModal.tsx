import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Shield } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  levelName: string;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExitToTitle,
  isMuted,
  onToggleMute,
  levelName,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
            {levelName}
          </span>
          <h2 className="font-cinzel text-3xl font-black text-white">
            CRONOSTASIS ACTIVADA
          </h2>
          <p className="text-xs text-slate-400">
            El flujo temporal de la batalla está suspendido.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Reanudar Incursión</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Reiniciar Nivel</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            <span>{isMuted ? 'Activar Sonido y Música' : 'Silenciar Audio'}</span>
          </button>

          <button
            onClick={onExitToTitle}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Regresar al Nexo / Menú</span>
          </button>
        </div>
      </div>
    </div>
  );
};
