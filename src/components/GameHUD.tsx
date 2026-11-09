import React from 'react';
import { Shield, Zap, Pause, Volume2, VolumeX, Sparkles, AlertTriangle, Compass, Clock, Flame, Heart, Cloud } from 'lucide-react';
import { StarArmor } from '../types/game';

interface GameHUDProps {
  stats: {
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    ultimateCharge: number;
    specialCooldownTimer: number;
    specialCooldownMax: number;
    specialActiveTimer: number;
    potionCooldownTimer: number;
    potionCooldownMax: number;
    companionId?: string;
    companionName?: string;
    companionCooldownTimer?: number;
    companionCooldownMax?: number;
    companionActiveTimer?: number;
    companionAbilityName?: string;
    kills: number;
    targetKills: number;
    scrap: number;
    riftPillarsLeft: number;
    riftPillarsTotal: number;
    bossActive: boolean;
    bossHp: number;
    bossMaxHp: number;
    bossName: string;
    combo: number;
    relicDistance: number;
    relicFound: boolean;
    relicName: string;
    hazardAlert: string | null;
  };
  activeArmor: StarArmor;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  cityName: string;
  onUsePotion?: () => void;
  onUseCompanion?: () => void;
  onOpenCloudSync?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  activeArmor,
  isMuted,
  onToggleMute,
  onPause,
  cityName,
  onUsePotion,
  onUseCompanion,
  onOpenCloudSync,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (stats.shield / stats.maxShield) * 100));
  const ultimatePercent = Math.max(0, Math.min(100, stats.ultimateCharge));
  const isCompanionReady = !stats.companionCooldownTimer || stats.companionCooldownTimer <= 0;
  const bossHpPercent = stats.bossActive && stats.bossMaxHp > 0
    ? Math.max(0, Math.min(100, (stats.bossHp / stats.bossMaxHp) * 100))
    : 0;

  const isRelicNear = stats.relicDistance < 250 && !stats.relicFound;
  const isPotionReady = stats.potionCooldownTimer <= 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden p-3 sm:p-5 flex flex-col justify-between">
      {/* Top Bar Status: Radar & Objectives */}
      <div className="flex items-start justify-between gap-4 w-full">
        {/* Top-Left: Zeynthar Badge & City */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/90 border border-purple-900/60 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-400/80 shrink-0 shadow-md">
            <img
              src="/public/assets/aistudio/Zeynthar__Arquitecto_del_Multiverso__1__23b53477.png"
              alt="Zeynthar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold text-amber-200">ZEYNTHAR</span>
              <span className="text-[10px] font-mono text-purple-300">· {cityName}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">
              {activeArmor.name}
            </span>
          </div>
        </div>

        {/* Top-Center: Gothic Boss Bar (Diablo 3 Dragon Crest) */}
        {stats.bossActive && (
          <div className="pointer-events-auto flex flex-col items-center gap-1 w-full max-w-md sm:max-w-lg bg-gradient-to-b from-slate-950/95 to-slate-900/90 border-2 border-rose-800/80 px-5 py-2.5 rounded-2xl shadow-2xl shadow-rose-950/70 backdrop-blur-md animate-fadeIn">
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <div className="flex items-center gap-2 text-rose-300 font-bold font-cinzel tracking-wider text-sm">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{stats.bossName}</span>
              </div>
              <span className="text-amber-300 font-bold tabular-nums">
                {stats.bossHp} / {stats.bossMaxHp} HP
              </span>
            </div>

            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-rose-900/80 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 transition-all duration-150 rounded-full shadow-inner"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Top-Right: Relic Radar, Scrap, Mute, Pause */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Radar */}
          <div
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 shadow-xl backdrop-blur-md ${
              stats.relicFound
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                : isRelicNear
                ? 'bg-amber-950/95 border-amber-400 text-amber-200 animate-pulse'
                : 'bg-slate-950/85 border-slate-800 text-slate-300'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${isRelicNear ? 'text-amber-400' : 'text-purple-400'}`} />
            {stats.relicFound ? (
              <span>✓ {stats.relicName} Asegurada</span>
            ) : (
              <span>
                Radar Místico: {stats.relicDistance}m {isRelicNear && '· [F] Desenterrar'}
              </span>
            )}
          </div>

          {/* Status cluster */}
          <div className="flex items-center gap-2.5 bg-slate-950/90 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
            <div className="flex items-center gap-1 text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Pilares: {stats.riftPillarsTotal - stats.riftPillarsLeft}/{stats.riftPillarsTotal}
              </span>
            </div>

            <span className="text-slate-700">·</span>

            <div className="text-amber-300 font-semibold tabular-nums">
              Bajas: {stats.kills}/{stats.targetKills}
            </div>

            <span className="text-slate-700">·</span>

            <div className="flex items-center gap-1 text-yellow-300 font-bold tabular-nums">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>{stats.scrap}</span>
            </div>

            <span className="text-slate-700">·</span>

            <button
              onClick={onToggleMute}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            </button>
            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                className="p-1 rounded text-sky-400 hover:text-sky-200 transition-colors cursor-pointer"
                title="Google Drive: Guardar y Sincronizar Progreso"
              >
                <Cloud className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onPause}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Pausar juego (Esc)"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Alert Banner */}
      {stats.hazardAlert && (
        <div className="self-center pointer-events-none px-5 py-2 bg-rose-950/90 border border-rose-600 text-rose-100 rounded-full text-xs font-mono tracking-wide shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Fisura Activa: {stats.hazardAlert}</span>
        </div>
      )}

      {/* DIABLO 3 AUTHENTIC ACTION BAR & DUAL ORBS */}
      <div className="self-center pointer-events-auto flex items-end justify-center gap-2 sm:gap-4 pb-1">
        {/* LEFT ORB: Blood Health Globe (Diablo 3 Vida) */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-stone-800 bg-stone-950 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
          {/* Blood Liquid fill */}
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-950 via-red-600 to-rose-500 transition-all duration-200"
            style={{ height: `${hpPercent}%` }}
          />
          {/* Glass specular highlights */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_15%,rgba(255,255,255,0.4),transparent)] pointer-events-none" />
          <div className="absolute inset-0 rounded-full border-2 border-stone-900/60 pointer-events-none" />

          {/* HP Readout */}
          <div className="relative z-10 text-center font-mono">
            <span className="font-bold text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] block">
              {stats.hp}
            </span>
            <span className="text-[9px] text-red-200 block drop-shadow">
              / {stats.maxHp} HP
            </span>
          </div>

          {/* Demon Gargoyle Ornate Bracket Border */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-600/30 pointer-events-none" />
        </div>

        {/* Health Potion Flask [1] */}
        <button
          onClick={onUsePotion}
          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer mb-2 shrink-0 ${
            isPotionReady
              ? 'bg-red-950 border-red-500 text-rose-300 hover:bg-red-900 shadow-lg shadow-red-950'
              : 'bg-stone-950 border-stone-800 text-stone-500 cursor-not-allowed'
          }`}
          title="Poción de Salud (Tecla 1)"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-white">
            1
          </span>
          {stats.potionCooldownTimer > 0 && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white font-bold bg-black/60 rounded-xl">
              {Math.ceil(stats.potionCooldownTimer)}s
            </span>
          )}
        </button>

        {/* Guardian Companion Invocation Flask [2] */}
        <button
          onClick={onUseCompanion}
          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer mb-2 shrink-0 ${
            isCompanionReady
              ? 'bg-purple-950 border-purple-400 text-purple-200 hover:bg-purple-900 shadow-lg shadow-purple-950'
              : 'bg-stone-950 border-stone-800 text-stone-500 cursor-not-allowed'
          }`}
          title={`Invocación de Guardián: ${stats.companionName || 'Guardián Cósmico'} - ${stats.companionAbilityName || 'Poder Primordial'} (Tecla 2)`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-[7px] font-mono font-bold uppercase truncate max-w-[34px] text-purple-200">
            {stats.companionName?.slice(0, 4) || 'GUAR'}
          </span>
          <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-amber-300">
            2
          </span>
          {stats.companionCooldownTimer && stats.companionCooldownTimer > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white font-bold bg-black/75 rounded-xl">
              {Math.ceil(stats.companionCooldownTimer)}s
            </span>
          ) : null}
        </button>

        {/* CENTER GOTHIC SKILL ACTION BAR */}
        <div className="flex flex-col items-center gap-1.5 mb-1">
          {/* Cosmic Matrix Shield Bar */}
          <div className="flex items-center gap-1.5 w-full max-w-[280px] sm:max-w-[320px] px-1">
            <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-150 rounded-full"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-sky-300 tabular-nums">
              {stats.shield}
            </span>
          </div>

          {/* Skill Buttons Container */}
          <div className="flex items-center gap-2 p-1.5 bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-600/40 rounded-2xl shadow-2xl">
            {/* Skill 1: Primary Blast */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 border border-amber-500/50 flex flex-col items-center justify-center shadow-inner group">
              <Sparkles className="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">CLICK</span>
            </div>

            {/* Skill 2: Portal Dash */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 border border-sky-500/50 flex flex-col items-center justify-center shadow-inner group">
              <Shield className="w-5 h-5 text-sky-300 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-mono text-sky-300 font-bold mt-0.5">ESPACIO</span>
            </div>

            {/* Skill 3: Chrono-Stasis [E] */}
            <div
              className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center shadow-inner transition-all ${
                stats.specialCooldownTimer > 0
                  ? 'bg-stone-950 border-stone-800 text-stone-500'
                  : 'bg-purple-950 border-purple-400 text-purple-200 shadow-md shadow-purple-900'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[9px] font-mono font-bold mt-0.5">E</span>
              {stats.specialCooldownTimer > 0 && (
                <div className="absolute inset-0 bg-black/75 rounded-xl flex items-center justify-center font-mono font-bold text-xs text-white">
                  {stats.specialCooldownTimer}s
                </div>
              )}
            </div>

            {/* Skill 4: Reality Rewrite [Q] */}
            <div
              className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex flex-col items-center justify-center shadow-inner transition-all ${
                stats.ultimateCharge >= 100
                  ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/40 animate-pulse'
                  : 'bg-stone-950 border-stone-800 text-stone-500'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-[9px] font-mono font-bold mt-0.5">Q</span>
              {stats.ultimateCharge < 100 && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center font-mono text-[10px] text-slate-400">
                  {stats.ultimateCharge}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT ORB: Arcane Energy / Mana Globe (Diablo 3 Esencia Primordial) */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-stone-800 bg-stone-950 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
          {/* Swirling Arcane/Mana Liquid */}
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950 via-purple-600 to-sky-400 transition-all duration-200"
            style={{ height: `${ultimatePercent}%` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_15%,rgba(255,255,255,0.4),transparent)] pointer-events-none" />
          <div className="absolute inset-0 rounded-full border-2 border-stone-900/60 pointer-events-none" />

          {/* Energy Readout */}
          <div className="relative z-10 text-center font-mono">
            <span className="font-bold text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] block">
              {stats.ultimateCharge}%
            </span>
            <span className="text-[9px] text-purple-200 block drop-shadow">
              ESENCIA
            </span>
          </div>

          {/* Angelic Ornate Seraph Bracket Border */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-600/30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
