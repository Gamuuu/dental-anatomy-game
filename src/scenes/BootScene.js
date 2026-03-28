import Phaser from 'phaser';
import { COLORS, TILE_SIZE } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;
    const barW = 300, barH = 30;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    this.add.rectangle(width / 2, barY, barW + 4, barH + 4, 0x222222);
    const bar = this.add.rectangle(barX + 2, barY - barH / 2 + 2, 0, barH, 0x4FC3F7).setOrigin(0, 0);

    this.add.text(width / 2, barY - 40, '🦷 Loading...', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (val) => { bar.width = barW * val; });

    this._generateTextures();
  }

  create() {
    this.scene.start('MenuScene');
  }

  _generateTextures() {
    const T = TILE_SIZE;

    // Player variants (64×64 spritesheet, 4 frames)
    this._generateDetailedPlayer('player', '#FFFFFF', 'none');
    const outfits = [
      { name: 'white', color: '#FFFFFF' },
      { name: 'blue', color: '#90CAF9' },
      { name: 'pink', color: '#F48FB1' },
      { name: 'purple', color: '#9C27B0' }
    ];
    const hats = ['none', 'cap', 'purple_cap', 'headband'];

    outfits.forEach(outfit => {
      hats.forEach(hat => {
        this._generateDetailedPlayer(`player_${outfit.name}_${hat}`, outfit.color, hat);
      });
    });

    // Enemy (decayed tooth) 32×32 spritesheet: 3 frames
    const enemyCanvas = this.textures.createCanvas('enemy', T * 3, T);
    const eCtx = enemyCanvas.getContext();
    for (let f = 0; f < 3; f++) {
      const ox = f * T;
      if (f < 2) {
        eCtx.fillStyle = '#6D4C41';
        eCtx.fillRect(ox + 6, 4, 20, 22);
        eCtx.fillStyle = '#5D4037';
        eCtx.fillRect(ox + 8, 26, 6, 6);
        eCtx.fillRect(ox + 18, 26, 6, 6);
        eCtx.fillStyle = '#1B0000';
        eCtx.fillRect(ox + 10, 10, 4, 4);
        eCtx.fillRect(ox + 18, 14, 5, 3);
        eCtx.fillStyle = '#FF1744';
        eCtx.fillRect(ox + 10, 6 + (f * 2), 4, 4);
        eCtx.fillRect(ox + 20, 6 + (f * 2), 4, 4);
      } else {
        eCtx.fillStyle = '#6D4C41';
        eCtx.fillRect(ox + 4, 20, 24, 10);
        eCtx.fillStyle = '#FF1744';
        eCtx.fillRect(ox + 10, 22, 3, 3);
        eCtx.fillRect(ox + 20, 22, 3, 3);
      }
    }
    enemyCanvas.refresh();

    // Tooth (healthy collectible) 16×16
    const toothCanvas = this.textures.createCanvas('tooth', 16, 16);
    const tCtx = toothCanvas.getContext();
    tCtx.fillStyle = '#FFFFF0';
    tCtx.fillRect(3, 1, 10, 10);
    tCtx.fillStyle = '#E0E0E0';
    tCtx.fillRect(4, 11, 3, 5);
    tCtx.fillRect(9, 11, 3, 5);
    tCtx.fillStyle = '#FFFFFF';
    tCtx.fillRect(4, 2, 3, 3);
    toothCanvas.refresh();

    // Decayed tooth 16x16
    const decayCanvas = this.textures.createCanvas('tooth_decay', 16, 16);
    const dcCtx = decayCanvas.getContext();
    dcCtx.fillStyle = '#6D4C41';
    dcCtx.fillRect(3, 1, 10, 10);
    dcCtx.fillStyle = '#5D4037';
    dcCtx.fillRect(4, 11, 3, 5);
    dcCtx.fillRect(9, 11, 3, 5);
    dcCtx.fillStyle = '#1B0000';
    dcCtx.fillRect(5, 4, 4, 3);
    dcCtx.fillRect(8, 7, 3, 2);
    decayCanvas.refresh();

    // Quiz box 32×32 spritesheet: 2 frames (closed/opened)
    const qboxCanvas = this.textures.createCanvas('quizbox', T * 2, T);
    const qCtx = qboxCanvas.getContext();
    // Frame 0: closed
    qCtx.fillStyle = '#FFD700';
    qCtx.fillRect(2, 2, 28, 28);
    qCtx.fillStyle = '#FFA000';
    qCtx.fillRect(2, 2, 28, 3);
    qCtx.fillRect(2, 27, 28, 3);
    qCtx.fillRect(2, 2, 3, 28);
    qCtx.fillRect(27, 2, 3, 28);
    qCtx.fillStyle = '#FFFFFF';
    qCtx.font = 'bold 20px Arial';
    qCtx.fillText('?', 10, 24);
    // Frame 1: opened
    qCtx.fillStyle = '#9E9E9E';
    qCtx.fillRect(T + 2, 2, 28, 28);
    qCtx.fillStyle = '#757575';
    qCtx.fillRect(T + 2, 2, 28, 3);
    qCtx.fillRect(T + 2, 27, 28, 3);
    qCtx.fillRect(T + 2, 2, 3, 28);
    qCtx.fillRect(T + 27, 2, 3, 28);
    qboxCanvas.refresh();

    // Ground tile 32×32
    const groundCanvas = this.textures.createCanvas('ground', T, T);
    const gCtx = groundCanvas.getContext();
    gCtx.fillStyle = '#8B4513';
    gCtx.fillRect(0, 0, T, T);
    gCtx.fillStyle = '#228B22';
    gCtx.fillRect(0, 0, T, 6);
    gCtx.fillStyle = '#A0522D';
    gCtx.fillRect(0, 0, 1, T);
    gCtx.fillRect(T - 1, 0, 1, T);
    groundCanvas.refresh();

    // Platform tile 32×32
    const platCanvas = this.textures.createCanvas('platform', T, T);
    const plCtx = platCanvas.getContext();
    plCtx.fillStyle = '#6D4C41';
    plCtx.fillRect(0, 0, T, T);
    plCtx.fillStyle = '#8D6E63';
    plCtx.fillRect(1, 1, T - 2, 4);
    plCtx.fillStyle = '#5D4037';
    plCtx.fillRect(0, 0, T, 1);
    plCtx.fillRect(0, T - 1, T, 1);
    platCanvas.refresh();

    // Door 32×64
    const doorCanvas = this.textures.createCanvas('door', T, T * 2);
    const dCtx = doorCanvas.getContext();
    dCtx.fillStyle = '#CD853F';
    dCtx.fillRect(2, 0, T - 4, T * 2);
    dCtx.fillStyle = '#A0522D';
    dCtx.fillRect(2, 0, T - 4, 4);
    dCtx.fillRect(2, T * 2 - 4, T - 4, 4);
    dCtx.fillStyle = '#FFD700';
    dCtx.fillRect(T - 10, T, 4, 4);
    dCtx.fillStyle = '#4CAF50';
    dCtx.fillRect(T - 12, T - 8, 8, 8);
    doorCanvas.refresh();

    // Door open
    const doorOpenCanvas = this.textures.createCanvas('door_open', T, T * 2);
    const doCtx = doorOpenCanvas.getContext();
    doCtx.fillStyle = '#CD853F';
    doCtx.fillRect(2, 0, T - 4, T * 2);
    doCtx.fillStyle = '#1B5E20';
    doCtx.fillRect(6, 4, T - 12, T * 2 - 8);
    doCtx.fillStyle = '#FFD700';
    doCtx.fillRect(T - 10, T, 4, 4);
    doorOpenCanvas.refresh();

    // Heart, Heart empty
    const heartCanvas = this.textures.createCanvas('heart', 16, 16);
    const hCtx = heartCanvas.getContext();
    hCtx.fillStyle = '#FF1744';
    hCtx.fillRect(2, 4, 5, 5); hCtx.fillRect(9, 4, 5, 5);
    hCtx.fillRect(1, 6, 14, 4); hCtx.fillRect(2, 10, 12, 2);
    hCtx.fillRect(4, 12, 8, 2); hCtx.fillRect(6, 14, 4, 1);
    heartCanvas.refresh();

    const heartEmptyCanvas = this.textures.createCanvas('heart_empty', 16, 16);
    const heCtx = heartEmptyCanvas.getContext();
    heCtx.fillStyle = '#555555';
    heCtx.fillRect(2, 4, 5, 5); heCtx.fillRect(9, 4, 5, 5);
    heCtx.fillRect(1, 6, 14, 4); heCtx.fillRect(2, 10, 12, 2);
    heCtx.fillRect(4, 12, 8, 2); heCtx.fillRect(6, 14, 4, 1);
    heartEmptyCanvas.refresh();

    // Cloud
    const cloudCanvas = this.textures.createCanvas('cloud', 64, 32);
    const cCtx = cloudCanvas.getContext();
    cCtx.fillStyle = 'rgba(255,255,255,0.7)';
    cCtx.beginPath(); cCtx.ellipse(32, 20, 28, 12, 0, 0, Math.PI * 2); cCtx.fill();
    cCtx.beginPath(); cCtx.ellipse(20, 16, 14, 10, 0, 0, Math.PI * 2); cCtx.fill();
    cCtx.beginPath(); cCtx.ellipse(44, 16, 16, 10, 0, 0, Math.PI * 2); cCtx.fill();
    cloudCanvas.refresh();

    // Virtual buttons
    const btnCanvas = this.textures.createCanvas('vbtn', 60, 60);
    const bCtx = btnCanvas.getContext();
    bCtx.fillStyle = 'rgba(255,255,255,0.25)';
    bCtx.beginPath(); bCtx.arc(30, 30, 28, 0, Math.PI * 2); bCtx.fill();
    bCtx.strokeStyle = 'rgba(255,255,255,0.5)';
    bCtx.lineWidth = 2; bCtx.stroke();
    btnCanvas.refresh();

    const dpadCanvas = this.textures.createCanvas('dpad', 50, 50);
    const dpCtx = dpadCanvas.getContext();
    dpCtx.fillStyle = 'rgba(255,255,255,0.2)';
    dpCtx.beginPath(); dpCtx.arc(25, 25, 23, 0, Math.PI * 2); dpCtx.fill();
    dpCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    dpCtx.lineWidth = 2; dpCtx.stroke();
    dpadCanvas.refresh();

    // Register spritesheet frames
    this.textures.get('enemy').add(0, 0, 0, 0, T, T);
    this.textures.get('enemy').add(1, 0, T, 0, T, T);
    this.textures.get('enemy').add(2, 0, T * 2, 0, T, T);
    this.textures.get('quizbox').add(0, 0, 0, 0, T, T);
    this.textures.get('quizbox').add(1, 0, T, 0, T, T);
  }

  _generateDetailedPlayer(key, coatColor, hatType) {
    const T = 64;
    const playerCanvas = this.textures.createCanvas(key, T * 4, T);
    const pCtx = playerCanvas.getContext();

    for (let f = 0; f < 4; f++) {
      const ox = f * T;

      // Body (coat)
      pCtx.fillStyle = coatColor;
      pCtx.fillRect(ox + 16, 20, 32, 32);
      pCtx.fillStyle = 'rgba(0,0,0,0.1)';
      pCtx.fillRect(ox + 16, 40, 32, 12);
      pCtx.fillRect(ox + 32, 20, 16, 32);

      // Head
      pCtx.fillStyle = '#FFD1A4';
      pCtx.fillRect(ox + 20, 4, 24, 20);

      // Hair
      pCtx.fillStyle = '#8D6E63';
      pCtx.fillRect(ox + 18, 4, 28, 6);
      pCtx.fillRect(ox + 18, 10, 4, 10);
      pCtx.fillRect(ox + 42, 10, 4, 10);

      // Eyes
      pCtx.fillStyle = '#333333';
      pCtx.fillRect(ox + 24, 12, 4, 4);
      pCtx.fillRect(ox + 36, 12, 4, 4);
      pCtx.fillStyle = '#FFFFFF';
      pCtx.fillRect(ox + 26, 12, 2, 2);
      pCtx.fillRect(ox + 38, 12, 2, 2);

      // Mouth
      pCtx.fillStyle = '#FF8A80';
      pCtx.fillRect(ox + 28, 18, 8, 2);

      // Hat/Mirror
      if (hatType === 'none') {
        pCtx.fillStyle = '#00BCD4';
        pCtx.fillRect(ox + 28, 0, 8, 4);
        pCtx.fillStyle = '#DDDDDD';
        pCtx.fillRect(ox + 28, 2, 8, 2);
      } else if (hatType === 'cap') {
        pCtx.fillStyle = '#1976D2';
        pCtx.fillRect(ox + 16, 0, 32, 6);
        pCtx.fillRect(ox + 32, 4, 18, 4);
      } else if (hatType === 'purple_cap') {
        pCtx.fillStyle = '#7B1FA2';
        pCtx.fillRect(ox + 16, 0, 32, 6);
        pCtx.fillRect(ox + 32, 4, 18, 4);
      } else if (hatType === 'headband') {
        pCtx.fillStyle = '#D32F2F';
        pCtx.fillRect(ox + 18, 2, 28, 4);
        pCtx.fillStyle = '#FFFFFF';
        pCtx.fillRect(ox + 30, 2, 4, 4);
      }

      // Legs
      pCtx.fillStyle = '#1565C0';
      if (f === 1) {
        pCtx.fillRect(ox + 20, 52, 10, 12);
        pCtx.fillRect(ox + 34, 48, 10, 16);
      } else if (f === 2) {
        pCtx.fillRect(ox + 20, 48, 10, 16);
        pCtx.fillRect(ox + 34, 52, 10, 12);
      } else if (f === 3) {
        pCtx.fillRect(ox + 20, 44, 10, 12);
        pCtx.fillRect(ox + 34, 44, 10, 12);
      } else {
        pCtx.fillRect(ox + 20, 52, 10, 12);
        pCtx.fillRect(ox + 34, 52, 10, 12);
      }

      // Shoes
      pCtx.fillStyle = '#3E2723';
      const shoeY = f === 3 ? 52 : 60;
      pCtx.fillRect(ox + 20, shoeY, 12, 4);
      pCtx.fillRect(ox + 34, shoeY, 12, 4);
    }
    playerCanvas.refresh();

    this.textures.get(key).add(0, 0, 0, 0, T, T);
    this.textures.get(key).add(1, 0, T, 0, T, T);
    this.textures.get(key).add(2, 0, T * 2, 0, T, T);
    this.textures.get(key).add(3, 0, T * 3, 0, T, T);
  }
}
