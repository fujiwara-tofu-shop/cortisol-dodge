// Play.fun SDK Integration
// SDK loaded via CDN in index.html

const GAME_ID = '7bd0cf3d-a01c-4749-ba2b-9be575dd4877';
const GAME_KEY = '8Gg2e3iCxZDfBKHgT3N9ryH3xUw3xnqYztUW3zVbM1sK';

let sdk = null;
let isReady = false;
let pendingPoints = 0;

/**
 * Initialize the Play.fun SDK
 */
export async function initPlayFun() {
  // Check if SDK is available (loaded from CDN) - try both class names
  const SDKClass = typeof PlayFunSDK !== 'undefined' ? PlayFunSDK 
                 : typeof OpenGameSDK !== 'undefined' ? OpenGameSDK 
                 : null;
  
  if (!SDKClass) {
    console.warn('Play.fun SDK not loaded (neither PlayFunSDK nor OpenGameSDK found)');
    return false;
  }

  try {
    console.log('Initializing Play.fun SDK with class:', SDKClass.name || 'SDK');
    sdk = new SDKClass({
      gameId: GAME_ID,
      apiKey: GAME_KEY,
      ui: {
        usePointsWidget: true,
      },
    });

    await sdk.init();
    isReady = true;
    console.log('Play.fun SDK ready!');

    // Set up event listeners
    sdk.on('OnReady', () => {
      console.log('Play.fun: OnReady event');
    });

    sdk.on('pointsSynced', (points) => {
      console.log('Play.fun: Points synced:', points);
    });

    sdk.on('error', (err) => {
      console.error('Play.fun error:', err);
    });

    return true;
  } catch (err) {
    console.error('Failed to initialize Play.fun SDK:', err);
    return false;
  }
}

/**
 * Add points to the player's score
 * @param {number} points - Points to add
 */
export function addPoints(points) {
  if (!isReady || !sdk) {
    pendingPoints += points;
    return;
  }

  sdk.addPoints(points);
}

/**
 * Save accumulated points to Play.fun servers
 */
export async function savePoints() {
  if (!isReady || !sdk) {
    console.log('SDK not ready, points pending:', pendingPoints);
    return;
  }

  try {
    await sdk.savePoints();
    console.log('Points saved to Play.fun');
  } catch (err) {
    console.error('Failed to save points:', err);
  }
}

/**
 * Report final score at game over
 * @param {number} finalScore - The player's final score
 */
export async function reportGameOver(finalScore) {
  if (!isReady || !sdk) {
    console.log('Game over, final score:', finalScore, '(SDK not ready)');
    return;
  }

  // Add any pending points
  if (pendingPoints > 0) {
    sdk.addPoints(pendingPoints);
    pendingPoints = 0;
  }

  // Save all points
  await savePoints();
}

/**
 * Check if SDK is ready
 */
export function isPlayFunReady() {
  return isReady;
}
