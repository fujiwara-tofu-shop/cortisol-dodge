import Phaser from 'phaser';
import { GAME, COLORS } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const centerX = GAME.WIDTH / 2;
    
    // Background
    this.cameras.main.setBackgroundColor(GAME.BG_COLOR);
    
    // Title
    this.add.text(centerX, 150, '😰 CORTISOL', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      fill: '#ef4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);
    
    this.add.text(centerX, 220, 'DODGE', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle / meme reference
    this.add.text(centerX, 300, '"This raised my cortisol levels"', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fill: '#9ca3af',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Instructions
    const instructions = [
      '← → or A/D to move',
      'SPACE to panic dash',
      'Avoid the stressors!',
      'Don\'t let your cortisol max out',
    ];
    
    instructions.forEach((text, i) => {
      this.add.text(centerX, 400 + i * 30, text, {
        fontSize: '18px',
        fontFamily: 'Arial',
        fill: '#d1d5db',
      }).setOrigin(0.5);
    });

    // High score
    if (gameState.highScore > 0) {
      this.add.text(centerX, 550, `High Score: ${gameState.highScore}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        fill: '#fbbf24',
      }).setOrigin(0.5);
    }

    // Play button
    const playBtn = this.add.text(centerX, 650, '[ TAP TO PLAY ]', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      fill: '#4ade80',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: playBtn,
      scale: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Make entire screen clickable
    this.input.once('pointerdown', () => {
      this.startGame();
    });

    // Keyboard start
    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });

    // Player preview
    const player = this.add.image(centerX, 800, 'player-idle');
    player.setScale(3);
    
    // Floating animation
    this.tweens.add({
      targets: player,
      y: 810,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Credits
    this.add.text(centerX, GAME.HEIGHT - 30, 'A meme by Fujiwara Tofu Shop', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#6b7280',
    }).setOrigin(0.5);
  }

  startGame() {
    gameState.reset();
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
