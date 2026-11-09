import React from 'react';
import { RotateCcw, Home, Skull, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  onRetry: () => void;
  onReturnToNexus: () => void;
  levelName: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRetry,
  onReturnToNexus,
  levelName,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-600/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-400">
            <Skull className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 block">
            FRACTURA MULTIVERSAL TOTAL
          </span>

          <h2 className="font-cinzel text-3xl font-black text-white">
            LA REALIDAD HA COLAPSADO
          </h2>

          <p className="text-xs text-slate-300 font-light max-w-sm mx-auto">
            La esencia de Zeynthar se dispersó en el vacío de {levelName}. Las sombras de Drakthul consumen la membrana dimensional.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onRetry}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold rounded-xl shadow-xl shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reintentar Incursión</span>
          </button>

          <button
            onClick={onReturnToNexus}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Nexo del Arquitecto (Mejorar Runas)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
