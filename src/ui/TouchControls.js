import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/**
 * Touch controls for mobile landscape.
 * D-pad (left/right): bottom-left, anchored to game coordinates.
 * Jump: bottom-right.
 * Positions are based on GAME_WIDTH/HEIGHT so they scale with the canvas.
 */
export function createTouchControls(scene, touchInput) {
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return null;

  const controls = { elements: [] };
  const btnAlpha = 0.4;
  const btnActive = 0.8;
  const depth = 100;

  const padY = GAME_HEIGHT - 60;  // 60px from bottom
  const leftX = 70;               // left edge
  const rightX = 170;             // right of left
  const jumpX = GAME_WIDTH - 80;  // right edge

  // ── Left ──
  const leftBtn = scene.add.image(leftX, padY, 'dpad')
    .setScrollFactor(0).setAlpha(btnAlpha).setInteractive().setDepth(depth).setScale(1.4);
  const leftArr = scene.add.text(leftX, padY, '◀', {
    fontSize: '30px', color: '#FFF',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

  leftBtn.on('pointerdown', () => { touchInput.left = true; leftBtn.setAlpha(btnActive); });
  leftBtn.on('pointerup', () => { touchInput.left = false; leftBtn.setAlpha(btnAlpha); });
  leftBtn.on('pointerout', () => { touchInput.left = false; leftBtn.setAlpha(btnAlpha); });

  // ── Right ──
  const rightBtn = scene.add.image(rightX, padY, 'dpad')
    .setScrollFactor(0).setAlpha(btnAlpha).setInteractive().setDepth(depth).setScale(1.4);
  const rightArr = scene.add.text(rightX, padY, '▶', {
    fontSize: '30px', color: '#FFF',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

  rightBtn.on('pointerdown', () => { touchInput.right = true; rightBtn.setAlpha(btnActive); });
  rightBtn.on('pointerup', () => { touchInput.right = false; rightBtn.setAlpha(btnAlpha); });
  rightBtn.on('pointerout', () => { touchInput.right = false; rightBtn.setAlpha(btnAlpha); });

  // ── Jump (bottom-right) ──
  const jumpBtn = scene.add.image(jumpX, padY, 'vbtn')
    .setScrollFactor(0).setAlpha(btnAlpha).setInteractive().setDepth(depth).setScale(1.4);
  const jumpLbl = scene.add.text(jumpX, padY, '⬆', {
    fontSize: '34px', color: '#FFF',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

  jumpBtn.on('pointerdown', () => {
    touchInput.jump = true;
    jumpBtn.setAlpha(btnActive);
    scene.time.delayedCall(120, () => { touchInput.jump = false; });
  });
  jumpBtn.on('pointerup', () => { jumpBtn.setAlpha(btnAlpha); });
  jumpBtn.on('pointerout', () => { jumpBtn.setAlpha(btnAlpha); });

  controls.elements = [leftBtn, leftArr, rightBtn, rightArr, jumpBtn, jumpLbl];
  return controls;
}
