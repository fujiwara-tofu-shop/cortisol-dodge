import Phaser from 'phaser';
import { GAME } from './core/Constants.js';
import BootScene from './scenes/BootScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { initPlayFun } from './playfun.js';

// Detect if mobile (portrait) or desktop (landscape)
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                 (navigator.maxTouchPoints > 1);
const isPortrait = window.innerHeight > window.innerWidth;

// Use different dimensions based on device/orientation
// Mobile: 540x960 (portrait)
// Desktop: 960x540 (landscape) or larger
let gameWidth = GAME.WIDTH;
let gameHeight = GAME.HEIGHT;

if (!isMobile && !isPortrait) {
  // Desktop landscape - swap dimensions for better fit
  gameWidth = 800;
  gameHeight = 600;
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  parent: 'game-container',
  backgroundColor: GAME.BG_COLOR,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 480,
    },
    max: {
      width: 1280,
      height: 960,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloaderScene,
    MenuScene,
    GameScene,
    UIScene,
    GameOverScene,
  ],
};

// Start the game
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  
  // Initialize Play.fun SDK (non-blocking)
  initPlayFun().catch(err => console.warn('Play.fun init failed:', err));
});
