import React, { useEffect } from 'react';
import { Volume2, VolumeX, BookOpen, Shield, Zap, Sparkles, Orbit, Skull, Cloud, Eye } from 'lucide-react';
import { GameMode } from '../types/game';

interface TitleScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenCodex: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  scrap: number;
  onOpenCloudSync?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onSelectMode,
  onOpenCodex,
  isMuted,
  onToggleMute,
  scrap,
  onOpenCloudSync,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        onSelectMode('CAMPAIGN');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectMode]);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 overflow-y-auto select-none">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(140,40,220,0.3),rgba(10,5,25,0.95))] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Bar Contract (Brand, Nav links, Action/Mute) */}
      <header className="relative z-10 flex items-center justify-between gap-6 w-full max-w-6xl mx-auto border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-sky-200 to-amber-300">
            MIDNIGHT DIMENSIONS
          </span>
          <span className="hidden md:inline text-xs text-purple-400 font-mono tracking-widest uppercase">
            · La Ruptura Multiversal
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectMode('ARCHITECT_NEXUS')}
            className="flex items-center gap-1.5 hover:text-sky-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Orbit className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Nexo del Arquitecto</span>
          </button>
          <button
            onClick={onOpenCodex}
            className="flex items-center gap-1.5 hover:text-purple-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Códice Cósmico</span>
          </button>
          <button
            onClick={onOpenCodex}
            className="flex items-center gap-1.5 hover:text-sky-300 transition-colors whitespace-nowrap cursor-pointer text-sky-400"
            title="Ver Galería de Arte Conceptual y Entornos UE5"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Arte AAA UE5</span>
          </button>
          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer text-emerald-400"
              title="Sincronizar y guardar en Google Drive"
            >
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-amber-300">
            <span>⚡ {scrap} Fragmentos</span>
          </div>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </header>

      {/* Hero Visual Showcase: Zeynthar (Protagonist) vs Drakthul (Nemesis) */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-6 space-y-8">
        {/* Title Lockup */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-950/40 px-3 py-1 rounded-full border border-sky-800/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>El Arquitecto Multiversal contra el Destructor del Vacío</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
            ZEYNTHAR <span className="text-purple-400">VS</span> DRAKTHUL
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
            Encarna a <strong className="text-sky-300">Zeynthar</strong> y desata la Magia Primordial y la Tecnología Omnidimensional para cerrar las Grietas en <em>Nueva York, Londres, China y Venezuela</em>, recuperar las Reliquias Místicas y frenar la aniquilación de <strong className="text-rose-400">Drakthul</strong>.
          </p>
        </div>

        {/* Dual Portrait Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Protagonist: ZEYNTHAR */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-slate-900 shadow-xl group">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src="/public/assets/aistudio/Zeynthar__Arquitecto_del_Multiverso__1__23b53477.png"
                alt="Zeynthar, El Arquitecto Multiversal"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/70 border-t border-purple-900/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-lg font-bold text-amber-200">ZEYNTHAR</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                  Protagonista Jugable
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Maestro de la Magia Primordial, Control Temporal y Escudos de Matriz Cósmica.
              </p>
            </div>
          </div>

          {/* Nemesis: DRAKTHUL */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-rose-500/40 bg-slate-900 shadow-xl group">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src="/src/assets/images/drakthul_destructor_1794249748263.jpg"
                alt="Drakthul, El Destructor Multiversal"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/70 border-t border-rose-900/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-lg font-bold text-rose-300">DRAKTHUL</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                  El Némesis Definitivo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Caos Absoluto, Magia de Aniquilación y Señor de las Sombras Pre-Creación.
              </p>
            </div>
          </div>
        </div>

        {/* AAA Unreal Engine 5 Environment Showcase Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-sky-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/60 p-4 max-w-4xl mx-auto shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-56 aspect-video rounded-xl overflow-hidden border border-sky-400/50 shrink-0 group">
              <img
                src="/src/assets/images/multiverse_landscape_1794252819451.jpg"
                alt="Paisaje Multiversal Destrozado UE5"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-1.5 left-1.5 bg-sky-950/90 text-[9px] font-mono font-bold text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/60">
                UE5 NANITE / LUMEN
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  Diseño de Entornos & Niveles
                </span>
                <span className="text-xs sm:text-sm font-cinzel font-bold text-white">
                  Paisaje Multiversal Destrozado
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Ruinas arcanas de fantasía ancestral colisionando con megaestructuras holográficas, monolitos de obsidiana y corrupción volcánica púrpura en iluminación global en tiempo real.
              </p>
            </div>

            <button
              onClick={onOpenCodex}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-sky-900/60 hover:bg-sky-800 border border-sky-500/70 text-sky-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-sky-950"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Ver Galería AAA</span>
            </button>
          </div>
        </div>

        {/* 3 Game Modes Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
          {/* Mode 1: Campaña Narrativa */}
          <button
            onClick={() => onSelectMode('CAMPAIGN')}
            className="p-5 rounded-xl bg-gradient-to-b from-purple-900/40 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 hover:from-purple-900/60 transition-all text-left group cursor-pointer shadow-lg hover:shadow-purple-950/50"
          >
            <div className="flex items-center gap-2 mb-2 text-purple-300 font-bold font-cinzel text-base">
              <Zap className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>1. Campaña Narrativa</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Viaja por Nueva York, Londres, China y Venezuela para cerrar las grietas y desenterrar las Reliquias Reales.
            </p>
            <span className="mt-3 inline-block text-[11px] font-mono text-purple-400 font-semibold group-hover:text-purple-300">
              Iniciar Incursión →
            </span>
          </button>

          {/* Mode 2: El Nexo del Arquitecto */}
          <button
            onClick={() => onSelectMode('ARCHITECT_NEXUS')}
            className="p-5 rounded-xl bg-gradient-to-b from-sky-900/40 to-slate-900/90 border border-sky-500/40 hover:border-sky-400 hover:from-sky-900/60 transition-all text-left group cursor-pointer shadow-lg hover:shadow-sky-950/50"
          >
            <div className="flex items-center gap-2 mb-2 text-sky-300 font-bold font-cinzel text-base">
              <Orbit className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>2. Nexo del Arquitecto</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Observatorio base. Mejora las 6 Runas de poder, desbloquea Armaduras Estelares y planifica tu salto.
            </p>
            <span className="mt-3 inline-block text-[11px] font-mono text-sky-400 font-semibold group-hover:text-sky-300">
              Entrar al Santuario →
            </span>
          </button>

          {/* Mode 3: Grietas del Caos */}
          <button
            onClick={() => onSelectMode('CHAOS_RIFTS')}
            className="p-5 rounded-xl bg-gradient-to-b from-rose-900/40 to-slate-900/90 border border-rose-500/40 hover:border-rose-400 hover:from-rose-900/60 transition-all text-left group cursor-pointer shadow-lg hover:shadow-rose-950/50"
          >
            <div className="flex items-center gap-2 mb-2 text-rose-300 font-bold font-cinzel text-base">
              <Skull className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>3. Grietas del Caos</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modo desafío de supervivencia contra las hordas implacables enviadas por Drakthul.
            </p>
            <span className="mt-3 inline-block text-[11px] font-mono text-rose-400 font-semibold group-hover:text-rose-300">
              Desafiar Hordas →
            </span>
          </button>
        </div>
      </main>

      {/* Flat Control Hints Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        <span>WASD Moverse</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Click Izq Disparo Arcano/Cuántico</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Espacio / Click Der Salto de Portal</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>E Chrono-Stasis & Matriz Cósmica</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Q Reescritura de la Realidad</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>F Desenterrar Reliquia</span>
      </footer>
    </div>
  );
};
