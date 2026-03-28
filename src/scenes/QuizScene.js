import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuizScene' });
  }

  init(data) {
    this.quizBox = data.box;
    this.question = data.question;
    this.onCorrect = data.onCorrect;
    this.onWrong = data.onWrong;
    this.answered = false;
  }

  create() {
    if (!this.question) { this._close(true); return; }
    this._buildUI();
  }

  _buildUI() {
    this.answered = false;
    if (this.uiContainer) this.uiContainer.destroy();
    this.uiContainer = this.add.container(0, 0);

    // Dark overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
    overlay.setInteractive();
    this.uiContainer.add(overlay);

    // Panel Size
    const panelW = Math.min(740, GAME_WIDTH - 60), panelH = Math.min(480, GAME_HEIGHT - 40);
    const px = GAME_WIDTH / 2, py = GAME_HEIGHT / 2;
    const topY = py - panelH / 2;
    const leftX = px - panelW / 2;

    // Rounded background graphics
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1A237E, 0.95); // Original deep blue
    graphics.fillRoundedRect(leftX, topY, panelW, panelH, 16);
    graphics.lineStyle(4, 0xFFD700, 1); // Original gold border
    graphics.strokeRoundedRect(leftX, topY, panelW, panelH, 16);
    
    // Header background
    graphics.fillStyle(0x283593, 1);
    graphics.fillRoundedRect(leftX, topY, panelW, 70, { tl: 16, tr: 16, bl: 0, br: 0 });
    graphics.lineStyle(2, 0xFFD700, 1);
    graphics.beginPath();
    graphics.moveTo(leftX, topY + 70);
    graphics.lineTo(leftX + panelW, topY + 70);
    graphics.strokePath();

    this.uiContainer.add(graphics);

    // Header Text
    const qNum = this.question.id || '?';
    const headerText = this.add.text(px, topY + 35, `🦷 คำถามที่ ${qNum}/21`, {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold', color: '#FFD700',
    }).setOrigin(0.5);
    this.uiContainer.add(headerText);

    // Question Text
    const qText = this.add.text(px, topY + 120, this.question.question, {
      fontSize: '20px', fontFamily: 'Arial', color: '#FFFFFF',
      wordWrap: { width: panelW - 60 }, align: 'center', lineSpacing: 8
    }).setOrigin(0.5);
    this.uiContainer.add(qText);

    // Choices
    const choices = this.question.choices;
    const btnW = panelW - 80, btnH = 50;
    const startY = topY + 200;
    const labels = ['A', 'B', 'C', 'D'];

    this.choiceButtons = []; // store for fading later

    for (let i = 0; i < choices.length; i++) {
      const by = startY + i * (btnH + 15);
      
      const btnBg = this.add.rectangle(px, by, btnW, btnH, 0x3949AB)
        .setStrokeStyle(2, 0x5C6BC0)
        .setInteractive({ useHandCursor: true });
        
      const btnText = this.add.text(px, by, `${labels[i]}. ${choices[i]}`, {
        fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF',
      }).setOrigin(0.5);

      this.uiContainer.add(btnBg);
      this.uiContainer.add(btnText);
      this.choiceButtons.push({ bg: btnBg, text: btnText });

      btnBg.on('pointerover', () => { if (!this.answered) btnBg.setFillStyle(0x5C6BC0).setStrokeStyle(2, 0xFFD700); });
      btnBg.on('pointerout', () => { if (!this.answered) btnBg.setFillStyle(0x3949AB).setStrokeStyle(2, 0x5C6BC0); });
      btnBg.on('pointerdown', () => {
        if (this.answered) return;
        this._checkAnswer(i, btnBg, btnText);
      });
    }

    // Entrance animation
    this.uiContainer.setAlpha(0);
    this.tweens.add({ targets: this.uiContainer, alpha: 1, duration: 300, ease: 'Power2' });

    // Keyboard 1-4
    this.input.keyboard.removeAllListeners();
    for (let i = 0; i < 4; i++) {
      this.input.keyboard.on(`keydown-${i + 1}`, () => {
        if (!this.answered) this._checkAnswer(i, this.choiceButtons[i].bg, this.choiceButtons[i].text);
      });
    }
  }

  _checkAnswer(choiceIndex, btnBg, btnText) {
    this.answered = true;
    const correct = choiceIndex === this.question.correct;

    // Fade out other choices to focus on result
    this.choiceButtons.forEach((btn, idx) => {
      if (idx !== choiceIndex) {
        this.tweens.add({ targets: [btn.bg, btn.text], alpha: 0.3, duration: 300 });
      }
    });

    if (correct) {
      if (btnBg) {
        btnBg.setFillStyle(0x2E7D32).setStrokeStyle(3, 0x4caf50); // Original Green
        if (btnText) btnText.setColor('#ffffff').setFontStyle('bold');
      }

      // ── Correct Animation ──
      // Glow behind tooth
      const glow = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 80, 0x4caf50, 0.4);
      this.uiContainer.add(glow);
      this.tweens.add({
        targets: glow, scaleX: 2.5, scaleY: 2.5, alpha: 0,
        duration: 1000, repeat: -1, ease: 'Sine.easeOut'
      });

      // Tooth popup animation
      const toothImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'tooth').setScale(0.1).setAngle(-45);
      this.uiContainer.add(toothImg);
      this.tweens.add({
        targets: toothImg, scaleX: 3.5, scaleY: 3.5, y: GAME_HEIGHT / 2, angle: 0,
        duration: 800, ease: 'Elastic.out',
      });

      // Text Background Box
      const txtBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 600, 100, 0x1B5E20, 0.95)
        .setStrokeStyle(3, 0x4caf50);
      this.uiContainer.add(txtBg);

      const resultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150,
        `✅ ถูกต้อง! ได้ฟันสวย!\n${this.question.explanation}`, {
        fontSize: '18px', fontFamily: 'Arial', color: '#A5D6A7', // Original Light Green
        wordWrap: { width: 560 }, align: 'center', lineSpacing: 5
      }).setOrigin(0.5);
      this.uiContainer.add(resultText);

      // Animation for text box
      txtBg.setScale(0); resultText.setScale(0);
      this.tweens.add({
        targets: [txtBg, resultText], scaleX: 1, scaleY: 1,
        duration: 500, delay: 300, ease: 'Back.out'
      });

      this.time.delayedCall(3000, () => this._close(true));
    } else {
      if (btnBg) {
        btnBg.setFillStyle(0xC62828).setStrokeStyle(3, 0xff5252); // Original Red
        if (btnText) btnText.setColor('#ffffff').setFontStyle('bold');
      }

      // ── Wrong Animation ──
      const glow = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 80, 0xd32f2f, 0.4);
      this.uiContainer.add(glow);

      const decayImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'tooth_decay').setScale(0.1);
      this.uiContainer.add(decayImg);
      this.tweens.add({
        targets: decayImg, scaleX: 3, scaleY: 3, y: GAME_HEIGHT / 2,
        duration: 600, ease: 'Back.out',
        onComplete: () => {
          this.tweens.add({ targets: decayImg, x: decayImg.x + 8, duration: 50, yoyo: true, repeat: 5 });
        }
      });

      // Text Background Box
      const txtBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 600, 100, 0xB71C1C, 0.95)
        .setStrokeStyle(3, 0xff5252);
      this.uiContainer.add(txtBg);

      const wrongText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150,
        `❌ ผิด! ได้ฟันผุ...\nเฉลย: ${this.question.choices[this.question.correct]}`, {
        fontSize: '18px', fontFamily: 'Arial', color: '#FFCDD2', // Original Light Red
        wordWrap: { width: 560 }, align: 'center', lineSpacing: 5
      }).setOrigin(0.5);
      this.uiContainer.add(wrongText);

      // Animation for text box
      txtBg.setScale(0); wrongText.setScale(0);
      this.tweens.add({
        targets: [txtBg, wrongText], scaleX: 1, scaleY: 1,
        duration: 500, delay: 300, ease: 'Back.out'
      });

      this.time.delayedCall(3500, () => this._close(false));
    }
  }

  _close(success) {
    this.tweens.add({
      targets: this.uiContainer, alpha: 0, duration: 200,
      onComplete: () => {
        if (success && this.onCorrect) this.onCorrect();
        else if (!success && this.onWrong) this.onWrong();
        this.scene.stop();
      },
    });
  }
}
