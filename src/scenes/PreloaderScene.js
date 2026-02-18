import Phaser from 'phaser';
import { renderPixelArt, renderSpriteSheet } from '../core/PixelRenderer.js';
import { PALETTE, STRESSOR_PALETTE } from '../sprites/palette.js';
import { PLAYER_IDLE, PLAYER_LEFT, PLAYER_RIGHT, PLAYER_STRESSED, PLAYER_PANICKED } from '../sprites/player.js';
import { STRESSOR_SPRITES } from '../sprites/stressors.js';
import { GAME } from '../core/Constants.js';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  create() {
    // Show loading text
    const loadText = this.add.text(
      GAME.WIDTH / 2, 
      GAME.HEIGHT / 2, 
      'Loading...',
      { fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial' }
    ).setOrigin(0.5);

    // Generate player sprites
    renderPixelArt(this, PLAYER_IDLE, PALETTE, 'player-idle', 2);
    renderPixelArt(this, PLAYER_LEFT, PALETTE, 'player-left', 2);
    renderPixelArt(this, PLAYER_RIGHT, PALETTE, 'player-right', 2);
    renderPixelArt(this, PLAYER_STRESSED, PALETTE, 'player-stressed', 2);
    renderPixelArt(this, PLAYER_PANICKED, PALETTE, 'player-panicked', 2);

    // Generate stressor sprites
    Object.entries(STRESSOR_SPRITES).forEach(([key, pixels]) => {
      renderPixelArt(this, pixels, STRESSOR_PALETTE, `stressor-${key}`, 3);
    });

    // Create player animation frames for spritesheet
    const playerFrames = [PLAYER_IDLE, PLAYER_LEFT, PLAYER_IDLE, PLAYER_RIGHT];
    renderSpriteSheet(this, playerFrames, PALETTE, 'player-walk', 2);

    // Create walk animation
    this.anims.create({
      key: 'player-walk',
      frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    // Short delay then start menu
    this.time.delayedCall(500, () => {
      loadText.destroy();
      this.scene.start('MenuScene');
    });
  }
}
