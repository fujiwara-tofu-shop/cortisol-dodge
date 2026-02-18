import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const WIDTH = 1200;
const HEIGHT = 630;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background - dark gradient
const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
gradient.addColorStop(0, '#1a1a2e');
gradient.addColorStop(1, '#0f0f23');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Add some stress lines / visual noise
ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
ctx.lineWidth = 2;
for (let i = 0; i < 20; i++) {
  const y = Math.random() * HEIGHT;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(WIDTH, y + (Math.random() - 0.5) * 100);
  ctx.stroke();
}

// Title - CORTISOL
ctx.fillStyle = '#ef4444';
ctx.font = 'bold 120px Arial Black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Add shadow
ctx.shadowColor = '#000000';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;

ctx.fillText('😰 CORTISOL', WIDTH / 2, 200);

// DODGE
ctx.fillStyle = '#ffffff';
ctx.fillText('DODGE', WIDTH / 2, 340);

// Reset shadow
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Subtitle / meme reference
ctx.fillStyle = '#9ca3af';
ctx.font = 'italic 36px Arial';
ctx.fillText('"This raised my cortisol levels"', WIDTH / 2, 440);

// Instructions
ctx.fillStyle = '#6b7280';
ctx.font = '28px Arial';
ctx.fillText('Dodge the stressors. Don\'t let your cortisol max out.', WIDTH / 2, 520);

// Stress meter bar at bottom
const barWidth = 600;
const barHeight = 30;
const barX = (WIDTH - barWidth) / 2;
const barY = HEIGHT - 80;

// Bar background
ctx.fillStyle = '#333333';
ctx.fillRect(barX, barY, barWidth, barHeight);

// Bar fill (80% - danger zone)
const fillGradient = ctx.createLinearGradient(barX, 0, barX + barWidth * 0.8, 0);
fillGradient.addColorStop(0, '#4ade80');
fillGradient.addColorStop(0.4, '#fbbf24');
fillGradient.addColorStop(0.7, '#ef4444');
fillGradient.addColorStop(1, '#ff0000');
ctx.fillStyle = fillGradient;
ctx.fillRect(barX, barY, barWidth * 0.8, barHeight);

// Bar border
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 3;
ctx.strokeRect(barX, barY, barWidth, barHeight);

// Save
const buffer = canvas.toBuffer('image/png');
writeFileSync('public/og-image.png', buffer);
console.log('Created og-image.png');
