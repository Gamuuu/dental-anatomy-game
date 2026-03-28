import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_MAX_HEALTH, TOTAL_QUESTIONS } from '../config.js';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  init(data) {
    this.health = data.health || PLAYER_MAX_HEALTH;
    this.score = data.score || 0;
    this.teethCollected = data.teethCollected || 0;
    this.decayedTeeth = data.decayedTeeth || 0;
  }

  create() {
    // Hearts
    this.hearts = [];
    for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
      const heart = this.add.image(24 + i * 28, 24, 'heart').setScale(1.5).setScrollFactor(0);
      this.hearts.push(heart);
    }

    // Tooth counter (top-right)
    this.toothIcon = this.add.image(GAME_WIDTH - 130, 20, 'tooth').setScale(2).setScrollFactor(0);
    this.toothText = this.add.text(GAME_WIDTH - 110, 12, `${this.teethCollected}/${TOTAL_QUESTIONS}`, {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF',
      stroke: '#333', strokeThickness: 3,
    }).setOrigin(0, 0).setScrollFactor(0);

    // Decayed tooth counter
    this.decayIcon = this.add.image(GAME_WIDTH - 130, 48, 'tooth_decay').setScale(2).setScrollFactor(0);
    this.decayText = this.add.text(GAME_WIDTH - 110, 40, `${this.decayedTeeth}`, {
      fontSize: '18px', fontFamily: 'Arial', color: '#EF9A9A',
      stroke: '#333', strokeThickness: 3,
    }).setOrigin(0, 0).setScrollFactor(0);

    // Score
    this.scoreText = this.add.text(GAME_WIDTH / 2, 12, `🦷 ${this.score}`, {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#333', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // ── Pause Menu Overlay ──
    this.pauseOverlay = this.add.container(0, 0).setDepth(200).setVisible(false).setScrollFactor(0);
    const dimBg = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.pauseOverlay.add(dimBg);

    const pText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 80, 'PAUSED / หยุดเกม', {
      fontSize: '36px', fontFamily: 'Arial', color: '#FFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.pauseOverlay.add(pText);

    const createBtn = (x, y, text, onClick) => {
      const btn = this.add.text(x, y, text, {
        fontSize: '22px', fontFamily: 'Arial', color: '#FFF', backgroundColor: '#1565C0',
        padding: { x: 16, y: 10 }, stroke: '#0D47A1', strokeThickness: 2
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#1976D2' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#1565C0' }));
      btn.on('pointerdown', onClick);
      return btn;
    };

    this.pauseOverlay.add(createBtn(GAME_WIDTH/2, GAME_HEIGHT/2, '▶️ เล่นต่อ (Resume)', () => {
      this.scene.resume('GameScene');
      this.pauseOverlay.setVisible(false);
    }));

    this.pauseOverlay.add(createBtn(GAME_WIDTH/2, GAME_HEIGHT/2 + 60, '📊 สรุปผลด่านนี้ (End Level)', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameOverScene', {
        win: true,
        score: this.score,
        teethCollected: this.teethCollected,
        decayedTeeth: this.decayedTeeth,
      });
    }));

    this.pauseOverlay.add(createBtn(GAME_WIDTH/2, GAME_HEIGHT/2 + 120, '🏠 กลับเมนูหลัก (Main Menu)', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    }));

    // ── HUD Buttons (Top-Left under hearts) ──
    const pauseBtn = this.add.text(35, 75, '⏸️', {
      fontSize: '26px', backgroundColor: '#333333dd', padding: {x: 8, y: 4}, borderRadius: 8
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);
    
    pauseBtn.on('pointerdown', () => {
      // Don't pause if the pause overlay is already active
      if (!this.pauseOverlay.visible) {
        this.scene.pause('GameScene');
        this.pauseOverlay.setVisible(true);
      }
    });

    const fsBtn = this.add.text(90, 75, this.scale.isFullscreen ? '✖️' : '⛶', {
      fontSize: '26px', backgroundColor: '#333333dd', padding: {x: 10, y: 5}, borderRadius: 8
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);
    
    fsBtn.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Update fs icon based on state
    this.scale.on('enterfullscreen', () => fsBtn.setText('✖️'));
    this.scale.on('leavefullscreen', () => fsBtn.setText('⛶'));
  }

  updateStats(health, score, teethCollected, decayedTeeth) {
    this.health = health;
    this.score = score;
    this.teethCollected = teethCollected;
    this.decayedTeeth = decayedTeeth;

    // Update hearts
    for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
      if (i < this.health) {
        this.hearts[i].setTexture('heart').setAlpha(1);
      } else {
        this.hearts[i].setTexture('heart_empty').setAlpha(0.6);
      }
    }

    this.scoreText.setText(`🦷 ${this.score}`);
    this.toothText.setText(`${this.teethCollected}/${TOTAL_QUESTIONS}`);
    this.decayText.setText(`${this.decayedTeeth}`);
  }
}
