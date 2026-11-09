import React from 'react';
import { ArrowLeft, Skull, Flame, Zap, ShieldAlert, Award } from 'lucide-react';
import { LevelConfig } from '../types/game';
import { LEVELS } from '../data/loreAndLevels';

interface ChaosRiftsModalProps {
  onBack: () => void;
  onLaunchChallenge: (level: LevelConfig) => void;
  scrap: number;
}

export const ChaosRiftsModal: React.FC<ChaosRiftsModalProps> = ({
  onBack,
  onLaunchChallenge,
  scrap,
}) => {
  // Use Level 6 (The Void Throne of Drakthul) as the survival stage
  const drakthulLevel = LEVELS[5] || LEVELS[4];

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(140,20,30,0.4),rgba(5,2,8,0.98))] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-4 w-full max-w-5xl mx-auto border-b border-rose-950/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-black text-rose-300">
              GRIETAS DEL CAOS (MODO DESAFÍO)
            </h1>
            <span className="text-xs text-rose-400 font-mono">
              La Furia Infinita de DRAKTHUL · Supervivencia Pura
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-rose-900/60 rounded-lg text-xs font-mono text-amber-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{scrap} Fragmentos</span>
        </div>
      </header>

      {/* Main card */}
      <main className="relative z-10 w-full max-w-5xl mx-auto my-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Drakthul portrait */}
        <div className="md:col-span-5 rounded-2xl overflow-hidden border-2 border-rose-600/50 bg-slate-900 shadow-2xl shadow-rose-950/60">
          <img
            src="/src/assets/images/drakthul_destructor_1794249748263.jpg"
            alt="Drakthul El Destructor Multiversal"
            className="w-full aspect-square object-cover"
          />
          <div className="p-4 bg-slate-950 border-t border-rose-900/60">
            <span className="font-cinzel text-lg font-bold text-rose-300 block">
              DRAKTHUL
            </span>
            <span className="text-xs font-mono text-slate-400">
              "Donde otros crean, yo destruyo. Donde otros equilibran, yo domino el caos."
            </span>
          </div>
        </div>

        {/* Right Info and Launch */}
        <div className="md:col-span-7 space-y-5 p-6 rounded-2xl bg-slate-900/80 border border-rose-900/40">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest">
              <Skull className="w-4 h-4" />
              <span>Prueba de Habilidad Definitiva para Zeynthar</span>
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1">
              EL ABISMO DE LAS SOMBRAS INCESANTES
            </h2>
          </div>

          <p className="text-sm text-slate-300 font-light leading-relaxed">
            Drakthul ha abierto una mega-fisura que desgarra la creación. Oleadas continuas de <strong className="text-rose-400">Heraldos del Vacío</strong>, <strong className="text-purple-400">Tejedores de Caos</strong> y <strong className="text-sky-400">Bestias de Cronostasis</strong> asedian el reino sin tregua.
          </p>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Recompensa de Fragmentos:</span>
              <span className="text-amber-400 font-bold">+200% por cada 10 oleadas</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Aparición de Drakthul:</span>
              <span className="text-rose-400 font-bold">Fase de Caos al llegar a 60 bajas</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Habilidades recomendadas:</span>
              <span className="text-sky-300 font-bold">Chrono-Stasis & Matriz Cósmica [E]</span>
            </div>
          </div>

          <button
            onClick={() => onLaunchChallenge(drakthulLevel)}
            className="w-full py-4 bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white font-bold rounded-xl shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
          >
            <Flame className="w-5 h-5 text-yellow-300" />
            <span>DESAFIAR EL VÓRTICE DE DRAKTHUL</span>
          </button>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-5xl mx-auto pt-4 border-t border-rose-950/80 text-center text-xs text-slate-500 font-mono">
        Solo la perfecta combinación de Magia y Tecnología sobrevivirá al Caos Absoluto
      </footer>
    </div>
  );
};
