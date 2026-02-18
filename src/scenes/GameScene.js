import Phaser from 'phaser';
import { GAME, PLAYER, CORTISOL, SPAWN, STRESSOR_TYPES, COLORS } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';
import { eventBus, Events } from '../core/EventBus.js';
import { addPoints, savePoints } from '../playfun.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor(GAME.BG_COLOR);
    
    // Create gradient background effect
    this.createBackground();
    
    // Player setup
    this.createPlayer();
    
    // Input setup
    this.setupInput();
    
    // Stressor pool
    this.stressors = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: false,
    });
    
    // Spawn timer
    this.spawnRate = SPAWN.INITIAL_RATE;
    this.stressorSpeed = SPAWN.SPEED_INITIAL;
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnRate,
      callback: this.spawnStressor,
      callbackScope: this,
      loop: true,
    });
    
    // Difficulty ramp timer
    this.time.addEvent({
      delay: SPAWN.RATE_DECREASE_INTERVAL,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true,
    });
    
    // Collision detection - group based
    this.physics.add.overlap(
      this.player,
      this.stressors,
      this.handleCollision,
      null,
      this
    );
    
    // Game state
    gameState.isPlaying = true;
    this.invulnerable = false;
    this.dashCooldown = false;
    
    // Particle emitter for hit effects
    this.createParticles();
    
    // Start time tracking
    this.lastTime = 0;
  }

  createBackground() {
    const w = this.scale.width;
    const h = this.scale.height;
    
    // Simple gradient lines effect
    const graphics = this.add.graphics();
    for (let y = 0; y < h; y += 60) {
      const alpha = 0.02 + (y / h) * 0.03;
      graphics.lineStyle(1, 0x3b82f6, alpha);
      graphics.lineBetween(0, y, w, y);
    }
    
    // Side warning zones
    const leftZone = this.add.rectangle(30, h / 2, 60, h, 0xef4444, 0.05);
    const rightZone = this.add.rectangle(w - 30, h / 2, 60, h, 0xef4444, 0.05);
  }

  createPlayer() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.player = this.physics.add.sprite(w / 2, h - 120, 'player-idle');
    this.player.setScale(2.5);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 28);
    this.player.setDepth(10);
    
    // Player state
    this.playerState = 'idle';
  }

  setupInput() {
    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: 'A',
      right: 'D',
      dash: 'SPACE',
    });
    
    // Touch zones for mobile
    this.input.on('pointerdown', (pointer) => {
      const w = this.scale.width;
      if (pointer.x < w / 3) {
        this.touchDir = -1;
      } else if (pointer.x > w * 2 / 3) {
        this.touchDir = 1;
      } else {
        // Center tap = dash
        this.tryDash();
      }
    });
    
    this.input.on('pointerup', () => {
      this.touchDir = 0;
    });
    
    this.touchDir = 0;
  }

  createParticles() {
    // Create a simple particle texture
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(0xef4444);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture('hit-particle', 8, 8);
    gfx.destroy();
    
    this.hitEmitter = this.add.particles(0, 0, 'hit-particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      blendMode: 'ADD',
      emitting: false,
    });
  }

  spawnStressor() {
    if (!gameState.isPlaying) return;
    
    // Pick random stressor type based on weight
    const stressorType = this.getWeightedStressor();
    
    // Spawn position - random X, above screen
    const w = this.scale.width;
    const x = Phaser.Math.Between(50, w - 50);
    const y = -50;
    
    // Check if we have an inactive stressor to reuse
    let stressor = this.stressors.getFirstDead(false);
    
    if (stressor) {
      // Reuse existing sprite
      stressor.setTexture(`stressor-${stressorType.key}`);
      stressor.setActive(true);
      stressor.setVisible(true);
      stressor.setPosition(x, y);
    } else if (this.stressors.getLength() < 50) {
      // Create new sprite and add to group
      stressor = this.physics.add.sprite(x, y, `stressor-${stressorType.key}`);
      this.stressors.add(stressor);
    } else {
      return; // Pool full
    }
    
    stressor.setScale(1.5);
    stressor.setDepth(5);
    stressor.setAngle(0);
    
    // Store type data
    stressor.stressorType = stressorType;
    
    // Set velocity
    const angle = Phaser.Math.Between(-15, 15);
    const speed = this.stressorSpeed + Phaser.Math.Between(-30, 30);
    stressor.setVelocity(
      Math.sin(Phaser.Math.DegToRad(angle)) * speed * 0.3,
      speed
    );
    
    // Create or update label
    if (!stressor.label) {
      stressor.label = this.add.text(0, 0, stressorType.label, {
        fontSize: '14px',
        fontFamily: 'Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5).setDepth(6);
    } else {
      stressor.label.setText(stressorType.label);
      stressor.label.setVisible(true);
    }
    
    // Wobble animation
    this.tweens.add({
      targets: stressor,
      angle: { from: -8, to: 8 },
      duration: 400,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
    });
  }

  getWeightedStressor() {
    const totalWeight = STRESSOR_TYPES.reduce((sum, s) => sum + s.weight, 0);
    let random = Phaser.Math.Between(1, totalWeight);
    
    for (const stressor of STRESSOR_TYPES) {
      random -= stressor.weight;
      if (random <= 0) return stressor;
    }
    
    return STRESSOR_TYPES[0];
  }

  increaseDifficulty() {
    // Speed up spawning
    this.spawnRate = Math.max(SPAWN.MIN_RATE, this.spawnRate - SPAWN.RATE_DECREASE);
    
    // Increase stressor speed
    this.stressorSpeed = Math.min(SPAWN.SPEED_MAX, this.stressorSpeed + SPAWN.SPEED_INCREASE);
    
    // Update spawn timer
    this.spawnTimer.delay = this.spawnRate;
    
    gameState.difficulty++;
  }

  handleCollision(player, stressor) {
    if (this.invulnerable || !gameState.isPlaying) return;
    
    const damage = stressor.stressorType?.damage || CORTISOL.HIT_AMOUNT;
    
    // Apply damage
    const maxed = gameState.addCortisol(damage);
    eventBus.emit(Events.CORTISOL_UPDATE, gameState.cortisol);
    
    // Visual feedback
    this.hitEmitter.setPosition(player.x, player.y);
    this.hitEmitter.explode(10);
    
    // Screen shake
    this.cameras.main.shake(150, 0.01);
    
    // Flash player red
    player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      player.clearTint();
    });
    
    // Invulnerability frames
    this.invulnerable = true;
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.invulnerable = false;
        player.setAlpha(1);
      },
    });
    
    // Kill the stressor
    this.killStressor(stressor);
    
    // Show damage text
    this.showDamageText(player.x, player.y - 40, `+${damage} CORTISOL`);
    
    // Check for game over
    if (maxed) {
      this.gameOver();
    }
  }

  killStressor(stressor) {
    if (stressor.label) {
      stressor.label.setVisible(false);
    }
    stressor.setActive(false);
    stressor.setVisible(false);
    stressor.setVelocity(0, 0);
  }

  showDamageText(x, y, text) {
    const dmgText = this.add.text(x, y, text, {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      fill: '#ef4444',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: dmgText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => dmgText.destroy(),
    });
  }

  tryDash() {
    if (this.dashCooldown || !gameState.isPlaying) return;
    
    this.dashCooldown = true;
    
    // Brief invulnerability during dash
    this.invulnerable = true;
    
    // Visual effect
    this.player.setTint(0x00ffff);
    
    // Dash in current direction or forward
    const dashDir = this.player.body.velocity.x > 0 ? 1 : this.player.body.velocity.x < 0 ? -1 : 0;
    
    // Afterimage effect
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 30, () => {
        const ghost = this.add.image(this.player.x, this.player.y, this.player.texture.key);
        ghost.setScale(this.player.scaleX);
        ghost.setAlpha(0.5 - i * 0.15);
        ghost.setTint(0x00ffff);
        this.tweens.add({
          targets: ghost,
          alpha: 0,
          duration: 200,
          onComplete: () => ghost.destroy(),
        });
      });
    }
    
    this.time.delayedCall(PLAYER.DASH_DURATION, () => {
      this.invulnerable = false;
      this.player.clearTint();
    });
    
    this.time.delayedCall(PLAYER.DASH_COOLDOWN, () => {
      this.dashCooldown = false;
    });
  }

  gameOver() {
    gameState.isPlaying = false;
    
    // Stop spawning
    this.spawnTimer.destroy();
    
    // Big screen shake
    this.cameras.main.shake(500, 0.03);
    
    // Flash red
    this.cameras.main.flash(300, 255, 0, 0);
    
    // Show burnout text
    const burnoutText = this.add.text(this.scale.width / 2, this.scale.height / 2, '💀 BURNOUT 💀', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      fill: '#ef4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: burnoutText,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
    });
    
    // Transition to game over
    this.time.delayedCall(1500, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene');
    });
  }

  update(time, delta) {
    if (!gameState.isPlaying) return;
    
    const dt = delta / 1000;
    
    // Update time survived
    gameState.updateTime(dt);
    
    // Cortisol decay
    gameState.decayCortisol(dt);
    eventBus.emit(Events.CORTISOL_UPDATE, gameState.cortisol);
    
    // Player movement
    this.handleMovement();
    
    // Update player sprite based on stress level
    this.updatePlayerSprite();
    
    // Update stressor labels and cleanup
    this.updateStressors();
    
    // Update score
    eventBus.emit(Events.SCORE_UPDATE, gameState.score);
  }

  handleMovement() {
    let moveX = 0;
    
    // Keyboard
    if (this.cursors.left.isDown || this.wasd.left.isDown) moveX = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) moveX = 1;
    
    // Touch
    if (this.touchDir !== 0) moveX = this.touchDir;
    
    // Dash input
    if (Phaser.Input.Keyboard.JustDown(this.wasd.dash)) {
      this.tryDash();
    }
    
    // Apply movement
    const speed = this.dashCooldown ? PLAYER.SPEED * 0.8 : PLAYER.SPEED;
    this.player.setVelocityX(moveX * speed);
    
    // Update sprite direction
    if (moveX < 0) {
      this.player.setTexture('player-left');
    } else if (moveX > 0) {
      this.player.setTexture('player-right');
    } else if (gameState.cortisol < CORTISOL.SPIKE_THRESHOLD) {
      this.player.setTexture('player-idle');
    }
  }

  updatePlayerSprite() {
    const cortisol = gameState.cortisol;
    
    // Change sprite based on stress level
    if (this.player.body.velocity.x === 0) {
      if (cortisol >= 80) {
        this.player.setTexture('player-panicked');
      } else if (cortisol >= 50) {
        this.player.setTexture('player-stressed');
      }
    }
  }

  updateStressors() {
    this.stressors.getChildren().forEach(stressor => {
      if (!stressor.active) return;
      
      // Update label position
      if (stressor.label) {
        stressor.label.setPosition(stressor.x, stressor.y - 35);
      }
      
      // Kill if off screen - dodged successfully!
      if (stressor.y > this.scale.height + 50) {
        this.killStressor(stressor);
        gameState.incrementDodged();
        addPoints(10); // Play.fun points for dodging
      }
    });
  }
}
