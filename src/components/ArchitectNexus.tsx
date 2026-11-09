import React, { useState } from 'react';
import { Sparkles, Cpu, Clock, Compass, Eye, Shield, Orbit, ArrowLeft, Zap, Award, Flame, Heart, Cloud, Users, CheckCircle2 } from 'lucide-react';
import { Upgrade, StarArmor, MysticRelic, CosmicGuardian } from '../types/game';
import { STAR_ARMORS, COSMIC_GUARDIANS } from '../data/loreAndLevels';
import { soundManager } from '../audio/soundManager';

interface ArchitectNexusProps {
  scrap: number;
  upgrades: Upgrade[];
  activeArmor: StarArmor;
  unlockedArmors: string[];
  relicsFound: MysticRelic[];
  selectedGuardian: CosmicGuardian;
  onSelectGuardian: (guardian: CosmicGuardian) => void;
  onUpgradeRune: (upgradeId: string) => void;
  onSelectArmor: (armor: StarArmor) => void;
  onUnlockArmor: (armor: StarArmor) => void;
  onBackToTitle: () => void;
  onLaunchCampaign: () => void;
  onLaunchChaosRifts: () => void;
  onOpenCloudSync?: () => void;
}

export const ArchitectNexus: React.FC<ArchitectNexusProps> = ({
  scrap,
  upgrades,
  activeArmor,
  unlockedArmors,
  relicsFound,
  selectedGuardian,
  onSelectGuardian,
  onUpgradeRune,
  onSelectArmor,
  onUnlockArmor,
  onBackToTitle,
  onLaunchCampaign,
  onLaunchChaosRifts,
  onOpenCloudSync,
}) => {
  const [activeTab, setActiveTab] = useState<'runes' | 'armors' | 'relics' | 'guardians'>('runes');

  const getRuneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'Clock': return <Clock className="w-5 h-5 text-indigo-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-emerald-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-amber-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-rose-400" />;
      default: return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(60,20,120,0.35),rgba(5,5,15,0.98))] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 flex items-center justify-between gap-4 w-full max-w-6xl mx-auto border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTitle}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Volver al Menú"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-purple-300 to-amber-200">
              EL NEXO DEL ARQUITECTO
            </h1>
            <span className="text-xs text-slate-400 font-mono">
              Observatorio Multiversal de Zeynthar
            </span>
          </div>
        </div>

        {/* Currency badge and Fast Launch buttons */}
        <div className="flex items-center gap-3">
          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-sky-500/50 rounded-xl text-sky-300 font-mono text-xs shadow-md transition-colors cursor-pointer"
              title="Guardar o Restaurar partida en Google Drive"
            >
              <Cloud className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-amber-500/40 rounded-xl text-amber-300 font-mono text-sm shadow-inner">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold tabular-nums">{scrap}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Fragmentos</span>
          </div>

          <button
            onClick={onLaunchCampaign}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer whitespace-nowrap"
          >
            Salto a Campaña →
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('runes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'runes'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Runas Primordiales (6)
          </button>
          <button
            onClick={() => setActiveTab('guardians')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guardians'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Guardianes Cósmicos (5)</span>
          </button>
          <button
            onClick={() => setActiveTab('armors')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'armors'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Armaduras Estelares
          </button>
          <button
            onClick={() => setActiveTab('relics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'relics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Relicario de la Tierra ({relicsFound.length}/4)
          </button>
        </div>

        {/* TAB 1: RUNAS PRIMORDIALES */}
        {activeTab === 'runes' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 font-mono">
              Potencia los 6 poderes fundacionales de Zeynthar para contrarrestar la descomposición de Drakthul.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upgrades.map((upgrade) => {
                const isMax = upgrade.level >= upgrade.maxLevel;
                const canAfford = scrap >= upgrade.cost && !isMax;

                return (
                  <div
                    key={upgrade.id}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                            {getRuneIcon(upgrade.icon)}
                          </div>
                          <div>
                            <span className="font-cinzel text-sm font-bold text-slate-100 block">
                              {upgrade.name}
                            </span>
                            <span className="text-[11px] text-purple-400 font-mono block">
                              {upgrade.runaName}
                            </span>
                          </div>
                        </div>

                        {/* Level pips */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: upgrade.maxLevel }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full ${
                                idx < upgrade.level ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {upgrade.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-xs font-mono text-slate-400">
                        {isMax ? 'Runa Máxima' : `Coste: ${upgrade.cost} ⚡`}
                      </span>

                      <button
                        onClick={() => {
                          if (canAfford) {
                            soundManager.playCollect();
                            onUpgradeRune(upgrade.id);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isMax
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isMax ? 'Consagrada' : 'Canalizar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GUARDIANES CÓSMICOS (SANTUARIO) */}
        {activeTab === 'guardians' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-950/40 border border-purple-800/60 p-4 rounded-2xl">
              <div>
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Santuario de los Guardianes Cósmicos</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Elige a tu aliado supremo del Cónclave para luchar al lado de Zeynthar. El guardián atacará automáticamente y desatará su invocación definitiva con la tecla [2].
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/50 text-xs font-mono text-purple-200 shrink-0">
                <span>Activo: </span>
                <span className="font-bold text-amber-300">{selectedGuardian.name}</span>
              </div>
            </div>

            {/* Visual Portrait Banner from uploaded image */}
            <div className="rounded-2xl overflow-hidden border border-purple-500/40 shadow-2xl bg-slate-950 max-h-60 relative group">
              <img
                src="/public/assets/aistudio/Legado_de_los_Guardianes_C_smicos_27f1b7bc.png"
                alt="Legado de los Guardianes Cósmicos"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
                <span className="font-cinzel text-xs text-purple-200 tracking-wider font-bold">
                  El Cónclave de las Realidades: Lysara, X-7, Orion, Esmerald y Nexus frente a Drakthul y Vexira
                </span>
              </div>
            </div>

            {/* Guardians Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {COSMIC_GUARDIANS.filter(g => g.role === 'guardian_ally').map((guardian) => {
                const isSelected = selectedGuardian.id === guardian.id;

                return (
                  <div
                    key={guardian.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-purple-950/70 border-amber-400 shadow-xl shadow-purple-950/80 ring-1 ring-amber-400'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3.5 h-3.5 rounded-full shadow"
                            style={{ backgroundColor: guardian.color }}
                          />
                          <div>
                            <h4 className="font-cinzel text-base font-bold text-white">
                              {guardian.name}
                            </h4>
                            <span className="text-[10px] font-mono text-purple-300">
                              {guardian.title}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-500/40">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" />
                            Acompañante
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {guardian.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-300 font-bold">⚡ {guardian.abilityName}</span>
                          <span className="text-slate-400 text-[10px]">{guardian.cooldown}s CD</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {guardian.abilityDesc}
                        </p>
                      </div>

                      <blockquote className="text-[11px] text-slate-400 italic border-l-2 border-purple-600/70 pl-2.5">
                        {guardian.quote}
                      </blockquote>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playCollect();
                        onSelectGuardian(guardian);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Guardián Activo' : 'Seleccionar como Compañero'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ARMADURAS ESTELARES */}
        {activeTab === 'armors' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 font-mono">
              Selecciona el manto estelar con el que Zeynthar ingresará a las Grietas Dimensionales.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STAR_ARMORS.map((armor) => {
                const isUnlocked = unlockedArmors.includes(armor.id);
                const isEquipped = activeArmor.id === armor.id;
                const canBuy = scrap >= armor.cost && !isUnlocked;

                return (
                  <div
                    key={armor.id}
                    className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isEquipped
                        ? 'bg-slate-900 border-purple-500 shadow-xl shadow-purple-950/40'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center border"
                          style={{
                            backgroundColor: `${armor.color}20`,
                            borderColor: armor.color,
                          }}
                        >
                          <Orbit className="w-5 h-5" style={{ color: armor.color }} />
                        </div>
                        {isEquipped && (
                          <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                            Equipada
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-cinzel text-base font-bold text-white">
                          {armor.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {armor.description}
                        </p>
                      </div>

                      {/* Stats preview */}
                      <div className="space-y-1 text-xs font-mono text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                        <div className="flex justify-between">
                          <span>Salud Adicional:</span>
                          <span className="text-emerald-400">+{armor.bonusHp} HP</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daño de Fase:</span>
                          <span className="text-amber-400">+{armor.bonusDamage} DMG</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Velocidad:</span>
                          <span className="text-sky-400">+{Math.round(armor.bonusSpeed * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      {isEquipped ? (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg cursor-default"
                        >
                          En Uso
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            soundManager.playCollect();
                            onSelectArmor(armor);
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                        >
                          Equipar Armadura
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canBuy) {
                              soundManager.playCollect();
                              onUnlockArmor(armor);
                            }
                          }}
                          disabled={!canBuy}
                          className={`w-full py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            canBuy
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Desbloquear ({armor.cost} ⚡)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RELICARIO DE LA TIERRA */}
        {activeTab === 'relics' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 font-mono">
              Las 4 reliquias místicas reales desenterradas en las Grietas Dimensionales de la Tierra.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tesla */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-amber-300">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white">
                      El Resonador de Tesla (1898)
                    </h4>
                    <span className="text-[11px] text-red-400 font-mono">
                      Nueva York · Manhattan
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-light">
                  Oscilador electromagnético real de Nikola Tesla capaz de sintonizar las vibraciones de la Tierra.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                  ✨ Efecto: +25% daño de plasma resonante y +15% cadencia de fuego.
                </div>
              </div>

              {/* John Dee */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/80 text-indigo-300">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white">
                      El Espejo de Obsidiana de John Dee (1582)
                    </h4>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      Londres · Támesis
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-light">
                  Mítico espejo de obsidiana del astrólogo real de Isabel I conservado en el Museo Británico.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                  ✨ Efecto: -30% daño recibido por impactos dimensionales y disipación de cronostasis.
                </div>
              </div>

              {/* He Shi Bi */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white">
                      El Sello Imperial He Shi Bi (221 a.C.)
                    </h4>
                    <span className="text-[11px] text-amber-400 font-mono">
                      China · Zhangjiajie & Gran Muralla
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-light">
                  El artefacto más venerado de la historia china, encarnación del Mandato del Cielo.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                  ✨ Efecto: +35% probabilidad de golpe crítico y recarga pasiva de definitiva.
                </div>
              </div>

              {/* Piedra Kueka */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white">
                      La Sagrada Piedra Kueka (Pueblo Pemón)
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Venezuela · Gran Sabana & Roraima
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-light">
                  Venerado monolito de jaspe de la mitología Pemón, símbolo de amor y equilibrio cósmico.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
                  ✨ Efecto: +80 Salud Máxima y regeneración continua de +6 HP/segundo.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
        <span>Zeynthar: Protagonista · Magia Primordial & Tecnología Omnidimensional</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchChaosRifts}
            className="px-4 py-2 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-300 rounded-lg transition-colors cursor-pointer"
          >
            Entrar a Grietas del Caos
          </button>
          <button
            onClick={onLaunchCampaign}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-md cursor-pointer"
          >
            Iniciar Campaña por Niveles →
          </button>
        </div>
      </footer>
    </div>
  );
};
