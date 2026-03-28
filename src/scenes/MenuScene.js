import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // ── Background ──
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1565C0, 0x0D47A1, 0x42A5F5, 0x1E88E5, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground
    bg.fillStyle(0x228B22, 1);
    bg.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
    bg.fillStyle(0x8B4513, 1);
    bg.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30);

    // Clouds
    for (let i = 0; i < 7; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(30, GAME_WIDTH - 30),
        Phaser.Math.Between(30, 160), 'cloud'
      ).setAlpha(0.5 + Math.random() * 0.3).setScale(1 + Math.random() * 0.5);
      this.tweens.add({
        targets: cloud, x: cloud.x + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(5000, 9000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // ── Left side: Title + Info ──
    const leftX = GAME_WIDTH * 0.3;

    // Title shadow
    this.add.text(leftX + 3, 63, '🦷 Dental Quest', {
      fontSize: '44px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#00000033',
    }).setOrigin(0.5);

    // Title
    const title = this.add.text(leftX, 60, '🦷 Dental Quest', {
      fontSize: '44px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#0D47A1', strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title, y: 68, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(leftX, 115, 'เกมผจญภัยหมอฟัน', {
      fontSize: '20px', fontFamily: 'Arial', color: '#E3F2FD',
      stroke: '#0D47A1', strokeThickness: 3,
    }).setOrigin(0.5);

    // Info box
    const infoY = 175;
    const infoBg = this.add.rectangle(leftX, infoY + 50, 320, 120, 0x0D47A1, 0.6)
      .setStrokeStyle(2, 0x42A5F5);
    this.add.text(leftX, infoY + 15, '📋 วิธีเล่น', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#FFD700',
    }).setOrigin(0.5);
    this.add.text(leftX, infoY + 40, '🏃 เดินซ้าย-ขวา เก็บฟัน กระโดดข้ามหลุม', {
      fontSize: '13px', fontFamily: 'Arial', color: '#B3E5FC',
    }).setOrigin(0.5);
    this.add.text(leftX, infoY + 60, '❓ ชนกล่อง Quiz → ตอบถูกได้ฟันสวย 🦷', {
      fontSize: '13px', fontFamily: 'Arial', color: '#B3E5FC',
    }).setOrigin(0.5);
    this.add.text(leftX, infoY + 80, '🚪 เดินถึงประตูท้ายแมพ = จบด่าน!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#B3E5FC',
    }).setOrigin(0.5);

    // Controls info
    this.add.text(leftX, GAME_HEIGHT - 65, '⌨️ Arrow/WASD + Space  |  📱 Touch (แนวนอน)', {
      fontSize: '11px', fontFamily: 'Arial', color: '#90CAF9',
      stroke: '#0D47A1', strokeThickness: 2,
    }).setOrigin(0.5);

    // ── Right side: Character selection ──
    const rightX = GAME_WIDTH * 0.72;

    // Selection panel background
    const panelBg = this.add.rectangle(rightX, cy - 10, 300, 340, 0x0D47A1, 0.5)
      .setStrokeStyle(2, 0x42A5F5);

    this.add.text(rightX, cy - 155, '👤 เลือกตัวละคร', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold', color: '#FFD700',
    }).setOrigin(0.5);

    // Character state
    this.outfitIndex = 0;
    this.outfits = ['white', 'blue', 'pink'];
    this.hatIndex = 0;
    this.hats = ['none', 'cap'];

    // Character preview
    this.dentist = this.add.sprite(rightX, cy - 60, this._getPlayerKey(), 0).setScale(2.5);
    this.tweens.add({
      targets: this.dentist, y: cy - 50, duration: 800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Selection buttons
    const createBtn = (x, y, text, onClick) => {
      const btn = this.add.text(x, y, text, {
        fontSize: '26px', backgroundColor: '#1565C0', color: '#FFF',
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#1976D2' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#1565C0' }));
      btn.on('pointerdown', onClick);
      return btn;
    };

    // Outfit selector
    createBtn(rightX - 100, cy + 30, '◀', () => this._changeOutfit(-1));
    this.outfitText = this.add.text(rightX, cy + 30, 'ชุด: ขาว', {
      fontSize: '18px', color: '#FFF', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    createBtn(rightX + 100, cy + 30, '▶', () => this._changeOutfit(1));

    // Hat selector
    createBtn(rightX - 100, cy + 75, '◀', () => this._changeHat(-1));
    this.hatText = this.add.text(rightX, cy + 75, 'หมวก: ไม่มี', {
      fontSize: '18px', color: '#FFF', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    createBtn(rightX + 100, cy + 75, '▶', () => this._changeHat(1));

    // Floating decorations
    for (let i = 0; i < 8; i++) {
      const t = this.add.image(
        Phaser.Math.Between(40, GAME_WIDTH - 40),
        Phaser.Math.Between(180, GAME_HEIGHT - 100), 'tooth'
      ).setScale(1.5 + Math.random()).setAlpha(0.3 + Math.random() * 0.2);
      this.tweens.add({
        targets: t, y: t.y - 15, angle: Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // ── Start Button (centered bottom) ──
    const startBtn = this.add.text(cx, GAME_HEIGHT - 100, '🎮  เริ่มเกม  —  Start', {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold', color: '#FFFFFF',
      backgroundColor: '#2E7D32', padding: { x: 36, y: 14 },
      stroke: '#1B5E20', strokeThickness: 1,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setStyle({ backgroundColor: '#388E3C' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ backgroundColor: '#2E7D32' }));

    this.tweens.add({
      targets: startBtn, scaleX: 1.05, scaleY: 1.05,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Start handlers
    startBtn.on('pointerdown', () => {
      if (this.scale && !this.scale.isFullscreen) {
        this.scale.startFullscreen();
      }
      this._startGame();
    });
    this.input.keyboard.on('keydown-ENTER', () => this._startGame());
    this.input.keyboard.on('keydown-SPACE', () => this._startGame());

    // ── Fullscreen Toggle ──
    const fsBtn = this.add.text(GAME_WIDTH - 50, 40, this.scale.isFullscreen ? '✖️' : '⛶', {
      fontSize: '26px', backgroundColor: '#333333aa', padding: {x: 10, y: 5}, stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    fsBtn.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.scale.on('enterfullscreen', () => fsBtn.setText('✖️'));
    this.scale.on('leavefullscreen', () => fsBtn.setText('⛶'));
  }

  _startGame() {
    this.registry.set('playerKey', this._getPlayerKey());
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => this.scene.start('GameScene'));
  }

  _getPlayerKey() {
    return `player_${this.outfits[this.outfitIndex]}_${this.hats[this.hatIndex]}`;
  }

  _changeOutfit(dir) {
    this.outfitIndex = (this.outfitIndex + dir + this.outfits.length) % this.outfits.length;
    this._updatePreview();
  }

  _changeHat(dir) {
    this.hatIndex = (this.hatIndex + dir + this.hats.length) % this.hats.length;
    this._updatePreview();
  }

  _updatePreview() {
    this.dentist.setTexture(this._getPlayerKey());
    const outfitNames = ['ขาว', 'ฟ้า', 'ชมพู'];
    const hatNames = ['ไม่มี', 'สวมหมวก'];
    this.outfitText.setText(`ชุด: ${outfitNames[this.outfitIndex]}`);
    this.hatText.setText(`หมวก: ${hatNames[this.hatIndex]}`);
  }
}
