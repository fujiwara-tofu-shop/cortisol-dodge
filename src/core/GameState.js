import { CORTISOL } from './Constants.js';

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.cortisol = 0;
    this.score = 0;
    this.stressorsDodged = 0;
    this.timeSurvived = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.highScore = this.highScore || 0;
    this.difficulty = 1;
  }

  addCortisol(amount) {
    this.cortisol = Math.min(CORTISOL.MAX, this.cortisol + amount);
    return this.cortisol >= CORTISOL.MAX;
  }

  decayCortisol(delta) {
    this.cortisol = Math.max(0, this.cortisol - CORTISOL.DECAY_RATE * delta);
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  incrementDodged() {
    this.stressorsDodged++;
    this.addScore(10);
  }

  updateTime(delta) {
    this.timeSurvived += delta;
    // Score increases with time
    this.addScore(Math.floor(delta * 10));
  }
}

export const gameState = new GameState();
