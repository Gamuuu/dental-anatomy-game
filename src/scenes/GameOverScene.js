import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TOTAL_QUESTIONS } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.isWin = data.win || false;
    this.finalScore = data.score || 0;
    this.teethCollected = data.teethCollected || 0;
    // Total decayed = wrong + unanswered (everything that's not a correct answer)
    this.totalDecayed = TOTAL_QUESTIONS - this.teethCollected;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background
    const bg = this.add.graphics();
    if (this.isWin) {
      bg.fillGradientStyle(0x1B5E20, 0x2E7D32, 0x43A047, 0x66BB6A, 1);
    } else {
      bg.fillGradientStyle(0x1A1A2E, 0x16213E, 0x0F3460, 0x1A1A2E, 1);
    }
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Floor for teeth to land on
    const floorY = GAME_HEIGHT - 20;
    bg.fillStyle(this.isWin ? 0x1B5E20 : 0x111122, 1);
    bg.fillRect(0, floorY, GAME_WIDTH, 40);

    // Invisible floor for physics
    const floor = this.add.rectangle(cx, floorY + 10, GAME_WIDTH, 20);
    this.physics.add.existing(floor, true); // static

    // ── Spawn teeth with physics gravity ──
    const toothGroup = this.physics.add.group();

    // Healthy teeth (white)
    for (let i = 0; i < this.teethCollected; i++) {
      const t = toothGroup.create(
        Phaser.Math.Between(80, GAME_WIDTH - 80),
        Phaser.Math.Between(-200, -40),
        'tooth'
      );
      t.setScale(Phaser.Math.FloatBetween(1.5, 2.5));
      t.setBounce(Phaser.Math.FloatBetween(0.4, 0.7));
      t.setVelocityX(Phaser.Math.Between(-80, 80));
      t.setAngularVelocity(Phaser.Math.Between(-120, 120));
      t.setCollideWorldBounds(false);
      // Stagger drop timing
      t.body.setAllowGravity(false);
      this.time.delayedCall(i * 100, () => {
        if (t.body) t.body.setAllowGravity(true);
      });
    }

    // Decayed teeth (brown)
    for (let i = 0; i < this.totalDecayed; i++) {
      const dt = toothGroup.create(
        Phaser.Math.Between(80, GAME_WIDTH - 80),
        Phaser.Math.Between(-400, -100),
        'tooth_decay'
      );
      dt.setScale(Phaser.Math.FloatBetween(1.5, 2.5));
      dt.setBounce(Phaser.Math.FloatBetween(0.3, 0.6));
      dt.setVelocityX(Phaser.Math.Between(-80, 80));
      dt.setAngularVelocity(Phaser.Math.Between(-100, 100));
      dt.setCollideWorldBounds(false);
      dt.body.setAllowGravity(false);
      // Drop after healthy teeth
      this.time.delayedCall((this.teethCollected + i) * 100 + 300, () => {
        if (dt.body) dt.body.setAllowGravity(true);
      });
    }

    // Collide teeth with floor
    this.physics.add.collider(toothGroup, floor);
    // Teeth collide with each other for a nice pile
    this.physics.add.collider(toothGroup, toothGroup);

    // World bounds so teeth don't fly off sides
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + 100);

    // ── UI overlay (on top of falling teeth) ──
    const uiDepth = 50;

    if (this.isWin) {
      // Grade
      let grade, gradeColor;
      if (this.teethCollected >= 18) { grade = '🌟 ยอดเยี่ยม!'; gradeColor = '#FFD700'; }
      else if (this.teethCollected >= 15) { grade = '👏 เก่งมาก!'; gradeColor = '#A5D6A7'; }
      else if (this.teethCollected >= 10) { grade = '👍 ดี!'; gradeColor = '#81D4FA'; }
      else if (this.teethCollected >= 5) { grade = '💪 ต้องพยายามอีก'; gradeColor = '#FFE082'; }
      else { grade = '😊 มาลองใหม่นะ'; gradeColor = '#EF9A9A'; }

      const title = this.add.text(cx, 50, '🎉 ผ่านด่านแล้ว! 🎉', {
        fontSize: '36px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#FFD700', stroke: '#000', strokeThickness: 5,
      }).setOrigin(0.5).setDepth(uiDepth);

      this.tweens.add({
        targets: title, scaleX: 1.08, scaleY: 1.08,
        duration: 600, yoyo: true, repeat: -1,
      });

      this.add.text(cx, 100, grade, {
        fontSize: '26px', fontFamily: 'Arial', fontStyle: 'bold', color: gradeColor,
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(uiDepth);
    } else {
      const goTitle = this.add.text(cx, 50, '💀 Game Over', {
        fontSize: '40px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#FF1744', stroke: '#000', strokeThickness: 5,
      }).setOrigin(0.5).setDepth(uiDepth);

      this.tweens.add({
        targets: goTitle, alpha: 0.7, duration: 800, yoyo: true, repeat: -1,
      });

      this.add.text(cx, 100, 'ฟันผุชนะคุณหมอแล้ว...', {
        fontSize: '20px', fontFamily: 'Arial', color: '#EF9A9A',
      }).setOrigin(0.5).setDepth(uiDepth);
    }

    // Stats panel
    const panelBg = this.add.rectangle(cx, 195, 380, 130, 0x000000, 0.5)
      .setStrokeStyle(2, 0xFFFFFF22).setDepth(uiDepth - 1);

    this.add.text(cx, 155, `🦷 ฟันสวย: ${this.teethCollected} / ${TOTAL_QUESTIONS}`, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#A5D6A7',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(uiDepth);

    this.add.text(cx, 190, `🦴 ฟันผุ: ${this.totalDecayed}`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#EF9A9A',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(uiDepth);

    this.add.text(cx, 225, `คะแนนรวม: ${this.finalScore}`, {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(uiDepth);

    // ── Buttons ──
    const retryBtn = this.add.text(cx, 300, '🔄 เล่นใหม่', {
      fontSize: '22px', fontFamily: 'Arial', fontStyle: 'bold', color: '#FFFFFF',
      backgroundColor: '#1565C0', padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(uiDepth);

    retryBtn.on('pointerover', () => retryBtn.setStyle({ backgroundColor: '#1976D2' }));
    retryBtn.on('pointerout', () => retryBtn.setStyle({ backgroundColor: '#1565C0' }));
    retryBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('GameScene'));
    });

    const menuBtn = this.add.text(cx, 355, '🏠 กลับเมนู', {
      fontSize: '18px', fontFamily: 'Arial', color: '#B0BEC5',
      backgroundColor: '#37474F', padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(uiDepth);

    menuBtn.on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#455A64' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#37474F' }));
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });

    this.input.keyboard.on('keydown-ENTER', () => retryBtn.emit('pointerdown'));
    this.input.keyboard.on('keydown-SPACE', () => retryBtn.emit('pointerdown'));

    // ── Fullscreen Toggle ──
    const fsBtn = this.add.text(GAME_WIDTH - 50, 40, this.scale.isFullscreen ? '✖️' : '⛶', {
      fontSize: '26px', backgroundColor: '#333333aa', padding: {x: 10, y: 5}, stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(uiDepth + 10);
    
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
}
