import { LevelConfig, Upgrade, StarArmor, MysticRelic, EnvironmentalHazard, PlayerEntity, EnemyEntity, ProjectileEntity, ParticleEntity, DamageNumber, RiftPillar, DropItem, CosmicGuardian } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { COSMIC_GUARDIANS } from '../data/loreAndLevels';

export interface GroundDecal {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  points: { dx: number; dy: number }[];
}

export interface AmbientEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: {
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
    companionId: string;
    companionName: string;
    companionCooldownTimer: number;
    companionCooldownMax: number;
    companionActiveTimer: number;
    companionAbilityName: string;
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
  }) => void;
  onRelicFound: (relic: MysticRelic) => void;
  onLevelVictory: (level: LevelConfig, scrapEarned: number) => void;
  onGameOver: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;

  private animId: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  private level: LevelConfig;
  private upgrades: Upgrade[];
  private starArmor: StarArmor;
  private callbacks: GameEngineCallbacks;

  // Active Cosmic Guardian Companion (Lysara, X-7, Orion, Esmerald, Nexus)
  private companion: CosmicGuardian;
  private companionX: number = 0;
  private companionY: number = 0;
  private companionVx: number = 0;
  private companionVy: number = 0;
  private companionCooldownTimer: number = 0;
  private companionActiveTimer: number = 0;
  private companionAttackTimer: number = 0;
  private companionFloatTimer: number = 0;

  // Ground Texture & Pattern
  private groundImg: HTMLImageElement | null = null;
  private groundPattern: CanvasPattern | null = null;

  // Arena dimensions
  private arenaWidth: number = 1900;
  private arenaHeight: number = 1200;
  private cameraX: number = 0;
  private cameraY: number = 0;

  // Entities
  private player: PlayerEntity;
  private enemies: EnemyEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private particles: ParticleEntity[] = [];
  private damageNumbers: DamageNumber[] = [];
  private riftPillars: RiftPillar[] = [];
  private dropItems: DropItem[] = [];
  private hazards: EnvironmentalHazard[] = [];
  private groundDecals: GroundDecal[] = [];
  private ambientEmbers: AmbientEmber[] = [];

  // Spawner & Boss
  private killsCount: number = 0;
  private scrapEarned: number = 0;
  private spawnTimer: number = 0;
  private hazardSpawnTimer: number = 0;
  private bossEntity: EnemyEntity | null = null;
  private isBossSpawned: boolean = false;
  private drakthulShadowIncursion: boolean = false;

  // Hidden Relic state
  private hiddenRelic: MysticRelic;
  private isRelicUnearthed: boolean = false;

  // Game Feel & Juiciness
  private screenShake: number = 0;
  private hitstopTimer: number = 0;
  private lastTime: number = 0;

  // Inputs
  private keys: { [key: string]: boolean } = {};
  private mousePos = { x: 0, y: 0 };
  private isMouseDown: boolean = false;
  private fireTimer: number = 0;

  // Zeynthar's Chrono-Stasis
  private chronoStasisTimer: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    level: LevelConfig,
    upgrades: Upgrade[],
    starArmor: StarArmor,
    callbacks: GameEngineCallbacks,
    companion: CosmicGuardian = COSMIC_GUARDIANS[0]
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.level = level;
    this.upgrades = upgrades;
    this.starArmor = starArmor;
    this.callbacks = callbacks;
    this.companion = companion;
    this.hiddenRelic = { ...level.hiddenRelic };

    // Offscreen lighting canvas for Diablo 3 style darkness & dynamic light map
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d')!;

    // Load ground texture
    this.loadGroundTexture(level.groundTexture);

    // Calculate bonuses
    let extraHp = starArmor.bonusHp || 0;
    let extraDamage = starArmor.bonusDamage || 0;
    let extraSpeed = starArmor.bonusSpeed || 0;
    let extraFireRate = 0;

    upgrades.forEach(u => {
      if (u.bonus.hp) extraHp += u.bonus.hp * u.level;
      if (u.bonus.damage) extraDamage += u.bonus.damage * u.level;
      if (u.bonus.speed) extraSpeed += u.bonus.speed * u.level;
      if (u.bonus.fireRate) extraFireRate += u.bonus.fireRate * u.level;
    });

    const maxHp = 160 + extraHp;
    const maxShield = 90;

    // Protagonist Zeynthar
    this.player = {
      x: this.arenaWidth / 2,
      y: this.arenaHeight / 2,
      vx: 0,
      vy: 0,
      radius: 24,
      color: starArmor.color,
      hp: maxHp,
      maxHp: maxHp,
      shield: maxShield,
      maxShield: maxShield,
      speed: 4.8 + extraSpeed,
      specialCooldownTimer: 0,
      specialCooldownMax: 6.5,
      ultimateCharge: 0,
      facingAngle: 0,
      isInvulnerable: 0,
      specialActiveTimer: 0,
      comboCount: 0,
      comboTimer: 0,
      relicScannerRange: 420,
      potionCooldownTimer: 0,
      potionCooldownMax: 14.0,
      walkTimer: 0,
      attackAnim: 0,
      dashGhostTimer: 0,
      dashTrail: [],
      companionId: companion.id,
      companionCooldown: 0,
      companionCooldownMax: companion.cooldown,
      companionActiveTimer: 0,
    };

    // Companion initial position flanking Zeynthar
    this.companionX = this.player.x - 45;
    this.companionY = this.player.y - 30;

    this.initPillars();
    this.initAmbientEmbers();
    this.initEventListeners();
    this.resizeCanvas();
  }

  private loadGroundTexture(textureUrl: string) {
    const img = new Image();
    img.src = textureUrl;
    img.onload = () => {
      this.groundImg = img;
      if (this.ctx) {
        this.groundPattern = this.ctx.createPattern(img, 'repeat');
      }
    };
  }

  private initPillars() {
    this.riftPillars = [];
    const count = this.level.riftPillarsCount;
    const padding = 280;
    const stepX = (this.arenaWidth - padding * 2) / (count > 1 ? count - 1 : 1);

    for (let i = 0; i < count; i++) {
      const px = count === 1 ? this.arenaWidth / 2 : padding + stepX * i;
      const py = (i % 2 === 0 ? 280 : this.arenaHeight - 280);
      this.riftPillars.push({
        id: `pillar_${i}`,
        x: px,
        y: py,
        hp: 380 + this.level.id * 80,
        maxHp: 380 + this.level.id * 80,
        isPurified: false,
        pulseTimer: Math.random() * 2,
        city: this.level.city,
      });
    }
  }

  private initAmbientEmbers() {
    this.ambientEmbers = [];
    for (let i = 0; i < 70; i++) {
      this.ambientEmbers.push({
        x: Math.random() * this.arenaWidth,
        y: Math.random() * this.arenaHeight,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.4 - 0.4,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
      });
    }
  }

  private initEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);

    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;

    if (e.key === ' ' || e.code === 'Space') {
      this.triggerPortalDash();
    } else if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'k') {
      this.triggerChronoMatrix();
    } else if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'u') {
      this.triggerRealityRewrite();
    } else if (e.key === '1') {
      this.triggerHealthPotion();
    } else if (e.key === '2') {
      this.triggerCompanionAbility();
    } else if (e.key.toLowerCase() === 'f') {
      this.checkRelicPickup();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left + this.cameraX,
      y: e.clientY - rect.top + this.cameraY,
    };
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
    } else if (e.button === 2) {
      this.triggerPortalDash();
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleResize = () => {
    this.resizeCanvas();
  };

  private resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    // Light canvas matches viewport
    this.lightCanvas.width = window.innerWidth;
    this.lightCanvas.height = window.innerHeight;
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.startMusic(this.level.themeStyle);
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  // --- ACTIONS ---

  public triggerHealthPotion() {
    if (this.player.potionCooldownTimer > 0 || this.player.hp >= this.player.maxHp) return;
    this.player.potionCooldownTimer = this.player.potionCooldownMax;
    soundManager.playCollect();

    const healAmount = Math.round(this.player.maxHp * 0.45);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
    this.addDamageNumber(this.player.x, this.player.y - 35, healAmount, '#22c55e', false);

    // Healing blood-chime starlight burst
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        id: Math.random().toString(),
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(a) * 4,
        vy: Math.sin(a) * 4 - 2,
        radius: 4,
        color: '#4ade80',
        life: 0.7,
        maxLife: 0.7,
        size: 5,
        alpha: 1,
        glow: true,
      });
    }
  }

  public triggerPortalDash() {
    if (this.player.isInvulnerable > 0.05) return;
    soundManager.playDash();

    let dx = 0;
    let dy = 0;
    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    if (dx === 0 && dy === 0) {
      dx = Math.cos(this.player.facingAngle);
      dy = Math.sin(this.player.facingAngle);
    } else {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    const startX = this.player.x;
    const startY = this.player.y;
    const dashDist = 160;
    this.player.x += dx * dashDist;
    this.player.y += dy * dashDist;
    this.clampPlayerPosition();

    this.player.isInvulnerable = 0.45;

    // Portal entrance & exit vortexes
    [ { x: startX, y: startY }, { x: this.player.x, y: this.player.y } ].forEach(pt => {
      for (let i = 0; i < 20; i++) {
        const ang = Math.random() * Math.PI * 2;
        this.particles.push({
          id: Math.random().toString(),
          x: pt.x,
          y: pt.y,
          vx: Math.cos(ang) * (Math.random() * 6 + 2),
          vy: Math.sin(ang) * (Math.random() * 6 + 2),
          radius: 4,
          color: '#38bdf8',
          life: 0.4,
          maxLife: 0.4,
          size: 5,
          alpha: 1,
          glow: true,
        });
      }
    });

    // Space fracture between portals
    this.enemies.forEach(e => {
      const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (dist < 110) {
        this.applyDamageToEnemy(e, 85, false);
      }
    });
  }

  public triggerChronoMatrix() {
    if (this.player.specialCooldownTimer > 0) return;
    this.player.specialCooldownTimer = this.player.specialCooldownMax;
    soundManager.playSpecial();

    this.chronoStasisTimer = 4.0;
    this.player.specialActiveTimer = 4.0;
    this.player.shield = this.player.maxShield;
    this.addScreenShake(8);

    this.projectiles = this.projectiles.filter(p => p.source === 'player');

    // Starlight pulse ring
    for (let a = 0; a < Math.PI * 2; a += 0.16) {
      this.particles.push({
        id: Math.random().toString(),
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(a) * 8.5,
        vy: Math.sin(a) * 8.5,
        radius: 6,
        color: '#c084fc',
        life: 0.5,
        maxLife: 0.5,
        size: 6,
        alpha: 1,
        glow: true,
      });
    }
  }

  public triggerRealityRewrite() {
    if (this.player.ultimateCharge < 100) return;
    this.player.ultimateCharge = 0;
    soundManager.playUltimate();
    this.addScreenShake(20);

    this.projectiles = this.projectiles.filter(p => p.source === 'player');

    // Supernova destruction
    this.enemies.forEach(e => {
      this.applyDamageToEnemy(e, 750, true);
    });

    this.riftPillars.forEach(pillar => {
      if (!pillar.isPurified) {
        pillar.hp = Math.max(0, pillar.hp - 450);
      }
    });

    // Diablo style blast ring
    for (let i = 0; i < 110; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = Math.random() * 15 + 4;
      this.particles.push({
        id: Math.random().toString(),
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        radius: Math.random() * 6 + 3,
        color: i % 2 === 0 ? '#38bdf8' : '#e879f9',
        life: 0.9,
        maxLife: 0.9,
        size: 7,
        alpha: 1,
        glow: true,
      });
    }
  }

  public triggerCompanionAbility(): boolean {
    if (this.companionCooldownTimer > 0) return false;
    this.companionCooldownTimer = this.companion.cooldown;
    this.companionActiveTimer = 3.5;
    this.player.companionCooldown = this.companion.cooldown;
    this.player.companionActiveTimer = 3.5;
    soundManager.playSpecial();
    this.addScreenShake(10);

    const cx = this.companionX;
    const cy = this.companionY;

    if (this.companion.id === 'lysara') {
      // Espirales Arcanas de la Creación: 8 spiral homing arcane bolts
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i;
        this.projectiles.push({
          id: Math.random().toString(),
          x: cx,
          y: cy,
          vx: Math.cos(a) * 8.5,
          vy: Math.sin(a) * 8.5,
          radius: 7,
          color: '#c084fc',
          source: 'player',
          damage: 180,
          life: 2.8,
          maxLife: 2.8,
          isHoming: true,
          type: 'arcane',
        });
      }
    } else if (this.companion.id === 'x7') {
      // Red Cuántica Divina: 4 orbital laser grid strikes
      const targets = [...this.enemies]
        .sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))
        .slice(0, 4);
      targets.forEach(t => {
        this.applyDamageToEnemy(t, 380, true);
        for (let p = 0; p < 25; p++) {
          this.particles.push({
            id: Math.random().toString(),
            x: t.x,
            y: t.y,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 12,
            radius: 4,
            color: '#38bdf8',
            life: 0.6,
            maxLife: 0.6,
            size: 6,
            alpha: 1,
            glow: true,
          });
        }
      });
    } else if (this.companion.id === 'orion') {
      // Báculo de las Eras: Global time-stasis root for 4 seconds
      this.chronoStasisTimer = 4.0;
      this.enemies.forEach(e => {
        this.applyDamageToEnemy(e, 240, false);
        e.knockbackVx = 0;
        e.knockbackVy = 0;
      });
    } else if (this.companion.id === 'esmerald') {
      // Smite de las Alas Radiantes: Holy nova smite + restores 60 HP to Zeynthar
      const heal = 60;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.addDamageNumber(this.player.x, this.player.y - 35, heal, '#22c55e', false);
      this.enemies.forEach(e => {
        const d = Math.hypot(e.x - cx, e.y - cy);
        if (d < 380) {
          this.applyDamageToEnemy(e, 420, true);
        }
      });
    } else if (this.companion.id === 'nexus') {
      // Vórtice de Posibilidades Infinitas: Pulls enemies towards center and explodes
      const pullX = this.mousePos.x || this.player.x;
      const pullY = this.mousePos.y || this.player.y;
      this.enemies.forEach(e => {
        const ang = Math.atan2(pullY - e.y, pullX - e.x);
        e.knockbackVx = (e.knockbackVx ?? 0) + Math.cos(ang) * 15;
        e.knockbackVy = (e.knockbackVy ?? 0) + Math.sin(ang) * 15;
        this.applyDamageToEnemy(e, 260, false);
      });
    }

    return true;
  }

  private checkRelicPickup() {
    if (this.isRelicUnearthed) return;
    const d = Math.hypot(this.player.x - this.hiddenRelic.x, this.player.y - this.hiddenRelic.y);
    if (d < 70) {
      this.unearthRelic();
    }
  }

  private unearthRelic() {
    this.isRelicUnearthed = true;
    this.hiddenRelic.isFound = true;
    soundManager.playCollect();
    this.addScreenShake(12);
    this.callbacks.onRelicFound(this.hiddenRelic);

    if (this.hiddenRelic.passiveBonus.damageBoost) {
      this.player.speed += 0.2;
    }
    if (this.hiddenRelic.passiveBonus.hpBoost) {
      this.player.maxHp += this.hiddenRelic.passiveBonus.hpBoost;
      this.player.hp = this.player.maxHp;
    }

    for (let i = 0; i < 45; i++) {
      const ang = Math.random() * Math.PI * 2;
      this.particles.push({
        id: Math.random().toString(),
        x: this.hiddenRelic.x,
        y: this.hiddenRelic.y,
        vx: Math.cos(ang) * 6,
        vy: Math.sin(ang) * 6,
        radius: 6,
        color: '#fbbf24',
        life: 1.0,
        maxLife: 1.0,
        size: 7,
        alpha: 1,
        glow: true,
      });
    }
  }

  public setVirtualMove(vx: number, vy: number) {
    this.player.vx = vx * this.player.speed;
    this.player.vy = vy * this.player.speed;
  }

  public setVirtualAim(dx: number, dy: number, isShooting: boolean) {
    if (dx !== 0 || dy !== 0) {
      this.player.facingAngle = Math.atan2(dy, dx);
    }
    this.isMouseDown = isShooting;
  }

  // --- CORE GAME LOOP ---

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    dt = Math.min(dt, 0.05);

    if (!this.isPaused) {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    }

    this.render();
    this.animId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // 1. Timers
    if (this.player.specialCooldownTimer > 0) {
      this.player.specialCooldownTimer = Math.max(0, this.player.specialCooldownTimer - dt);
    }
    if (this.player.specialActiveTimer > 0) {
      this.player.specialActiveTimer = Math.max(0, this.player.specialActiveTimer - dt);
    }
    if (this.player.potionCooldownTimer > 0) {
      this.player.potionCooldownTimer = Math.max(0, this.player.potionCooldownTimer - dt);
    }
    if (this.chronoStasisTimer > 0) {
      this.chronoStasisTimer = Math.max(0, this.chronoStasisTimer - dt);
    }
    if (this.player.isInvulnerable > 0) {
      this.player.isInvulnerable = Math.max(0, this.player.isInvulnerable - dt);
    }
    if (this.player.comboTimer > 0) {
      this.player.comboTimer -= dt;
      if (this.player.comboTimer <= 0) {
        this.player.comboCount = 0;
      }
    }

    // Shield passive regeneration
    if (this.player.shield < this.player.maxShield && this.player.specialActiveTimer <= 0) {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + dt * 4.5);
    }

    // Auto relic unearth if stepped on
    if (!this.isRelicUnearthed) {
      const rd = Math.hypot(this.player.x - this.hiddenRelic.x, this.player.y - this.hiddenRelic.y);
      if (rd < 40) {
        this.unearthRelic();
      }
    }

    // 2. Player Movement
    let moveX = 0;
    let moveY = 0;
    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      this.player.vx = (moveX / len) * this.player.speed;
      this.player.vy = (moveY / len) * this.player.speed;
    } else if (this.keys['w'] === undefined) {
      this.player.vx *= 0.84;
      this.player.vy *= 0.84;
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    this.clampPlayerPosition();

    if (this.mousePos.x !== 0 && this.mousePos.y !== 0) {
      this.player.facingAngle = Math.atan2(
        this.mousePos.y - this.player.y,
        this.mousePos.x - this.player.x
      );
    }

    // 3. Zeynthar Primary Dual Arcane-Tech Firing
    let baseFireRate = 5.2;
    let baseDamage = 30 + (this.starArmor.bonusDamage || 0);
    this.upgrades.forEach(u => {
      if (u.bonus.fireRate) baseFireRate += u.bonus.fireRate * u.level;
      if (u.bonus.damage) baseDamage += u.bonus.damage * u.level;
    });

    if (this.chronoStasisTimer > 0) {
      baseFireRate *= 1.45;
      baseDamage *= 1.35;
    }

    this.fireTimer += dt;
    if (this.isMouseDown && this.fireTimer >= 1 / baseFireRate) {
      this.fireZeyntharWeapons(baseDamage);
      this.fireTimer = 0;
    }

    // 4. Update Rift Pillars
    this.riftPillars.forEach(p => {
      p.pulseTimer += dt;
      if (p.hp <= 0 && !p.isPurified) {
        p.isPurified = true;
        soundManager.playRiftPulse();
        this.addScreenShake(9);
        this.player.ultimateCharge = Math.min(100, this.player.ultimateCharge + 30);
        this.scrapEarned += 35;
        for (let i = 0; i < 30; i++) {
          this.particles.push({
            id: Math.random().toString(),
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: 5,
            color: '#34d399',
            life: 0.6,
            maxLife: 0.6,
            size: 6,
            alpha: 1,
            glow: true,
          });
        }
      }
    });

    // 5. Ambient embers & Decals
    this.ambientEmbers.forEach(e => {
      e.x += e.vx;
      e.y += e.vy;
      if (e.y < 0) e.y = this.arenaHeight;
      if (e.x < 0) e.x = this.arenaWidth;
      if (e.x > this.arenaWidth) e.x = 0;
    });

    // 6. Hazards
    this.updateHazards(dt);

    // 7. Spawning
    this.updateSpawning(dt);

    // 8. Enemies
    const enemyDt = this.chronoStasisTimer > 0 ? dt * 0.22 : dt;
    this.updateEnemies(enemyDt);

    // 9. Projectiles
    this.updateProjectiles(dt);

    // 10. Drops
    this.updateDrops(dt);

    // 11. Visual FX
    this.updateVisualEffects(dt);

    // 12. Camera lerp
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const targetCamX = this.player.x - viewW / 2;
    const targetCamY = this.player.y - viewH / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.12;
    this.cameraX = Math.max(0, Math.min(this.arenaWidth - viewW, this.cameraX));
    this.cameraY = Math.max(0, Math.min(this.arenaHeight - viewH, this.cameraY));

    // 13. Victory / Defeat
    if (this.player.hp <= 0) {
      soundManager.playGameOver();
      this.callbacks.onGameOver();
      this.stop();
      return;
    }

    if (this.isBossSpawned && this.bossEntity && this.bossEntity.hp <= 0) {
      soundManager.playVictory();
      this.callbacks.onLevelVictory(this.level, this.scrapEarned);
      this.stop();
      return;
    }

    const relicDist = Math.round(
      Math.hypot(this.player.x - this.hiddenRelic.x, this.player.y - this.hiddenRelic.y)
    );

    const activeHazard = this.hazards.length > 0 ? this.level.riftPhenomenon.name : null;
    const unpurified = this.riftPillars.filter(p => !p.isPurified).length;

    // Companion Timers & Hover
    if (this.companionCooldownTimer > 0) {
      this.companionCooldownTimer = Math.max(0, this.companionCooldownTimer - dt);
    }
    if (this.companionActiveTimer > 0) {
      this.companionActiveTimer = Math.max(0, this.companionActiveTimer - dt);
    }
    this.companionFloatTimer += dt;
    this.companionAttackTimer += dt;

    // Companion smooth following Zeynthar with spring easing
    const targetCompX = this.player.x - Math.cos(this.player.facingAngle + 0.8) * 52;
    const targetCompY = this.player.y - Math.sin(this.player.facingAngle + 0.8) * 52;
    this.companionX += (targetCompX - this.companionX) * 0.12;
    this.companionY += (targetCompY - this.companionY) * 0.12;

    // Companion Combat Auto-Assist
    if (this.companionAttackTimer >= 1.4 && this.enemies.length > 0) {
      let nearest: EnemyEntity | null = null;
      let minDist = 420;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - this.companionX, e.y - this.companionY);
        if (d < minDist) {
          minDist = d;
          nearest = e;
        }
      }

      if (nearest) {
        this.companionAttackTimer = 0;
        const fireAng = Math.atan2(nearest.y - this.companionY, nearest.x - this.companionX);
        soundManager.playShoot('kaelen');

        if (this.companion.id === 'lysara') {
          [-0.12, 0.12].forEach(off => {
            this.projectiles.push({
              id: Math.random().toString(),
              x: this.companionX,
              y: this.companionY,
              vx: Math.cos(fireAng + off) * 9.5,
              vy: Math.sin(fireAng + off) * 9.5,
              radius: 5.5,
              color: '#c084fc',
              source: 'player',
              damage: 45,
              life: 2.2,
              maxLife: 2.2,
              isHoming: true,
              type: 'arcane',
            });
          });
        } else if (this.companion.id === 'x7') {
          this.projectiles.push({
            id: Math.random().toString(),
            x: this.companionX,
            y: this.companionY,
            vx: Math.cos(fireAng) * 11,
            vy: Math.sin(fireAng) * 11,
            radius: 6,
            color: '#38bdf8',
            source: 'player',
            damage: 55,
            life: 2.5,
            maxLife: 2.5,
            isHoming: true,
            type: 'quantum',
          });
        } else if (this.companion.id === 'orion') {
          this.projectiles.push({
            id: Math.random().toString(),
            x: this.companionX,
            y: this.companionY,
            vx: Math.cos(fireAng) * 8.5,
            vy: Math.sin(fireAng) * 8.5,
            radius: 6,
            color: '#4ade80',
            source: 'player',
            damage: 50,
            life: 2.4,
            maxLife: 2.4,
            pierce: 1,
            type: 'arcane',
          });
        } else if (this.companion.id === 'esmerald') {
          this.projectiles.push({
            id: Math.random().toString(),
            x: this.companionX,
            y: this.companionY,
            vx: Math.cos(fireAng) * 12,
            vy: Math.sin(fireAng) * 12,
            radius: 7,
            color: '#fbbf24',
            source: 'player',
            damage: 65,
            life: 2.0,
            maxLife: 2.0,
            pierce: 2,
            type: 'quantum',
          });
        } else if (this.companion.id === 'nexus') {
          this.projectiles.push({
            id: Math.random().toString(),
            x: this.companionX,
            y: this.companionY,
            vx: Math.cos(fireAng) * 10,
            vy: Math.sin(fireAng) * 10,
            radius: 6.5,
            color: '#818cf8',
            source: 'player',
            damage: 52,
            life: 2.3,
            maxLife: 2.3,
            isHoming: true,
            type: 'arcane',
          });
        }
      }
    }

    // Update walking cadence
    const moveVel = Math.hypot(this.player.vx, this.player.vy);
    if (moveVel > 0.1) {
      this.player.walkTimer += moveVel * 0.14;
    }

    this.callbacks.onStatsUpdate({
      hp: Math.ceil(this.player.hp),
      maxHp: this.player.maxHp,
      shield: Math.ceil(this.player.shield),
      maxShield: this.player.maxShield,
      ultimateCharge: Math.min(100, Math.floor(this.player.ultimateCharge)),
      specialCooldownTimer: Number(this.player.specialCooldownTimer.toFixed(1)),
      specialCooldownMax: this.player.specialCooldownMax,
      specialActiveTimer: Number(this.player.specialActiveTimer.toFixed(1)),
      potionCooldownTimer: Number(this.player.potionCooldownTimer.toFixed(1)),
      potionCooldownMax: this.player.potionCooldownMax,
      companionId: this.companion.id,
      companionName: this.companion.name,
      companionCooldownTimer: Number(this.companionCooldownTimer.toFixed(1)),
      companionCooldownMax: this.companion.cooldown,
      companionActiveTimer: Number(this.companionActiveTimer.toFixed(1)),
      companionAbilityName: this.companion.abilityName,
      kills: this.killsCount,
      targetKills: this.level.targetKills,
      scrap: this.scrapEarned,
      riftPillarsLeft: unpurified,
      riftPillarsTotal: this.riftPillars.length,
      bossActive: this.isBossSpawned && !!this.bossEntity,
      bossHp: this.bossEntity ? Math.max(0, Math.ceil(this.bossEntity.hp)) : 0,
      bossMaxHp: this.bossEntity ? this.bossEntity.maxHp : 1,
      bossName: this.level.bossName,
      combo: this.player.comboCount,
      relicDistance: relicDist,
      relicFound: this.isRelicUnearthed,
      relicName: this.hiddenRelic.name,
      hazardAlert: activeHazard,
    });
  }

  private clampPlayerPosition() {
    const pad = this.player.radius + 15;
    this.player.x = Math.max(pad, Math.min(this.arenaWidth - pad, this.player.x));
    this.player.y = Math.max(pad, Math.min(this.arenaHeight - pad, this.player.y));
  }

  private fireZeyntharWeapons(baseDamage: number) {
    soundManager.playShoot('kaelen');
    const speed = 15;
    const ang = this.player.facingAngle;

    // Dual Fire: Arcane Orb + Quantum Piercing Beam
    this.projectiles.push({
      id: Math.random().toString(),
      x: this.player.x + Math.cos(ang) * 26,
      y: this.player.y + Math.sin(ang) * 26,
      vx: Math.cos(ang - 0.08) * speed,
      vy: Math.sin(ang - 0.08) * speed,
      radius: 6,
      color: '#c084fc',
      source: 'player',
      damage: baseDamage * 0.65,
      life: 1.2,
      maxLife: 1.2,
      isHoming: true,
      type: 'arcane',
    });

    this.projectiles.push({
      id: Math.random().toString(),
      x: this.player.x + Math.cos(ang) * 26,
      y: this.player.y + Math.sin(ang) * 26,
      vx: Math.cos(ang + 0.08) * (speed + 2),
      vy: Math.sin(ang + 0.08) * (speed + 2),
      radius: 5,
      color: '#38bdf8',
      source: 'player',
      damage: baseDamage * 0.75,
      life: 1.0,
      maxLife: 1.0,
      pierce: 1,
      type: 'quantum',
    });
  }

  private updateHazards(dt: number) {
    this.hazardSpawnTimer += dt;
    if (this.hazardSpawnTimer >= 5.5 && this.hazards.length < 3) {
      this.hazardSpawnTimer = 0;
      this.spawnEnvironmentalHazard();
    }

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (h.telegraphProgress < h.telegraphMax) {
        h.telegraphProgress += dt;
      } else {
        if (!h.hasDetonated) {
          h.hasDetonated = true;
          soundManager.playExplosion(false);
          this.addScreenShake(6);

          const pDist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
          if (pDist < h.radius) {
            this.applyDamageToPlayer(20);
          }
          this.enemies.forEach(e => {
            if (Math.hypot(e.x - h.x, e.y - h.y) < h.radius) {
              this.applyDamageToEnemy(e, 80, true);
            }
          });
        }

        h.duration -= dt;
        if (h.duration <= 0) {
          this.hazards.splice(i, 1);
        }
      }
    }
  }

  private spawnEnvironmentalHazard() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 350 + 80;
    const x = Math.max(100, Math.min(this.arenaWidth - 100, this.player.x + Math.cos(angle) * dist));
    const y = Math.max(100, Math.min(this.arenaHeight - 100, this.player.y + Math.sin(angle) * dist));

    this.hazards.push({
      id: Math.random().toString(),
      name: this.level.riftPhenomenon.name,
      type: this.level.riftPhenomenon.hazardType,
      x,
      y,
      radius: 95,
      duration: 3.0,
      maxDuration: 3.0,
      telegraphProgress: 0,
      telegraphMax: 1.4,
      hasDetonated: false,
    });
  }

  private updateSpawning(dt: number) {
    const maxEnemies = this.isBossSpawned ? 8 : 24;
    const spawnInterval = this.isBossSpawned ? 4.5 : 1.4;

    this.spawnTimer += dt;
    if (this.enemies.length < maxEnemies && this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    if (!this.drakthulShadowIncursion && this.killsCount >= Math.floor(this.level.targetKills * 0.5) && this.level.id < 5) {
      this.triggerDrakthulShadowIncursion();
    }

    const allPillarsPurified = this.riftPillars.every(p => p.isPurified);
    if (!this.isBossSpawned && this.killsCount >= this.level.targetKills && allPillarsPurified) {
      this.spawnBoss();
    }
  }

  private triggerDrakthulShadowIncursion() {
    this.drakthulShadowIncursion = true;
    soundManager.playBossRoar();
    this.addScreenShake(14);

    for (let i = 0; i < 2; i++) {
      const ang = (Math.PI * i) + Math.random();
      this.enemies.push({
        id: Math.random().toString(),
        name: 'Heraldo de Drakthul',
        x: this.player.x + Math.cos(ang) * 400,
        y: this.player.y + Math.sin(ang) * 400,
        vx: 0,
        vy: 0,
        radius: 26,
        color: '#dc2626',
        hp: 150 + this.level.id * 40,
        maxHp: 150 + this.level.id * 40,
        speed: 2.2,
        damage: 22,
        enemyType: 'drakthul_herald',
        attackCooldown: 1.8,
        behaviorTimer: 0,
        state: 'chasing',
      });
    }
  }

  private spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 650;
    const x = Math.max(50, Math.min(this.arenaWidth - 50, this.player.x + Math.cos(angle) * dist));
    const y = Math.max(50, Math.min(this.arenaHeight - 50, this.player.y + Math.sin(angle) * dist));

    const enemyTypes: ('shadow_minion' | 'chaos_caster' | 'void_stalker' | 'drakthul_herald')[] = [
      'shadow_minion', 'chaos_caster', 'void_stalker', 'drakthul_herald'
    ];
    const weights = [0.45, 0.25, 0.2, 0.1];
    let rand = Math.random();
    let selectedType = 'shadow_minion';
    for (let i = 0; i < weights.length; i++) {
      if (rand < weights[i]) {
        selectedType = enemyTypes[i];
        break;
      }
      rand -= weights[i];
    }

    let hp = 45 + this.level.id * 16;
    let speed = 2.4;
    let radius = 17;
    let color = '#f87171';

    if (selectedType === 'chaos_caster') {
      hp = 35 + this.level.id * 12;
      speed = 1.9;
      radius = 16;
      color = '#a855f7';
    } else if (selectedType === 'void_stalker') {
      hp = 30 + this.level.id * 10;
      speed = 3.6;
      radius = 15;
      color = '#38bdf8';
    } else if (selectedType === 'drakthul_herald') {
      hp = 130 + this.level.id * 35;
      speed = 1.4;
      radius = 26;
      color = '#dc2626';
    }

    this.enemies.push({
      id: Math.random().toString(),
      name: `Minion_${selectedType}`,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      color,
      hp,
      maxHp: hp,
      speed,
      damage: 15 + this.level.id * 3,
      enemyType: selectedType as EnemyEntity['enemyType'],
      attackCooldown: Math.random() * 2,
      behaviorTimer: 0,
      state: 'chasing',
    });
  }

  private spawnBoss() {
    this.isBossSpawned = true;
    soundManager.playBossRoar();
    this.addScreenShake(20);

    const isDrakthulFinal = this.level.bossName === 'DRAKTHUL';
    const bossRadius = isDrakthulFinal ? 48 : 40;
    const bossColor = isDrakthulFinal ? '#dc2626' : this.level.accentColor;

    const boss: EnemyEntity = {
      id: 'boss',
      name: this.level.bossName,
      x: this.arenaWidth / 2,
      y: 250,
      vx: 0,
      vy: 0,
      radius: bossRadius,
      color: bossColor,
      hp: this.level.bossHp,
      maxHp: this.level.bossHp,
      speed: isDrakthulFinal ? 2.6 : 2.1,
      damage: 32,
      enemyType: 'boss',
      attackCooldown: 1.5,
      behaviorTimer: 0,
      state: 'chasing',
      phase: 1,
      bossAttackPattern: 0,
      specialRingAngle: 0,
      walkTimer: 0,
      attackAnim: 0,
      hitFlash: 0,
      knockbackVx: 0,
      knockbackVy: 0,
      mass: 80,
    };

    this.bossEntity = boss;
    this.enemies.push(boss);
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp <= 0) {
        this.handleEnemyDeath(e);
        this.enemies.splice(i, 1);
        continue;
      }

      e.attackCooldown -= dt;
      e.behaviorTimer += dt;

      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dist = Math.hypot(dx, dy);

      if (e.enemyType === 'boss') {
        this.updateBossBehavior(e, dt, this.player.x, this.player.y);
      } else if (e.enemyType === 'chaos_caster') {
        if (dist > 320) {
          e.x += (dx / dist) * e.speed;
          e.y += (dy / dist) * e.speed;
        } else if (dist < 180) {
          e.x -= (dx / dist) * e.speed;
          e.y -= (dy / dist) * e.speed;
        }

        if (e.attackCooldown <= 0) {
          e.attackCooldown = 2.4;
          soundManager.playEnemyShoot();
          const ang = Math.atan2(dy, dx);
          this.projectiles.push({
            id: Math.random().toString(),
            x: e.x,
            y: e.y,
            vx: Math.cos(ang) * 6,
            vy: Math.sin(ang) * 6,
            radius: 6,
            color: '#dc2626',
            source: 'enemy',
            damage: e.damage,
            life: 2.5,
            maxLife: 2.5,
            type: 'chaos_orb',
          });
        }
      } else if (e.enemyType === 'void_stalker') {
        if (e.state === 'chasing') {
          e.x += (dx / dist) * e.speed;
          e.y += (dy / dist) * e.speed;
          if (dist < 220 && e.attackCooldown <= 0) {
            e.state = 'telegraphing';
            e.telegraphDuration = 0.55;
            e.telegraphProgress = 0;
            e.targetPos = { x: this.player.x, y: this.player.y };
          }
        } else if (e.state === 'telegraphing') {
          e.telegraphProgress = (e.telegraphProgress || 0) + dt;
          if (e.telegraphProgress >= (e.telegraphDuration || 0.55)) {
            e.state = 'attacking';
            const dashAngle = Math.atan2((e.targetPos?.y || 0) - e.y, (e.targetPos?.x || 0) - e.x);
            e.vx = Math.cos(dashAngle) * 11;
            e.vy = Math.sin(dashAngle) * 11;
            e.attackCooldown = 2.4;
          }
        } else if (e.state === 'attacking') {
          e.x += e.vx;
          e.y += e.vy;
          e.vx *= 0.94;
          e.vy *= 0.94;
          if (Math.hypot(e.vx, e.vy) < 1.0) {
            e.state = 'chasing';
          }
        }
      } else {
        if (dist > 5) {
          e.x += (dx / dist) * e.speed;
          e.y += (dy / dist) * e.speed;
        }
      }

      const pDist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
      if (pDist < this.player.radius + e.radius) {
        this.applyDamageToPlayer(e.damage);
        const pushAngle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
        this.player.x += Math.cos(pushAngle) * 18;
        this.player.y += Math.sin(pushAngle) * 18;
      }
    }
  }

  private updateBossBehavior(boss: EnemyEntity, dt: number, targetX: number, targetY: number) {
    const isDrakthul = boss.name === 'DRAKTHUL';
    const hpRatio = boss.hp / boss.maxHp;

    if (hpRatio < 0.35) boss.phase = 3;
    else if (hpRatio < 0.7) boss.phase = 2;
    else boss.phase = 1;

    const destX = this.arenaWidth / 2 + Math.sin(boss.behaviorTimer * 1.1) * 220;
    const destY = 260 + Math.cos(boss.behaviorTimer * 0.8) * 80;
    boss.x += (destX - boss.x) * 0.04;
    boss.y += (destY - boss.y) * 0.04;

    boss.specialRingAngle = (boss.specialRingAngle || 0) + dt * 1.6;

    if (boss.attackCooldown <= 0) {
      boss.bossAttackPattern = ((boss.bossAttackPattern || 0) + 1) % 4;
      const pattern = boss.bossAttackPattern;

      if (isDrakthul) {
        if (pattern === 0) {
          soundManager.playEnemyShoot();
          const count = 16;
          for (let i = 0; i < count; i++) {
            const ang = (Math.PI * 2 / count) * i + (boss.specialRingAngle || 0);
            this.projectiles.push({
              id: Math.random().toString(),
              x: boss.x,
              y: boss.y,
              vx: Math.cos(ang) * 5.8,
              vy: Math.sin(ang) * 5.8,
              radius: 8,
              color: '#dc2626',
              source: 'boss',
              damage: 26,
              life: 3.5,
              maxLife: 3.5,
              type: 'chaos_orb',
            });
          }
          boss.attackCooldown = 1.8;
        } else if (pattern === 1) {
          soundManager.playEnemyShoot();
          const ang = Math.atan2(targetY - boss.y, targetX - boss.x);
          [-0.2, 0, 0.2].forEach(offset => {
            this.projectiles.push({
              id: Math.random().toString(),
              x: boss.x,
              y: boss.y,
              vx: Math.cos(ang + offset) * 9.5,
              vy: Math.sin(ang + offset) * 9.5,
              radius: 7,
              color: '#991b1b',
              source: 'boss',
              damage: 30,
              life: 2.5,
              maxLife: 2.5,
              type: 'shadow_lance',
            });
          });
          boss.attackCooldown = 2.0;
        } else if (pattern === 2) {
          soundManager.playRiftPulse();
          this.addScreenShake(8);
          this.hazards.push({
            id: Math.random().toString(),
            name: 'Singularidad de Sombras de Drakthul',
            type: 'gravity_well',
            x: targetX,
            y: targetY,
            radius: 110,
            duration: 3.0,
            maxDuration: 3.0,
            telegraphProgress: 0,
            telegraphMax: 1.0,
            hasDetonated: false,
          });
          boss.attackCooldown = 2.6;
        } else {
          soundManager.playExplosion();
          this.addScreenShake(10);
          for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = Math.random() * 5 + 3;
            this.projectiles.push({
              id: Math.random().toString(),
              x: boss.x,
              y: boss.y,
              vx: Math.cos(a) * spd,
              vy: Math.sin(a) * spd,
              radius: 9,
              color: '#450a0a',
              source: 'boss',
              damage: 28,
              life: 3.2,
              maxLife: 3.2,
            });
          }
          boss.attackCooldown = 1.7;
        }
      } else {
        if (pattern === 0) {
          soundManager.playEnemyShoot();
          for (let i = 0; i < 10; i++) {
            const ang = (Math.PI * 2 / 10) * i;
            this.projectiles.push({
              id: Math.random().toString(),
              x: boss.x,
              y: boss.y,
              vx: Math.cos(ang) * 5.2,
              vy: Math.sin(ang) * 5.2,
              radius: 6,
              color: this.level.accentColor,
              source: 'boss',
              damage: 22,
              life: 3.0,
              maxLife: 3.0,
            });
          }
          boss.attackCooldown = 2.0;
        } else if (pattern === 1) {
          soundManager.playEnemyShoot();
          const ang = Math.atan2(targetY - boss.y, targetX - boss.x);
          [-0.15, 0.15].forEach(o => {
            this.projectiles.push({
              id: Math.random().toString(),
              x: boss.x,
              y: boss.y,
              vx: Math.cos(ang + o) * 8.0,
              vy: Math.sin(ang + o) * 8.0,
              radius: 6,
              color: this.level.secondaryColor,
              source: 'boss',
              damage: 24,
              life: 2.2,
              maxLife: 2.2,
            });
          });
          boss.attackCooldown = 1.8;
        } else {
          const ang = Math.atan2(targetY - boss.y, targetX - boss.x);
          boss.vx = Math.cos(ang) * 7.5;
          boss.vy = Math.sin(ang) * 7.5;
          boss.attackCooldown = 2.6;
        }
      }
    }
  }

  private handleEnemyDeath(e: EnemyEntity) {
    soundManager.playExplosion(e.enemyType === 'boss');
    this.addScreenShake(e.enemyType === 'boss' ? 16 : 3);

    this.killsCount++;
    this.player.comboCount++;
    this.player.comboTimer = 2.5;

    this.player.ultimateCharge = Math.min(100, this.player.ultimateCharge + (e.enemyType === 'boss' ? 30 : 5));

    // Blood splatter decal on ground (Diablo 3 gore)
    if (this.groundDecals.length < 80) {
      const splatterPts: { dx: number; dy: number }[] = [];
      const numDrops = Math.floor(Math.random() * 6) + 4;
      for (let i = 0; i < numDrops; i++) {
        splatterPts.push({
          dx: (Math.random() - 0.5) * e.radius * 2.2,
          dy: (Math.random() - 0.5) * e.radius * 2.2,
        });
      }
      this.groundDecals.push({
        x: e.x,
        y: e.y,
        radius: e.radius * 1.5,
        color: e.enemyType === 'boss' ? '#7f1d1d' : '#991b1b',
        alpha: 0.65,
        points: splatterPts,
      });
    }

    // Drops
    const count = e.enemyType === 'boss' ? 10 : 1;
    for (let i = 0; i < count; i++) {
      this.dropItems.push({
        id: Math.random().toString(),
        x: e.x + (Math.random() - 0.5) * 25,
        y: e.y + (Math.random() - 0.5) * 25,
        type: 'chrono_scrap',
        value: 5,
        life: 14,
      });
    }

    if (Math.random() < 0.22 || this.player.hp < this.player.maxHp * 0.4) {
      this.dropItems.push({
        id: Math.random().toString(),
        x: e.x,
        y: e.y,
        type: 'health',
        value: 35,
        life: 14,
      });
    }

    if (e.enemyType === 'boss') {
      this.dropItems.push({
        id: 'pandorum_shard',
        x: e.x,
        y: e.y,
        type: 'pandorum_shard',
        value: 120,
        life: 60,
      });
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.isHoming && p.source === 'player' && this.enemies.length > 0) {
        let nearest: EnemyEntity | null = null;
        let minDist = 380;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          const curAngle = Math.atan2(p.vy, p.vx);
          const targetAngle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
          const diff = Math.atan2(Math.sin(targetAngle - curAngle), Math.cos(targetAngle - curAngle));
          const newAngle = curAngle + diff * 0.14;
          const spd = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(newAngle) * spd;
          p.vy = Math.sin(newAngle) * spd;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.source !== 'player') {
        if (this.player.specialActiveTimer > 0) {
          const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);
          if (d < this.player.radius + 36) {
            p.source = 'player';
            p.vx = -p.vx * 1.5;
            p.vy = -p.vy * 1.5;
            p.damage *= 1.8;
            p.color = '#c084fc';
            soundManager.playShoot('kaelen');
            continue;
          }
        }

        const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);
        if (d < this.player.radius + p.radius) {
          this.applyDamageToPlayer(p.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        for (const pillar of this.riftPillars) {
          if (!pillar.isPurified) {
            const pd = Math.hypot(pillar.x - p.x, pillar.y - p.y);
            if (pd < 38 + p.radius) {
              pillar.hp -= p.damage;
              soundManager.playHit();
              this.addDamageNumber(pillar.x, pillar.y - 25, Math.round(p.damage), '#38bdf8', false);
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }

        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < e.radius + p.radius) {
            let isCrit = false;
            let dmg = p.damage;
            this.upgrades.forEach(u => {
              if (u.bonus.critChance && Math.random() < u.bonus.critChance * u.level) {
                isCrit = true;
                dmg *= 2.2;
              }
            });

            this.applyDamageToEnemy(e, dmg, isCrit);

            if (p.pierce && p.pierce > 0) {
              p.pierce--;
            } else {
              this.projectiles.splice(i, 1);
            }
            break;
          }
        }
      }
    }
  }

  private updateDrops(dt: number) {
    for (let i = this.dropItems.length - 1; i >= 0; i--) {
      const drop = this.dropItems[i];
      drop.life -= dt;
      if (drop.life <= 0) {
        this.dropItems.splice(i, 1);
        continue;
      }

      const d = Math.hypot(this.player.x - drop.x, this.player.y - drop.y);
      if (d < 180) {
        drop.x += ((this.player.x - drop.x) / d) * 7.5;
        drop.y += ((this.player.y - drop.y) / d) * 7.5;
      }

      if (d < this.player.radius + 18) {
        soundManager.playCollect();
        if (drop.type === 'health') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + drop.value);
          this.addDamageNumber(this.player.x, this.player.y - 30, drop.value, '#22c55e', false);
        } else if (drop.type === 'chrono_scrap') {
          this.scrapEarned += drop.value;
          this.addDamageNumber(this.player.x, this.player.y - 30, drop.value, '#facc15', false);
        } else if (drop.type === 'pandorum_shard') {
          this.scrapEarned += drop.value;
        }
        this.dropItems.splice(i, 1);
      }
    }
  }

  private updateVisualEffects(dt: number) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.alpha = p.life / p.maxLife;
    }

    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life -= dt;
      if (dn.life <= 0) {
        this.damageNumbers.splice(i, 1);
        continue;
      }
      dn.y -= 30 * dt;
    }
  }

  private applyDamageToPlayer(amount: number) {
    if (this.player.isInvulnerable > 0) return;

    let remaining = amount;
    if (this.player.shield > 0) {
      const absorbed = Math.min(this.player.shield, remaining);
      this.player.shield -= absorbed;
      remaining -= absorbed;
    }

    if (remaining > 0) {
      this.player.hp = Math.max(0, this.player.hp - remaining);
    }

    this.player.isInvulnerable = 0.4;
    soundManager.playHit();
    this.addScreenShake(7);
    this.hitstopTimer = 0.04;
    this.addDamageNumber(this.player.x, this.player.y - 25, Math.round(amount), '#ef4444', false);
  }

  private applyDamageToEnemy(enemy: EnemyEntity, amount: number, isCrit: boolean) {
    enemy.hp -= amount;
    soundManager.playHit();
    this.addDamageNumber(enemy.x, enemy.y - 20, Math.round(amount), isCrit ? '#f59e0b' : '#ffffff', isCrit);

    if (isCrit) {
      this.addScreenShake(3);
      this.hitstopTimer = 0.03;
    }
  }

  private addDamageNumber(x: number, y: number, value: number, color: string, isCrit: boolean) {
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 15,
      y: y + (Math.random() - 0.5) * 10,
      value,
      color,
      isCrit,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  private addScreenShake(amount: number) {
    this.screenShake = Math.max(this.screenShake, amount);
  }

  // --- ARPG ULTRA-REALISTIC DIABLO 3 RENDERING PIPELINE ---

  private render() {
    const ctx = this.ctx;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    ctx.save();
    ctx.clearRect(0, 0, viewW, viewH);

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }

    ctx.translate(-this.cameraX + shakeX, -this.cameraY + shakeY);

    // 1. Render Seamless Realistic Ground Texture Pattern
    this.renderGround(ctx);

    // 2. Render Ground Decals (Persistent Blood & Scorch marks)
    this.renderDecals(ctx);

    // 3. Render Environmental Hazards
    this.renderHazards(ctx);

    // 4. Render Rift Pillars
    this.renderRiftPillars(ctx);

    // 5. Render Hidden Mystic Relic
    this.renderHiddenRelic(ctx);

    // 6. Render Drops
    this.renderDrops(ctx);

    // 7. Render Enemies (Diablo 3 Spiky Monster Models + Shadows)
    this.renderEnemies(ctx);

    // 8. Render Cosmic Guardian Companion (Lysara, X-7, Orion, Esmerald, Nexus)
    this.renderCompanion(ctx);

    // 9. Render Protagonist Zeynthar (Archmage Silhouette + Cape + Staff)
    this.renderZeynthar(ctx);

    // 9. Render Projectiles
    this.renderProjectiles(ctx);

    // 10. Render Additive Particles
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 11. Render Ambient Floating Ash / Embers
    this.renderEmbers(ctx);

    // 12. Render Dynamic Volumetric Dark Lighting & Torch Map (Diablo 3 Atmospheric Glow)
    this.renderLightingMap(ctx, viewW, viewH);

    // 13. Render Diablo 3 Gothic Floating Combat Text
    this.renderCombatText(ctx);

    // 14. Arena Outer Boundary
    ctx.strokeStyle = this.level.accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.arenaWidth, this.arenaHeight);

    ctx.restore();
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    if (this.groundPattern) {
      ctx.fillStyle = this.groundPattern;
      ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);
    } else {
      // Fallback dark stony texture
      ctx.fillStyle = '#08060f';
      ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);
    }

    // Subtle dark gothic vignette on boundaries
    const grad = ctx.createRadialGradient(
      this.arenaWidth / 2, this.arenaHeight / 2, 200,
      this.arenaWidth / 2, this.arenaHeight / 2, 1000
    );
    grad.addColorStop(0, 'rgba(0,0,0,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);
  }

  private renderDecals(ctx: CanvasRenderingContext2D) {
    for (const d of this.groundDecals) {
      ctx.save();
      ctx.fillStyle = d.color;
      ctx.globalAlpha = d.alpha;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Viscera splatters around center
      for (const pt of d.points) {
        ctx.beginPath();
        ctx.arc(d.x + pt.dx, d.y + pt.dy, Math.random() * 3 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderEmbers(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const e of this.ambientEmbers) {
      ctx.fillStyle = e.color;
      ctx.globalAlpha = e.alpha;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderLightingMap(ctx: CanvasRenderingContext2D, viewW: number, viewH: number) {
    // Render dynamic light cutouts onto the dark shadow shroud
    const lCtx = this.lightCtx;
    lCtx.clearRect(0, 0, viewW, viewH);

    // Dark ambient shadow over entire screen
    lCtx.fillStyle = 'rgba(4, 2, 10, 0.78)';
    lCtx.fillRect(0, 0, viewW, viewH);

    // Punch out holes for lights
    lCtx.globalCompositeOperation = 'destination-out';

    // 1. Zeynthar's Torch / Starlight Aura
    const pxScreen = this.player.x - this.cameraX;
    const pyScreen = this.player.y - this.cameraY;
    const pLight = lCtx.createRadialGradient(pxScreen, pyScreen, 20, pxScreen, pyScreen, 340);
    pLight.addColorStop(0, 'rgba(0,0,0,1)');
    pLight.addColorStop(0.5, 'rgba(0,0,0,0.85)');
    pLight.addColorStop(1, 'rgba(0,0,0,0)');
    lCtx.fillStyle = pLight;
    lCtx.beginPath();
    lCtx.arc(pxScreen, pyScreen, 340, 0, Math.PI * 2);
    lCtx.fill();

    // 2. Rift Pillars lights
    for (const p of this.riftPillars) {
      const psX = p.x - this.cameraX;
      const psY = p.y - this.cameraY;
      const pilGrad = lCtx.createRadialGradient(psX, psY, 15, psX, psY, 200);
      pilGrad.addColorStop(0, 'rgba(0,0,0,0.9)');
      pilGrad.addColorStop(1, 'rgba(0,0,0,0)');
      lCtx.fillStyle = pilGrad;
      lCtx.beginPath();
      lCtx.arc(psX, psY, 200, 0, Math.PI * 2);
      lCtx.fill();
    }

    // 3. Boss Light Aura
    if (this.bossEntity) {
      const bsX = this.bossEntity.x - this.cameraX;
      const bsY = this.bossEntity.y - this.cameraY;
      const bLight = lCtx.createRadialGradient(bsX, bsY, 25, bsX, bsY, 320);
      bLight.addColorStop(0, 'rgba(0,0,0,0.9)');
      bLight.addColorStop(1, 'rgba(0,0,0,0)');
      lCtx.fillStyle = bLight;
      lCtx.beginPath();
      lCtx.arc(bsX, bsY, 320, 0, Math.PI * 2);
      lCtx.fill();
    }

    lCtx.globalCompositeOperation = 'source-over';

    // Draw lighting layer over the game world
    ctx.save();
    ctx.resetTransform();
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    ctx.drawImage(this.lightCanvas, 0, 0);
    ctx.restore();
  }

  private renderHazards(ctx: CanvasRenderingContext2D) {
    for (const h of this.hazards) {
      ctx.save();
      const progress = h.telegraphProgress / h.telegraphMax;

      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius * progress, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();

      if (h.hasDetonated) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderRiftPillars(ctx: CanvasRenderingContext2D) {
    for (const p of this.riftPillars) {
      ctx.save();
      const pulse = Math.sin(p.pulseTimer * 3) * 6;

      // Outer aura
      ctx.beginPath();
      ctx.arc(p.x, p.y, 44 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = p.isPurified ? 'rgba(52, 211, 153, 0.18)' : `${this.level.accentColor}25`;
      ctx.fill();

      // Stone Obelisk Base (Diablo 3 gothic pillar)
      ctx.beginPath();
      ctx.arc(p.x, p.y, 32, 0, Math.PI * 2);
      ctx.fillStyle = p.isPurified ? '#064e3b' : '#111827';
      ctx.fill();
      ctx.strokeStyle = p.isPurified ? '#10b981' : this.level.accentColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Carved Runes
      ctx.fillStyle = p.isPurified ? '#34d399' : '#f87171';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fill();

      if (!p.isPurified) {
        const barW = 52;
        const barH = 5;
        const hpPercent = Math.max(0, p.hp / p.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(p.x - barW / 2, p.y - 48, barW, barH);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x - barW / 2, p.y - 48, barW * hpPercent, barH);
      }
      ctx.restore();
    }
  }

  private renderHiddenRelic(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const relic = this.hiddenRelic;
    const time = performance.now() * 0.002;

    if (this.isRelicUnearthed) {
      ctx.beginPath();
      ctx.arc(relic.x, relic.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      const pDist = Math.hypot(this.player.x - relic.x, this.player.y - relic.y);
      const isNear = pDist < 250;

      ctx.translate(relic.x, relic.y);
      ctx.rotate(time);

      ctx.beginPath();
      ctx.arc(0, 0, isNear ? 26 : 14, 0, Math.PI * 2);
      ctx.fillStyle = isNear ? 'rgba(251, 191, 36, 0.4)' : 'rgba(147, 51, 234, 0.18)';
      ctx.fill();
      ctx.strokeStyle = isNear ? '#fbbf24' : '#a855f7';
      ctx.lineWidth = isNear ? 3 : 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      if (isNear) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.fillText('RELIQUIA OCULTA [F]', 0, -34);
      }
    }
    ctx.restore();
  }

  private renderDrops(ctx: CanvasRenderingContext2D) {
    for (const drop of this.dropItems) {
      ctx.save();
      if (drop.type === 'health') {
        // Diablo 3 Red Health Globe on floor
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (drop.type === 'chrono_scrap') {
        // Gold pile
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (drop.type === 'pandorum_shard') {
        ctx.save();
        ctx.translate(drop.x, drop.y);
        ctx.rotate(performance.now() * 0.002);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(-14, -14, 28, 28);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-14, -14, 28, 28);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      ctx.save();

      // Directional drop shadow
      ctx.beginPath();
      ctx.ellipse(e.x + 3, e.y + e.radius - 2, e.radius, e.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();

      // Telegraph attack line
      if (e.state === 'telegraphing' && e.targetPos) {
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.targetPos.x, e.targetPos.y);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
      }

      // Draw Monster Silhouette (Diablo 3 Spiky Demon style)
      if (e.enemyType === 'boss') {
        this.renderBossModel(ctx, e);
      } else if (e.enemyType === 'drakthul_herald') {
        this.renderHeraldModel(ctx, e);
      } else {
        this.renderMinionModel(ctx, e);
      }

      // Monster HP Bar
      const barW = e.radius * 2 + 10;
      const barH = 5;
      const hpRatio = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 12, barW, barH);
      ctx.fillStyle = e.enemyType === 'boss' ? '#dc2626' : '#ef4444';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 12, barW * hpRatio, barH);

      ctx.restore();
    }
  }

  private renderMinionModel(ctx: CanvasRenderingContext2D, e: EnemyEntity) {
    const time = performance.now() * 0.003;
    const walk = e.walkTimer || 0;

    if (e.enemyType === 'void_stalker') {
      // 1. VOID STALKER: Quadrupedal Cyber-Arachnid Stalker
      ctx.save();
      ctx.translate(e.x, e.y);
      const faceAngle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      ctx.rotate(faceAngle);

      // Spider legs (4 articulated metallic hydraulic legs)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      [-1, 1].forEach(side => {
        // Front leg
        const legPhase1 = Math.sin(walk * 2 + side) * 8;
        ctx.beginPath();
        ctx.moveTo(4, side * 6);
        ctx.lineTo(12, side * 14 + legPhase1);
        ctx.lineTo(18, side * 20 + legPhase1);
        ctx.stroke();

        // Rear leg
        const legPhase2 = Math.cos(walk * 2 + side) * 8;
        ctx.beginPath();
        ctx.moveTo(-6, side * 6);
        ctx.lineTo(-14, side * 16 + legPhase2);
        ctx.lineTo(-20, side * 18 + legPhase2);
        ctx.stroke();
      });

      // Cyber Chassis Carapace
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cyclops optical scanning eye
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(8, -2, 4, 4);

      // Barbed stinger tail
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-18, Math.sin(time * 5) * 6, -22, 0);
      ctx.stroke();

      ctx.restore();
    } else if (e.enemyType === 'chaos_caster') {
      // 2. CHAOS CASTER: Levitating Cultist Sorcerer with floating book
      ctx.save();
      ctx.translate(e.x, e.y);
      const floatY = Math.sin(time * 3 + e.x * 0.1) * 4;

      // Shredded tattered robe hem
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.moveTo(-10, 8 + floatY);
      ctx.lineTo(0, -12 + floatY);
      ctx.lineTo(10, 8 + floatY);
      ctx.lineTo(6, 14 + floatY);
      ctx.lineTo(-4, 16 + floatY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Occult Hood & Bone Skull Mask
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.arc(0, -12 + floatY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-3, -14 + floatY, 6, 5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-2, -13 + floatY, 1.5, 1.5);
      ctx.fillRect(1, -13 + floatY, 1.5, 1.5);

      // Floating Chaos Grimoire / Catalyst
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(10, -4 + floatY + Math.sin(time * 4) * 3, 7, 10);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, -4 + floatY + Math.sin(time * 4) * 3, 7, 10);

      // Hand casting purple flames
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(-8, -2 + floatY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      // 3. SHADOW MINION: Ethereal Void Wraith with Scythe
      ctx.save();
      ctx.translate(e.x, e.y);
      const sway = Math.sin(time * 4 + e.y * 0.05) * 3;

      // Smoky ethereal ghost cowl
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.quadraticCurveTo(-14 + sway, 0, -4, -14);
      ctx.lineTo(4, -14);
      ctx.quadraticCurveTo(14 - sway, 0, 10, 10);
      ctx.quadraticCurveTo(0, 16 + sway, -10, 10);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Skeletal ribcage hints
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      [-4, 0, 4].forEach(ry => {
        ctx.beginPath();
        ctx.moveTo(-5, ry);
        ctx.lineTo(5, ry);
        ctx.stroke();
      });

      // Glowing crimson eye sockets
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -11, 2, 2);
      ctx.fillRect(2, -11, 2, 2);

      // Curved shadow soul scythe
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-6, 16);
      ctx.stroke();

      // Scythe blade
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-6, -4, 10, Math.PI, Math.PI * 1.6);
      ctx.stroke();

      ctx.restore();
    }
  }

  private renderHeraldModel(ctx: CanvasRenderingContext2D, e: EnemyEntity) {
    // DRAKTHUL HERALD: Heavy Armored Spiked Dark Juggernaut
    const time = performance.now() * 0.003;
    const walk = e.walkTimer || 0;
    const stride = Math.sin(walk * 1.8) * 6;

    ctx.save();
    ctx.translate(e.x, e.y);

    // Heavy iron greaves & boots
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-10, 6 + stride, 8, 12);
    ctx.fillRect(2, 6 - stride, 8, 12);
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, 6 + stride, 8, 12);
    ctx.strokeRect(2, 6 - stride, 8, 12);

    // Torso with black iron cuirass and molten red ribs
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Spiked Pauldrons
    ctx.fillStyle = '#450a0a';
    [-18, 10].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(px, -8);
      ctx.lineTo(px + 4, -18);
      ctx.lineTo(px + 8, -8);
      ctx.fill();
    });

    // Barbute Helmet with glowing visor slit
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-5, -14, 10, 2.5);

    // Massive Two-Handed Spiked War Maul
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -18);
    ctx.lineTo(14, 16);
    ctx.stroke();

    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(10, -24, 14, 10);
    ctx.strokeStyle = '#f87171';
    ctx.strokeRect(10, -24, 14, 10);

    ctx.restore();
  }

  private renderBossModel(ctx: CanvasRenderingContext2D, boss: EnemyEntity) {
    const isDrakthul = boss.name === 'DRAKTHUL';
    const isVexira = boss.enemyType === 'vexira_boss' || boss.name.includes('Vexira');
    const time = performance.now() * 0.003;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    if (isDrakthul) {
      // --- DRAKTHUL: EL DESTRUCTOR MULTIVERSAL ---
      // 1. Dark Singularity Aura
      ctx.save();
      ctx.rotate(boss.specialRingAngle || 0);
      ctx.beginPath();
      ctx.arc(0, 0, boss.radius + 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 10]);
      ctx.stroke();
      ctx.restore();

      // 2. Billowing Shredded Crimson Battle Cape
      const capeWave = Math.sin(time * 3) * 8;
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(-22, 10);
      ctx.quadraticCurveTo(-38 + capeWave, 35, -20, 50);
      ctx.lineTo(20, 50);
      ctx.quadraticCurveTo(38 + capeWave, 35, 22, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Heavy Armored Legs & Spiked Greaves
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-18, 14, 14, 24);
      ctx.fillRect(4, 14, 14, 24);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(-18, 14, 14, 24);
      ctx.strokeRect(4, 14, 14, 24);

      // 4. Massive Obsidian Demon Plate Torso with Glowing Magma Fissures
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Molten magma fissures in chest
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(-8, -4);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 16);
      ctx.stroke();

      // Central Eye of Chaos
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Spiked Shoulder Pauldrons (3 jagged horns on each shoulder)
      [-1, 1].forEach(side => {
        [-12, -4, 4].forEach((offset, idx) => {
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.moveTo(side * (24 + idx * 3), offset);
          ctx.lineTo(side * (36 + idx * 4), offset - 14);
          ctx.lineTo(side * (24 + idx * 3), offset + 6);
          ctx.fill();
        });
      });

      // 6. Drakthul Head with 6 Barbed Obsidian Crown Horns & White Hair
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, -22, 13, 0, Math.PI * 2);
      ctx.fill();

      // Silver hair spilling over shoulders
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-14, -20, 4, 18);
      ctx.fillRect(10, -20, 4, 18);

      // Horned obsidian crown (6 horns)
      ctx.fillStyle = '#09090b';
      [-14, -8, -2, 4, 10, 16].forEach(ox => {
        ctx.beginPath();
        ctx.moveTo(ox - 3, -30);
        ctx.lineTo(ox, -46);
        ctx.lineTo(ox + 3, -30);
        ctx.fill();
      });

      // Fierce demonic red eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, -23, 3, 2.5);
      ctx.fillRect(2, -23, 3, 2.5);

      // 7. Left Hand: Floating Dark Singularity of Chaos
      ctx.save();
      const singX = -38;
      const singY = -6;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(singX, singY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Orbiting shattered planetoids
      for (let i = 0; i < 3; i++) {
        const poAng = time * 3 + (Math.PI * 2 / 3) * i;
        ctx.fillStyle = '#f87171';
        ctx.fillRect(singX + Math.cos(poAng) * 18 - 3, singY + Math.sin(poAng) * 18 - 3, 5, 5);
      }
      ctx.restore();

      // 8. Right Hand: Abyssal Chaos Claymore
      ctx.save();
      const swordX = 34;
      const swordY = -12;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(swordX, swordY - 45);
      ctx.lineTo(swordX, swordY + 35);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(swordX - 5, swordY - 40);
      ctx.lineTo(swordX + 5, swordY - 40);
      ctx.lineTo(swordX, swordY - 52);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.restore();
    } else if (isVexira) {
      // --- VEXIRA: LA SOMBRA ETERNA ---
      // Flowing obsidian shadow dress with trailing purple mist
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(-16, 6);
      ctx.lineTo(0, -22);
      ctx.lineTo(16, 6);
      ctx.lineTo(24, 38);
      ctx.lineTo(-24, 38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sweeping Ram Horns
      ctx.fillStyle = '#3b0764';
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(side * 8, -26);
        ctx.quadraticCurveTo(side * 28, -36, side * 22, -18);
        ctx.quadraticCurveTo(side * 18, -24, side * 8, -22);
        ctx.fill();
      });

      // Eyes & void claws
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-4, -22, 2.5, 2);
      ctx.fillRect(2, -22, 2.5, 2);

      // Mini shadow vortex portal
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, -20, 24, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Standard Level Boss Construct / Demon
      ctx.fillStyle = boss.color;
      ctx.beginPath();
      ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spiked crown
      ctx.fillStyle = '#450a0a';
      [-14, -4, 4, 14].forEach(ox => {
        ctx.beginPath();
        ctx.moveTo(ox - 3, -boss.radius);
        ctx.lineTo(ox, -boss.radius - 14);
        ctx.lineTo(ox + 3, -boss.radius);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  private renderCompanion(ctx: CanvasRenderingContext2D) {
    const comp = this.companion;
    const time = performance.now() * 0.003;
    const floatY = Math.sin(time * 3 + this.companionFloatTimer) * 5;

    ctx.save();
    ctx.translate(this.companionX, this.companionY + floatY);

    // Directional drop shadow under companion
    ctx.beginPath();
    ctx.ellipse(0, 22 - floatY, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    if (comp.id === 'lysara') {
      // 1. LYSARA — La Guardiana Arcana (Lavender Sorceress)
      // Flowing violet gown
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.lineTo(0, -18);
      ctx.lineTo(10, 4);
      ctx.lineTo(14, 22);
      ctx.lineTo(-14, 22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Torso & silver-purple hair
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(-6, -16, 12, 14);
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(-8, -22, 16, 8);

      // Arcane tiara
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-5, -25, 10, 3);

      // Twin rotating arcane rune rings around hands
      ctx.save();
      ctx.rotate(time * 2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-18, -12, 36, 24);
      ctx.restore();

      // Floating Arcane Crystals
      ctx.fillStyle = '#e879f9';
      ctx.fillRect(-22, -6, 5, 5);
      ctx.fillRect(17, -6, 5, 5);
    } else if (comp.id === 'x7') {
      // 2. X-7 — El Ciber-Sabio (Cyber-Mage Android)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, -12, 20, 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -12, 20, 24);

      // Cyber cowl & glowing visor scanner
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, -16, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, -17, 12, 3);

      // Floating Holographic Telemetry Screen
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(14, -20, 16, 22);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(14, -20, 16, 22);

      // Code line tickers
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(16, -16, 12, 1.5);
      ctx.fillRect(16, -12, 9, 1.5);
      ctx.fillRect(16, -8, 11, 1.5);
    } else if (comp.id === 'orion') {
      // 3. ORION — El Sabio Eterno (Ancient Wise Elder Seer)
      // Hooded forest green robe
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.moveTo(-11, 6);
      ctx.lineTo(0, -16);
      ctx.lineTo(11, 6);
      ctx.lineTo(13, 20);
      ctx.lineTo(-13, 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Long flowing snow-white beard
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(-5, -10);
      ctx.lineTo(5, -10);
      ctx.lineTo(0, 10);
      ctx.fill();

      // Pointed ears
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(-15, -17);
      ctx.lineTo(-8, -11);
      ctx.fill();

      // Gnarled Wooden Staff with Emerald Crystal
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, -24);
      ctx.lineTo(14, 18);
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(14, -24, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (comp.id === 'esmerald') {
      // 4. ESMERALD — La Cruzada Celestial (Golden Winged Crusader)
      const wingSpread = Math.sin(time * 4) * 0.35;

      // Two Flapping Golden Feathered Wings
      [-1, 1].forEach(side => {
        ctx.save();
        ctx.rotate(side * wingSpread);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(side * 6, -10);
        ctx.quadraticCurveTo(side * 28, -28, side * 34, -4);
        ctx.quadraticCurveTo(side * 20, 6, side * 8, 2);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // Winged Golden Cuirass
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -12, 14, 22);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(-7, -12, 14, 22);

      // Crimson hair
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -20, 12, 7);

      // Raised Holy Flaming Blade
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(12, -28);
      ctx.lineTo(12, 12);
      ctx.stroke();
    } else if (comp.id === 'nexus') {
      // 5. NEXUS — El Oráculo Cósmico (Cosmic Celestial Feline)
      // Star-speckled nebula feline body
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pointed glowing cat ears
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.moveTo(-7, -6);
      ctx.lineTo(-10, -15);
      ctx.lineTo(-4, -8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(7, -6);
      ctx.lineTo(10, -15);
      ctx.lineTo(4, -8);
      ctx.fill();

      // Swishing starlit tail
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.quadraticCurveTo(-18, Math.sin(time * 5) * 8, -22, -4);
      ctx.stroke();

      // Dual rotating astrological gyroscope rings
      ctx.save();
      ctx.rotate(time * 1.5);
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private renderZeynthar(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const time = performance.now() * 0.003;
    const walk = p.walkTimer || 0;
    const stride = Math.sin(walk) * 5;

    ctx.save();

    // 1. Realistic Directional Drop Shadow
    ctx.beginPath();
    ctx.ellipse(p.x + 4, p.y + p.radius - 2, p.radius * 1.15, p.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();

    // 2. Chrono-Stasis Matrix Field
    if (this.chronoStasisTimer > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius + 40, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // 3. Escudo de Matriz Cósmica (Reflective Barrier)
    if (p.specialActiveTimer > 0) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time);
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(192, 132, 252, 0.22)';
      ctx.fill();
      ctx.restore();
    }

    if (p.isInvulnerable > 0 && Math.floor(performance.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // 4. Orbiting Constellation Astrological Halo Ring
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(time * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.restore();

    // 5. Zeynthar Character Body: Real Anatomical Silhouette
    ctx.save();
    ctx.translate(p.x, p.y);

    // Billowing Royal Cape with cloth inertia
    const capeAngle = p.facingAngle + Math.PI;
    const wave = Math.sin(time * 4) * 4;
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.moveTo(Math.cos(capeAngle - 0.7) * 14, Math.sin(capeAngle - 0.7) * 14);
    ctx.quadraticCurveTo(
      Math.cos(capeAngle) * (26 + wave),
      Math.sin(capeAngle) * (26 + wave),
      Math.cos(capeAngle + 0.7) * 14,
      Math.sin(capeAngle + 0.7) * 14
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Walking Boots & Greaves
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-10, 8 + stride, 8, 12);
    ctx.fillRect(2, 8 - stride, 8, 12);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, 8 + stride, 8, 12);
    ctx.strokeRect(2, 8 - stride, 8, 12);

    // Archmage Robe & Tunic with Gold Embroidery
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Central Glowing Arcane Core
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Pauldrons (Shoulder Plates)
    ctx.fillStyle = '#78350f';
    [-14, 8].forEach(px => {
      ctx.fillRect(px, -12, 6, 8);
      ctx.strokeStyle = '#facc15';
      ctx.strokeRect(px, -12, 6, 8);
    });

    // Archmage Cowl Hood & Silver Hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Flowing silver locks
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-11, -10, 3, 12);
    ctx.fillRect(8, -10, 3, 12);

    // Piercing Glowing Cyan Eyes
    const eyeOffsetX = Math.cos(p.facingAngle) * 5;
    const eyeOffsetY = Math.sin(p.facingAngle) * 5;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-3 + eyeOffsetX, -14 + eyeOffsetY, 2.5, 2);
    ctx.fillRect(1 + eyeOffsetX, -14 + eyeOffsetY, 2.5, 2);

    // Left Hand: Golden Arcane Staff with pulsing crystal
    const staffAng = p.facingAngle + 0.5;
    const staffX = Math.cos(staffAng) * 20;
    const staffY = Math.sin(staffAng) * 20;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(staffX - Math.cos(p.facingAngle) * 12, staffY - Math.sin(p.facingAngle) * 12);
    ctx.lineTo(staffX + Math.cos(p.facingAngle) * 22, staffY + Math.sin(p.facingAngle) * 22);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(
      staffX + Math.cos(p.facingAngle) * 22,
      staffY + Math.sin(p.facingAngle) * 22,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Right Hand: 3D Holographic Multiverse Sphere (from user artwork)
    const orbAng = p.facingAngle - 0.5;
    const orbX = Math.cos(orbAng) * 22;
    const orbY = Math.sin(orbAng) * 22;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.arc(orbX, orbY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(orbX, orbY);
    ctx.rotate(time * 2);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Trailing glow
      ctx.beginPath();
      ctx.arc(p.x - p.vx * 0.4, p.y - p.vy * 0.4, p.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}88`;
      ctx.fill();
      ctx.restore();
    }
  }

  private renderCombatText(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const dn of this.damageNumbers) {
      const alpha = dn.life / dn.maxLife;
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';

      if (dn.isCrit) {
        ctx.font = 'bold 20px "Cinzel", serif';
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.strokeText(`¡CRÍTICO! ${dn.value}`, dn.x, dn.y);
        ctx.fillText(`¡CRÍTICO! ${dn.value}`, dn.x, dn.y);
      } else {
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = dn.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeText(`${dn.value}`, dn.x, dn.y);
        ctx.fillText(`${dn.value}`, dn.x, dn.y);
      }
    }
    ctx.restore();
  }
}
