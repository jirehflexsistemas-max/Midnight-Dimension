export type GameMode = 'CAMPAIGN' | 'ARCHITECT_NEXUS' | 'CHAOS_RIFTS';

export type GameState = 
  | 'TITLE_MENU'
  | 'ARCHITECT_NEXUS'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_VICTORY'
  | 'GAME_OVER'
  | 'CODEX';

export interface Hero {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  accentGlow: string;
  description: string;
  weaponName: string;
  specialName: string;
  specialDesc: string;
  specialCooldown: number;
  ultimateName: string;
  ultimateDesc: string;
  baseHp: number;
  baseSpeed: number;
  baseDamage: number;
  fireRate: number;
  color: string;
  quote: string;
}

export interface StarArmor {
  id: string;
  name: string;
  description: string;
  color: string;
  accentGlow: string;
  bonusHp: number;
  bonusDamage: number;
  bonusSpeed: number;
  unlocked: boolean;
  cost: number;
}

export interface MysticRelic {
  id: string;
  name: string;
  city: string;
  realWorldHistory: string;
  effectDescription: string;
  x: number;
  y: number;
  isFound: boolean;
  icon: string;
  passiveBonus: {
    damageBoost?: number;
    damageReduction?: number;
    speedBoost?: number;
    energyRegen?: number;
    critBoost?: number;
    hpBoost?: number;
  };
}

export interface EnvironmentalHazard {
  id: string;
  name: string;
  type: 'plasma_storm' | 'gravity_well' | 'temporal_flux' | 'antimatter_burst';
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  telegraphProgress: number;
  telegraphMax: number;
  hasDetonated: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  city: string;
  realmName: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  themeStyle: 'cyber_hell' | 'london_alchemy' | 'china_celestial' | 'venezuela_roraima' | 'zeynthar_core';
  groundTexture: string;
  targetKills: number;
  riftPillarsCount: number;
  bossName: string;
  bossTitle: string;
  bossHp: number;
  pandorumShardName: string;
  pandorumShardDesc: string;
  hiddenRelic: MysticRelic;
  riftPhenomenon: {
    name: string;
    environmentEffect: string;
    citizenImpact: string;
    riftLore: string;
    hazardType: 'plasma_storm' | 'gravity_well' | 'temporal_flux' | 'antimatter_burst';
  };
  dialogueIntro: { speaker: string; text: string }[];
  dialogueDefeat: { speaker: string; text: string }[];
}

export interface Upgrade {
  id: string;
  name: string;
  runaName: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  icon: string;
  bonus: {
    hp?: number;
    damage?: number;
    speed?: number;
    fireRate?: number;
    critChance?: number;
    shieldRegen?: number;
  };
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface CosmicGuardian {
  id: 'lysara' | 'x7' | 'orion' | 'esmerald' | 'nexus' | 'vexira';
  name: string;
  title: string;
  role: 'guardian_ally' | 'shadow_nemesis';
  description: string;
  color: string;
  accentGlow: string;
  abilityName: string;
  abilityDesc: string;
  cooldown: number;
  quote: string;
}

export interface PlayerEntity extends Entity {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  specialCooldownTimer: number;
  specialCooldownMax: number;
  ultimateCharge: number; // 0 - 100
  facingAngle: number;
  isInvulnerable: number;
  specialActiveTimer: number; // Chrono-stasis & Matrix Shield duration
  comboCount: number;
  comboTimer: number;
  relicScannerRange: number;
  potionCooldownTimer: number;
  potionCooldownMax: number;
  // Physical motion & animation
  walkTimer: number;
  attackAnim: number;
  dashGhostTimer: number;
  dashTrail: Array<{ x: number; y: number; angle: number; alpha: number; color: string }>;
  companionId: string;
  companionCooldown: number;
  companionCooldownMax: number;
  companionActiveTimer: number;
}

export interface EnemyEntity extends Entity {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  enemyType: 'shadow_minion' | 'chaos_caster' | 'void_stalker' | 'drakthul_herald' | 'boss' | 'vexira_boss';
  attackCooldown: number;
  behaviorTimer: number;
  state: 'chasing' | 'telegraphing' | 'attacking' | 'recovering';
  telegraphProgress?: number;
  telegraphDuration?: number;
  targetPos?: Vector2D;
  phase?: number;
  bossAttackPattern?: number;
  specialRingAngle?: number;
  // Physical motion & animation
  walkTimer?: number;
  attackAnim?: number;
  hitFlash?: number;
  knockbackVx?: number;
  knockbackVy?: number;
  mass?: number;
}

export interface ProjectileEntity extends Entity {
  id: string;
  source: 'player' | 'enemy' | 'boss';
  damage: number;
  life: number;
  maxLife: number;
  isHoming?: boolean;
  pierce?: number;
  color: string;
  type?: 'arcane' | 'quantum' | 'chaos_orb' | 'shadow_lance';
}

export interface ParticleEntity extends Entity {
  id: string;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
  glow?: boolean;
  sparkle?: boolean;
  shape?: 'circle' | 'square' | 'line' | 'ring';
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  value: number;
  color: string;
  isCrit: boolean;
  life: number;
  maxLife: number;
}

export interface RiftPillar {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  isPurified: boolean;
  pulseTimer: number;
  city: string;
}

export interface DropItem {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'energy' | 'chrono_scrap' | 'pandorum_shard' | 'mystic_relic';
  value: number;
  life: number;
  relicData?: MysticRelic;
}
