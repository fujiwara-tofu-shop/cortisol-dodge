import Phaser from 'phaser';
import { GAME, UI, CORTISOL, COLORS } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';
import { eventBus, Events } from '../core/EventBus.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const centerX = w / 2;
    
    // Cortisol label
    this.add.text(centerX, 25, '😰 CORTISOL', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      fill: '#ffffff',
    }).setOrigin(0.5);
    
    // Cortisol bar background
    this.barBg = this.add.rectangle(
      centerX,
      UI.BAR_Y,
      UI.BAR_WIDTH,
      UI.BAR_HEIGHT,
      COLORS.CORTISOL_BAR_BG
    ).setOrigin(0.5);
    
    // Cortisol bar border
    const border = this.add.rectangle(
      centerX,
      UI.BAR_Y,
      UI.BAR_WIDTH + 4,
      UI.BAR_HEIGHT + 4
    ).setOrigin(0.5);
    border.setStrokeStyle(2, 0xffffff);
    
    // Cortisol bar fill
    this.barFill = this.add.rectangle(
      centerX - UI.BAR_WIDTH / 2,
      UI.BAR_Y,
      0,
      UI.BAR_HEIGHT - 4,
      COLORS.CORTISOL_BAR_LOW
    ).setOrigin(0, 0.5);
    
    // Cortisol percentage text
    this.cortisolText = this.add.text(centerX, UI.BAR_Y, '0%', {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    // Score
    this.scoreText = this.add.text(centerX, UI.SCORE_Y, 'SCORE: 0', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    // Stressors dodged
    this.dodgedText = this.add.text(w - 20, 25, '✓ 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#4ade80',
    }).setOrigin(1, 0);
    
    // Time survived
    this.timeText = this.add.text(20, 25, '⏱ 0.0s', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#60a5fa',
    }).setOrigin(0, 0);
    
    // Warning overlay (hidden by default)
    this.warningOverlay = this.add.rectangle(
      centerX,
      h / 2,
      w,
      h,
      0xff0000,
      0
    );
    
    // Dash cooldown indicator
    this.dashIndicator = this.add.text(centerX, h - 40, '[ SPACE: PANIC DASH ]', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#4ade80',
    }).setOrigin(0.5);
    
    // Event listeners
    this.cleanupFns = [];
    
    this.cleanupFns.push(
      eventBus.on(Events.CORTISOL_UPDATE, (value) => this.updateCortisol(value))
    );
    
    this.cleanupFns.push(
      eventBus.on(Events.SCORE_UPDATE, (value) => this.updateScore(value))
    );
  }

  updateCortisol(value) {
    const percentage = value / CORTISOL.MAX;
    const fillWidth = (UI.BAR_WIDTH - 4) * percentage;
    
    this.barFill.setSize(fillWidth, UI.BAR_HEIGHT - 4);
    this.cortisolText.setText(`${Math.round(value)}%`);
    
    // Color based on level
    let color;
    if (percentage < 0.3) {
      color = COLORS.CORTISOL_BAR_LOW;
    } else if (percentage < 0.6) {
      color = COLORS.CORTISOL_BAR_MED;
    } else if (percentage < 0.8) {
      color = COLORS.CORTISOL_BAR_HIGH;
    } else {
      color = COLORS.CORTISOL_BAR_CRITICAL;
    }
    
    this.barFill.setFillStyle(color);
    
    // Warning overlay when high
    if (percentage >= 0.8) {
      this.warningOverlay.setAlpha(0.1 + Math.sin(Date.now() / 100) * 0.05);
      
      // Pulse effect on bar
      if (!this.barPulse) {
        this.barPulse = this.tweens.add({
          targets: this.barFill,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          repeat: -1,
        });
      }
    } else {
      this.warningOverlay.setAlpha(0);
      if (this.barPulse) {
        this.barPulse.destroy();
        this.barPulse = null;
        this.barFill.setScale(1);
      }
    }
    
    // Update dodged count and time
    this.dodgedText.setText(`✓ ${gameState.stressorsDodged}`);
    this.timeText.setText(`⏱ ${gameState.timeSurvived.toFixed(1)}s`);
  }

  updateScore(value) {
    this.scoreText.setText(`SCORE: ${value}`);
  }

  shutdown() {
    // Cleanup event listeners
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }
}
