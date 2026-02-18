import Phaser from 'phaser';
import { GAME } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const centerX = GAME.WIDTH / 2;
    
    // Dark overlay
    this.cameras.main.setBackgroundColor(0x0a0a0a);
    
    // Game Over title
    this.add.text(centerX, 150, '💀 BURNOUT 💀', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      fill: '#ef4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(centerX, 220, 'Your cortisol levels maxed out', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#9ca3af',
    }).setOrigin(0.5);
    
    // Stats
    const stats = [
      { label: 'FINAL SCORE', value: gameState.score, color: '#fbbf24' },
      { label: 'TIME SURVIVED', value: `${gameState.timeSurvived.toFixed(1)}s`, color: '#60a5fa' },
      { label: 'STRESSORS DODGED', value: gameState.stressorsDodged, color: '#4ade80' },
      { label: 'DIFFICULTY REACHED', value: `Level ${gameState.difficulty}`, color: '#f472b6' },
    ];
    
    stats.forEach((stat, i) => {
      this.add.text(centerX - 100, 320 + i * 50, stat.label, {
        fontSize: '16px',
        fontFamily: 'Arial',
        fill: '#6b7280',
      }).setOrigin(0, 0.5);
      
      this.add.text(centerX + 100, 320 + i * 50, String(stat.value), {
        fontSize: '24px',
        fontFamily: 'Arial Black',
        fill: stat.color,
      }).setOrigin(1, 0.5);
    });
    
    // High score check
    const isNewHighScore = gameState.score === gameState.highScore && gameState.score > 0;
    
    if (isNewHighScore) {
      const newRecord = this.add.text(centerX, 550, '🏆 NEW HIGH SCORE! 🏆', {
        fontSize: '28px',
        fontFamily: 'Arial Black',
        fill: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: newRecord,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else if (gameState.highScore > 0) {
      this.add.text(centerX, 550, `High Score: ${gameState.highScore}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        fill: '#9ca3af',
      }).setOrigin(0.5);
    }
    
    // Motivational/meme messages
    const messages = [
      'Maybe try some deep breathing? 🧘',
      'Have you considered touching grass? 🌱',
      'Your inbox will still be there tomorrow 📧',
      'This is fine. Everything is fine. 🔥',
      '"Just one more email" they said... 💀',
      'Cortisol built different today 😤',
      'Skill issue tbh 🎮',
      'Try turning your stress off and on again 🔄',
    ];
    
    const randomMessage = Phaser.Utils.Array.GetRandom(messages);
    this.add.text(centerX, 620, randomMessage, {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#6b7280',
      fontStyle: 'italic',
    }).setOrigin(0.5);
    
    // Retry button
    const retryBtn = this.add.text(centerX, 720, '[ TAP TO RETRY ]', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      fill: '#4ade80',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: retryBtn,
      scale: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Menu button
    const menuBtn = this.add.text(centerX, 780, '[ MENU ]', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fill: '#9ca3af',
    }).setOrigin(0.5);
    
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover', () => menuBtn.setFill('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setFill('#9ca3af'));
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // Retry on tap (anywhere except menu button)
    this.input.on('pointerdown', (pointer) => {
      // Check if clicking menu button area
      if (pointer.y < 760) {
        this.retry();
      }
    });
    
    // Keyboard retry
    this.input.keyboard.once('keydown-SPACE', () => {
      this.retry();
    });
    
    this.input.keyboard.once('keydown-ENTER', () => {
      this.retry();
    });
    
    // Dead player sprite
    const deadPlayer = this.add.image(centerX, 850, 'player-panicked');
    deadPlayer.setScale(3);
    deadPlayer.setAngle(90);
    deadPlayer.setAlpha(0.7);
    
    // Credits
    this.add.text(centerX, GAME.HEIGHT - 30, 'Cortisol Dodge by Fujiwara Tofu Shop', {
      fontSize: '12px',
      fontFamily: 'Arial',
      fill: '#4b5563',
    }).setOrigin(0.5);
  }

  retry() {
    gameState.reset();
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
