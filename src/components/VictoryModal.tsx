import React from 'react';
import { Award, Sparkles, ArrowRight, Home, Zap, ShieldCheck } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface VictoryModalProps {
  level: LevelConfig;
  scrapEarned: number;
  onNextLevel: () => void;
  onReturnToNexus: () => void;
  isFinalLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  scrapEarned,
  onNextLevel,
  onReturnToNexus,
  isFinalLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
            {isFinalLevel ? '¡EL MULTIVERSO HA SIDO SALVADO!' : '¡GRIETA DIMENSIONAL SELLADA!'}
          </span>

          <h2 className="font-cinzel text-3xl font-black text-white">
            {isFinalLevel ? 'DRAKTHUL DERROTADO' : `VICTORIA EN ${level.city.toUpperCase()}`}
          </h2>

          <p className="text-xs text-slate-300 font-light max-w-md mx-auto">
            {level.dialogueDefeat[level.dialogueDefeat.length - 1]?.text}
          </p>
        </div>

        {/* Fragment Card */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-purple-900/60 text-left space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-cinzel text-xs font-bold text-amber-200">
              FRAGMENTO DEL PANDORUM OBTENIDO
            </span>
          </div>
          <span className="text-sm font-bold text-white block">
            {level.pandorumShardName}
          </span>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            {level.pandorumShardDesc}
          </p>
        </div>

        {/* Currency summary */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="text-slate-400">Fragmentos Reclamados:</span>
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> +{scrapEarned} ⚡
          </span>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Avanzar al Siguiente Nivel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 bg-amber-950/50 border border-amber-600/60 rounded-xl text-amber-200 text-xs font-mono">
              ¡Has conquistado toda la Campaña de Midnight Dimensions! Las dimensiones vuelven a orbitar en armonía.
            </div>
          )}

          <button
            onClick={onReturnToNexus}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Nexo del Arquitecto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
