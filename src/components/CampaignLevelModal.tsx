import React, { useState } from 'react';
import { ArrowLeft, Play, Shield, Zap, Sparkles, AlertTriangle, Compass, Heart, Skull } from 'lucide-react';
import { LevelConfig } from '../types/game';
import { LEVELS } from '../data/loreAndLevels';
import { soundManager } from '../audio/soundManager';

interface CampaignLevelModalProps {
  unlockedLevelId: number;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
  scrap: number;
}

export const CampaignLevelModal: React.FC<CampaignLevelModalProps> = ({
  unlockedLevelId,
  onSelectLevel,
  onBack,
  scrap,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(
    LEVELS.find((l) => l.id === Math.min(unlockedLevelId, LEVELS.length)) || LEVELS[0]
  );

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(70,30,130,0.3),rgba(4,4,12,0.98))] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-4 w-full max-w-6xl mx-auto border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-black text-white">
              MAPA DE LA RUPTURA MULTIVERSAL
            </h1>
            <span className="text-xs text-purple-400 font-mono">
              Incursiones de la Facción Clandestina · Zeynthar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-amber-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{scrap} Fragmentos</span>
        </div>
      </header>

      {/* Main Grid: Level Ladder on left, Mission Briefing on right */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of 6 Levels */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Fisuras Detectadas en la Tierra y el Cosmos
          </span>

          <div className="space-y-2.5">
            {LEVELS.map((level) => {
              const isUnlocked = level.id <= unlockedLevelId;
              const isSelected = selectedLevel.id === level.id;
              const isFinalDrakthul = level.id === 6;

              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (isUnlocked) {
                      soundManager.playCollect();
                      setSelectedLevel(level);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? isFinalDrakthul
                        ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-950/50'
                        : 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-950/50'
                      : isUnlocked
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/30 border-slate-900/60 opacity-45 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: isUnlocked ? `${level.accentColor}25` : '#1e293b',
                        color: isUnlocked ? level.accentColor : '#64748b',
                      }}
                    >
                      {level.id}
                    </div>
                    <div>
                      <span className="font-cinzel text-sm font-bold text-white block">
                        {level.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {level.city}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isFinalDrakthul ? (
                      <span className="text-[10px] font-mono text-rose-400 font-bold block">
                        DRAKTHUL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Jefe: {level.bossName}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-amber-300">
                      {isUnlocked ? 'Despejada / Activa' : 'Bloqueada'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mission Briefing Card */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Nivel {selectedLevel.id} · {selectedLevel.realmName}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedLevel.city}
                </span>
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white mt-1">
                {selectedLevel.name}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 block font-mono">Objetivo de Bajas</span>
              <span className="text-lg font-bold text-amber-300 font-mono">
                {selectedLevel.targetKills} Criaturas
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {selectedLevel.description}
          </p>

          {/* Phenomenon & Citizen Crisis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Efecto en el Entorno</span>
              </div>
              <p className="text-xs text-slate-300 font-light leading-snug">
                {selectedLevel.riftPhenomenon.environmentEffect}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                <Compass className="w-4 h-4" />
                <span>Impacto en los Ciudadanos</span>
              </div>
              <p className="text-xs text-slate-300 font-light leading-snug">
                {selectedLevel.riftPhenomenon.citizenImpact}
              </p>
            </div>
          </div>

          {/* Hidden Mystic Relic Card */}
          <div className="p-4 bg-gradient-to-r from-amber-950/30 to-purple-950/30 border border-amber-500/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold text-amber-200">
                  RELIQUIA MÍSTICA REAL OCULTA EN EL MAPA
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 uppercase">
                Usa el Radar [F]
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {selectedLevel.hiddenRelic.name}
              </span>
              <p className="text-xs text-slate-300 font-light mt-0.5 leading-relaxed">
                {selectedLevel.hiddenRelic.realWorldHistory}
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 bg-slate-950/60 p-2 rounded border border-slate-800">
              {selectedLevel.hiddenRelic.effectDescription}
            </div>
          </div>

          {/* Boss Preview */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase block">
                Guardián de la Grieta
              </span>
              <span className="font-cinzel text-sm font-bold text-white block">
                {selectedLevel.bossName} — {selectedLevel.bossTitle}
              </span>
            </div>
            <span className="text-xs font-mono text-rose-400 font-bold">
              HP: {selectedLevel.bossHp}
            </span>
          </div>

          {/* Launch CTA */}
          <div className="pt-2">
            <button
              onClick={() => onSelectLevel(selectedLevel)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold rounded-xl shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>SALTO DIMENSIONAL A {selectedLevel.city.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        Purifica los pilares de la grieta · Desentierra la Reliquia Oculta · Derrota al Guardián
      </footer>
    </div>
  );
};
