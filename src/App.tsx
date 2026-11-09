import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameMode, LevelConfig, Upgrade, StarArmor, MysticRelic, CosmicGuardian } from './types/game';
import { LEVELS, INITIAL_UPGRADES, STAR_ARMORS, COSMIC_GUARDIANS } from './data/loreAndLevels';
import { GameEngine } from './game/GameEngine';
import { soundManager } from './audio/soundManager';
import { TitleScreen } from './components/TitleScreen';
import { ArchitectNexus } from './components/ArchitectNexus';
import { CampaignLevelModal } from './components/CampaignLevelModal';
import { ChaosRiftsModal } from './components/ChaosRiftsModal';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { CodexModal } from './components/CodexModal';
import { MobileControls } from './components/MobileControls';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { GameSaveData } from './services/googleDriveService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [unlockedLevelId, setUnlockedLevelId] = useState<number>(() => {
    const saved = localStorage.getItem('md_unlocked_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [scrap, setScrap] = useState<number>(() => {
    const saved = localStorage.getItem('md_scrap');
    return saved ? parseInt(saved, 10) : 60;
  });

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('md_upgrades');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_UPGRADES;
  });

  const [unlockedArmors, setUnlockedArmors] = useState<string[]>(() => {
    const saved = localStorage.getItem('md_armors');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return ['cosmic_dawn'];
  });

  const [activeArmor, setActiveArmor] = useState<StarArmor>(() => {
    return STAR_ARMORS[0];
  });

  const [selectedGuardian, setSelectedGuardian] = useState<CosmicGuardian>(() => {
    const saved = localStorage.getItem('md_guardian_id');
    if (saved) {
      const found = COSMIC_GUARDIANS.find((g) => g.id === saved);
      if (found) return found;
    }
    return COSMIC_GUARDIANS[0];
  });

  const [relicsFound, setRelicsFound] = useState<MysticRelic[]>(() => {
    const saved = localStorage.getItem('md_relics');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCodex, setShowCodex] = useState<boolean>(false);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState<boolean>(false);

  // HUD stats pushed by the decoupled Canvas Game Engine
  const [hudStats, setHudStats] = useState({
    hp: 160,
    maxHp: 160,
    shield: 90,
    maxShield: 90,
    ultimateCharge: 0,
    specialCooldownTimer: 0,
    specialCooldownMax: 6.5,
    specialActiveTimer: 0,
    potionCooldownTimer: 0,
    potionCooldownMax: 14.0,
    companionId: selectedGuardian.id as string,
    companionName: selectedGuardian.name,
    companionCooldownTimer: 0,
    companionCooldownMax: selectedGuardian.cooldown,
    companionActiveTimer: 0,
    companionAbilityName: selectedGuardian.abilityName,
    kills: 0,
    targetKills: 26,
    scrap: 0,
    riftPillarsLeft: 2,
    riftPillarsTotal: 2,
    bossActive: false,
    bossHp: 0,
    bossMaxHp: 1,
    bossName: '',
    combo: 0,
    relicDistance: 999,
    relicFound: false,
    relicName: '',
    hazardAlert: null as string | null,
  });

  const [levelScrapEarned, setLevelScrapEarned] = useState<number>(0);

  // Canvas & Engine reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('md_unlocked_level', unlockedLevelId.toString());
  }, [unlockedLevelId]);

  useEffect(() => {
    localStorage.setItem('md_scrap', scrap.toString());
  }, [scrap]);

  useEffect(() => {
    localStorage.setItem('md_upgrades', JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem('md_armors', JSON.stringify(unlockedArmors));
  }, [unlockedArmors]);

  useEffect(() => {
    localStorage.setItem('md_relics', JSON.stringify(relicsFound));
  }, [relicsFound]);

  useEffect(() => {
    localStorage.setItem('md_guardian_id', selectedGuardian.id);
  }, [selectedGuardian]);

  // Global pause shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          setGameState('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Launch Gameplay
  const startGame = useCallback((level: LevelConfig) => {
    setCurrentLevel(level);
    setGameState('PLAYING');

    // Slight delay to allow DOM canvas to mount
    setTimeout(() => {
      if (!canvasRef.current) return;
      if (engineRef.current) {
        engineRef.current.destroy();
      }

      engineRef.current = new GameEngine(
        canvasRef.current,
        level,
        upgrades,
        activeArmor,
        {
          onStatsUpdate: (stats) => {
            setHudStats(stats);
          },
          onRelicFound: (relic) => {
            setRelicsFound((prev) => {
              if (prev.some((r) => r.id === relic.id)) return prev;
              return [...prev, relic];
            });
          },
          onLevelVictory: (clearedLevel, earnedScrap) => {
            setLevelScrapEarned(earnedScrap);
            setScrap((prev) => prev + earnedScrap + 50);
            if (clearedLevel.id >= unlockedLevelId) {
              setUnlockedLevelId(clearedLevel.id + 1);
            }
            setGameState('LEVEL_VICTORY');
          },
          onGameOver: () => {
            setGameState('GAME_OVER');
          },
        },
        selectedGuardian
      );

      engineRef.current.start();
    }, 40);
  }, [upgrades, activeArmor, unlockedLevelId, selectedGuardian]);

  // Clean up engine on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'CAMPAIGN') {
      setGameState('LEVEL_SELECT');
    } else if (mode === 'ARCHITECT_NEXUS') {
      setGameState('ARCHITECT_NEXUS');
    } else if (mode === 'CHAOS_RIFTS') {
      // Launch survival challenge
      const drakthulStage = LEVELS[5] || LEVELS[4];
      startGame(drakthulStage);
    }
  };

  const handleUpgradeRune = (upgradeId: string) => {
    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id === upgradeId && u.level < u.maxLevel && scrap >= u.cost) {
          setScrap((s) => s - u.cost);
          return { ...u, level: u.level + 1, cost: Math.round(u.cost * 1.45) };
        }
        return u;
      })
    );
  };

  const handleUnlockArmor = (armor: StarArmor) => {
    if (scrap >= armor.cost && !unlockedArmors.includes(armor.id)) {
      setScrap((s) => s - armor.cost);
      setUnlockedArmors((prev) => [...prev, armor.id]);
      setActiveArmor(armor);
    }
  };

  const handleRestoreSave = (save: GameSaveData) => {
    if (save.unlockedLevelId) setUnlockedLevelId(save.unlockedLevelId);
    if (typeof save.scrap === 'number') setScrap(save.scrap);
    if (save.upgrades && Array.isArray(save.upgrades)) setUpgrades(save.upgrades);
    if (save.unlockedArmors && Array.isArray(save.unlockedArmors)) setUnlockedArmors(save.unlockedArmors);
    if (save.activeArmorId) {
      const armor = STAR_ARMORS.find((a) => a.id === save.activeArmorId);
      if (armor) setActiveArmor(armor);
    }
    if (save.selectedGuardianId) {
      const guardian = COSMIC_GUARDIANS.find((g) => g.id === save.selectedGuardianId);
      if (guardian) setSelectedGuardian(guardian);
    }
    if (save.relicsFound && Array.isArray(save.relicsFound)) setRelicsFound(save.relicsFound);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      {/* 1. TITLE SCREEN */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          onSelectMode={handleSelectMode}
          onOpenCodex={() => setShowCodex(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          scrap={scrap}
          onOpenCloudSync={() => setShowGoogleDriveModal(true)}
        />
      )}

      {/* 2. THE ARCHITECT'S NEXUS (Observatory Base) */}
      {gameState === 'ARCHITECT_NEXUS' && (
        <ArchitectNexus
          scrap={scrap}
          upgrades={upgrades}
          activeArmor={activeArmor}
          unlockedArmors={unlockedArmors}
          relicsFound={relicsFound}
          selectedGuardian={selectedGuardian}
          onSelectGuardian={(guardian) => setSelectedGuardian(guardian)}
          onUpgradeRune={handleUpgradeRune}
          onSelectArmor={(armor) => setActiveArmor(armor)}
          onUnlockArmor={handleUnlockArmor}
          onBackToTitle={() => setGameState('TITLE_MENU')}
          onLaunchCampaign={() => setGameState('LEVEL_SELECT')}
          onLaunchChaosRifts={() => {
            const drakthulStage = LEVELS[5] || LEVELS[4];
            startGame(drakthulStage);
          }}
          onOpenCloudSync={() => setShowGoogleDriveModal(true)}
        />
      )}

      {/* 3. CAMPAIGN LEVEL SELECTOR */}
      {gameState === 'LEVEL_SELECT' && (
        <CampaignLevelModal
          unlockedLevelId={unlockedLevelId}
          onSelectLevel={(lvl) => startGame(lvl)}
          onBack={() => setGameState('TITLE_MENU')}
          scrap={scrap}
        />
      )}

      {/* 4. ACTIVE GAMEPLAY CANVAS VIEWPORT */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full block bg-black cursor-crosshair"
          />

          {/* Low-Occlusion HUD Overlay with Diablo 3 Dual Orbs */}
          <GameHUD
            stats={hudStats}
            activeArmor={activeArmor}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => {
              engineRef.current?.pause();
              setGameState('PAUSED');
            }}
            cityName={currentLevel.city}
            onUsePotion={() => engineRef.current?.triggerHealthPotion()}
            onUseCompanion={() => engineRef.current?.triggerCompanionAbility()}
            onOpenCloudSync={() => setShowGoogleDriveModal(true)}
          />

          {/* Mobile On-Screen Virtual Controls */}
          <MobileControls
            onMove={(vx, vy) => engineRef.current?.setVirtualMove(vx, vy)}
            onAim={(dx, dy, isShooting) => engineRef.current?.setVirtualAim(dx, dy, isShooting)}
            onDash={() => engineRef.current?.triggerPortalDash()}
            onSpecial={() => engineRef.current?.triggerChronoMatrix()}
            onUltimate={() => engineRef.current?.triggerRealityRewrite()}
            specialReady={hudStats.specialCooldownTimer <= 0}
            ultimateReady={hudStats.ultimateCharge >= 100}
          />
        </div>
      )}

      {/* 5. PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            engineRef.current?.resume();
            setGameState('PLAYING');
          }}
          onRestart={() => startGame(currentLevel)}
          onExitToTitle={() => {
            engineRef.current?.stop();
            soundManager.stopMusic();
            setGameState('TITLE_MENU');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          levelName={currentLevel.name}
        />
      )}

      {/* 6. LEVEL VICTORY MODAL */}
      {gameState === 'LEVEL_VICTORY' && (
        <VictoryModal
          level={currentLevel}
          scrapEarned={levelScrapEarned}
          onNextLevel={() => {
            const nextLvl = LEVELS.find((l) => l.id === currentLevel.id + 1);
            if (nextLvl) {
              startGame(nextLvl);
            } else {
              setGameState('ARCHITECT_NEXUS');
            }
          }}
          onReturnToNexus={() => setGameState('ARCHITECT_NEXUS')}
          isFinalLevel={currentLevel.id === LEVELS.length}
        />
      )}

      {/* 7. GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          onRetry={() => startGame(currentLevel)}
          onReturnToNexus={() => setGameState('ARCHITECT_NEXUS')}
          levelName={currentLevel.name}
        />
      )}

      {/* 8. CODEX MODAL */}
      {showCodex && <CodexModal onClose={() => setShowCodex(false)} />}

      {/* 9. GOOGLE DRIVE CLOUD SAVE MODAL */}
      <GoogleDriveModal
        isOpen={showGoogleDriveModal}
        onClose={() => setShowGoogleDriveModal(false)}
        currentSaveData={{
          unlockedLevelId,
          scrap,
          upgrades,
          unlockedArmors,
          activeArmor,
          selectedGuardianId: selectedGuardian.id,
          relicsFound,
        }}
        onRestoreSave={handleRestoreSave}
      />
    </div>
  );
}
