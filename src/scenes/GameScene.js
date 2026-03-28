import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE,
  PLAYER_SPEED, PLAYER_JUMP, PLAYER_MAX_HEALTH,
  PLAYER_INVINCIBLE_MS, ENEMY_SPEED,
} from '../config.js';
import { createTouchControls } from '../ui/TouchControls.js';
import { buildLongLevel } from '../utils/LevelBuilder.js';
import questionsData from '../data/questions.json';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.score = 0;
    this.health = PLAYER_MAX_HEALTH;
    this.teethCollected = 0;
    this.decayedTeeth = 0;
    this.isInvincible = false;
    this.isPaused = false;
    this.touchInput = { left: false, right: false, jump: false };
    this.quizIndex = 0; // tracks which quiz box maps to which question
  }

  create() {
    // Build level
    this.levelData = buildLongLevel();

    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xBBDEFB, 0xBBDEFB, 1);
    bg.fillRect(0, 0, this.levelData.width, GAME_HEIGHT);
    bg.setScrollFactor(0.1);

    // Clouds
    for (let i = 0; i < 12; i++) {
      this.add.image(
        Phaser.Math.Between(0, this.levelData.width),
        Phaser.Math.Between(30, 150), 'cloud'
      ).setScrollFactor(0.2).setAlpha(0.4 + Math.random() * 0.3);
    }

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.quizBoxes = this.physics.add.group({ allowGravity: false, immovable: true });

    // Load questions
    this.questions = questionsData || [];

    // Build level from grid
    this.quizIndex = 0;
    this._buildLevel();

    // Player
    this.playerKey = this.registry.get('playerKey') || 'player_white_none';
    this._createAnimations();

    const sp = this.levelData.spawn;
    this.player = this.physics.add.sprite(sp.x, sp.y, this.playerKey, 0);
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0.1);
    this.player.setSize(24, 44);
    this.player.setOffset(20, 20);
    this.player.play(this.playerKey + '_idle');

    // Door
    const dp = this.levelData.door;
    this.door = this.physics.add.staticSprite(dp.x, dp.y, 'door');
    this.door.setSize(TILE_SIZE - 8, TILE_SIZE * 2 - 4);
    this.door.body.setOffset(4, 2);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Player-Enemy
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.getData('dead')) return;
      if (player.body.velocity.y > 0 && player.body.bottom <= enemy.body.top + 16) {
        this._killEnemy(enemy);
        player.setVelocityY(PLAYER_JUMP * 0.5);
      } else {
        this._damagePlayer();
      }
    });

    // Player-Collectible
    this.physics.add.overlap(this.player, this.collectibles, (_, tooth) => {
      this._collectTooth(tooth);
    });

    // Player-QuizBox (OVERLAP — triggers from any direction)
    this.physics.add.overlap(this.player, this.quizBoxes, (_, box) => {
      if (!box.getData('opened') && !this.isPaused) {
        this._triggerQuiz(box);
      }
    });

    // Player-Door
    this.physics.add.overlap(this.player, this.door, () => {
      if (!this.isPaused) this._completeLevel();
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D'),
    };

    // Touch controls
    this.touchControls = createTouchControls(this, this.touchInput);

    // Camera
    this.cameras.main.setBounds(0, 0, this.levelData.width, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.fadeIn(400);

    // World bounds
    this.physics.world.setBounds(0, 0, this.levelData.width, GAME_HEIGHT + 200);

    // Launch HUD
    this.scene.launch('HUDScene', {
      health: this.health,
      score: this.score,
      teethCollected: this.teethCollected,
      decayedTeeth: this.decayedTeeth,
    });
  }

  update() {
    if (this.isPaused || !this.player || !this.player.body) return;

    // Fall death
    if (this.player.y > GAME_HEIGHT + 100) {
      this.health = 0;
      this._gameOver();
      return;
    }

    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    const leftPressed = this.cursors.left.isDown || this.wasd.left.isDown || this.touchInput.left;
    const rightPressed = this.cursors.right.isDown || this.wasd.right.isDown || this.touchInput.right;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      this.touchInput.jump;

    if (leftPressed) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
      if (onGround) this.player.play(this.playerKey + '_walk', true);
    } else if (rightPressed) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
      if (onGround) this.player.play(this.playerKey + '_walk', true);
    } else {
      this.player.setVelocityX(0);
      if (onGround) this.player.play(this.playerKey + '_idle', true);
    }

    if (jumpPressed && onGround) {
      this.player.setVelocityY(PLAYER_JUMP);
      this.touchInput.jump = false;
    }

    if (!onGround) {
      this.player.play(this.playerKey + '_jump', true);
    }

    // Enemy patrol
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.getData('dead')) return;
      const left = enemy.getData('patrolLeft');
      const right = enemy.getData('patrolRight');
      if (enemy.x <= left) {
        enemy.setVelocityX(ENEMY_SPEED);
        enemy.setFlipX(false);
      } else if (enemy.x >= right) {
        enemy.setVelocityX(-ENEMY_SPEED);
        enemy.setFlipX(true);
      }
    });
  }

  // ── Level building ──

  _buildLevel() {
    const grid = this.levelData.grid;
    const T = TILE_SIZE;

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        const x = col * T + T / 2;
        const y = row * T + T / 2;

        switch (cell) {
          case 'G':
            this.platforms.create(x, y, 'ground');
            break;
          case 'P':
            this.platforms.create(x, y, 'platform');
            break;
          case 'E': {
            const enemy = this.enemies.create(x, y - 2, 'enemy', 0);
            enemy.setBounce(0);
            enemy.setCollideWorldBounds(false);
            enemy.setSize(24, 26);
            enemy.setOffset(4, 6);
            enemy.setData('patrolLeft', x - T * 3);
            enemy.setData('patrolRight', x + T * 3);
            enemy.setData('dead', false);
            enemy.setVelocityX(-ENEMY_SPEED);
            enemy.play('enemy_walk');
            break;
          }
          case 'T': {
            const tooth = this.collectibles.create(x, y, 'tooth');
            tooth.body.setAllowGravity(false);
            this.tweens.add({
              targets: tooth, y: y - 8,
              duration: 1000 + Math.random() * 500,
              yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
            break;
          }
          case 'Q': {
            const box = this.quizBoxes.create(x, y, 'quizbox', 0);
            box.body.setAllowGravity(false);
            box.setData('opened', false);
            box.setData('questionIndex', this.quizIndex);
            this.quizIndex++;

            // Float animation for quiz box
            this.tweens.add({
              targets: box, y: y - 4,
              duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
            break;
          }
        }
      }
    }
  }

  _createAnimations() {
    if (!this.anims.exists(this.playerKey + '_idle')) {
      this.anims.create({
        key: this.playerKey + '_idle',
        frames: [{ key: this.playerKey, frame: 0 }], frameRate: 1,
      });
      this.anims.create({
        key: this.playerKey + '_walk',
        frames: [{ key: this.playerKey, frame: 1 }, { key: this.playerKey, frame: 2 }],
        frameRate: 8, repeat: -1,
      });
      this.anims.create({
        key: this.playerKey + '_jump',
        frames: [{ key: this.playerKey, frame: 3 }], frameRate: 1,
      });
    }
    if (!this.anims.exists('enemy_walk')) {
      this.anims.create({
        key: 'enemy_walk',
        frames: [{ key: 'enemy', frame: 0 }, { key: 'enemy', frame: 1 }],
        frameRate: 4, repeat: -1,
      });
      this.anims.create({
        key: 'enemy_squish',
        frames: [{ key: 'enemy', frame: 2 }], frameRate: 1,
      });
    }
  }

  // ── Game actions ──

  _killEnemy(enemy) {
    enemy.setData('dead', true);
    enemy.setVelocityX(0);
    enemy.play('enemy_squish');
    enemy.body.enable = false;

    this.score += 100;
    this._updateHUD();

    const popup = this.add.text(enemy.x, enemy.y - 20, '+100', {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: popup, y: popup.y - 40, alpha: 0, duration: 800,
      onComplete: () => popup.destroy(),
    });
    this.time.delayedCall(500, () => enemy.destroy());
  }

  _collectTooth(tooth) {
    tooth.destroy();
    this.score += 50;
    this._updateHUD();

    const popup = this.add.text(tooth.x, tooth.y - 10, '🦷 +50', {
      fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0, duration: 600,
      onComplete: () => popup.destroy(),
    });
  }

  _damagePlayer() {
    if (this.isInvincible) return;

    this.health--;
    this.isInvincible = true;
    this._updateHUD();

    this.tweens.add({
      targets: this.player, alpha: 0.3, duration: 100, yoyo: true, repeat: 7,
      onComplete: () => { if (this.player) this.player.setAlpha(1); },
    });

    const dir = this.player.flipX ? 1 : -1;
    this.player.setVelocityX(dir * 150);
    this.player.setVelocityY(-200);

    this.time.delayedCall(PLAYER_INVINCIBLE_MS, () => { this.isInvincible = false; });

    if (this.health <= 0) {
      this.time.delayedCall(500, () => this._gameOver());
    }
  }

  _resetTouchInput() {
    this.touchInput.left = false;
    this.touchInput.right = false;
    this.touchInput.jump = false;
  }

  _triggerQuiz(box) {
    this.isPaused = true;
    this._resetTouchInput();
    this.player.setVelocityX(0);
    this.physics.pause();

    // Bump animation
    this.tweens.add({
      targets: box, y: box.y - 8, duration: 100, yoyo: true, ease: 'Bounce',
    });

    const qIdx = box.getData('questionIndex');
    const question = this.questions[qIdx] || null;

    this.scene.launch('QuizScene', {
      box,
      question,
      onCorrect: () => {
        box.setFrame(1);
        box.setData('opened', true);
        box.body.enable = false;

        this.teethCollected++;
        this.score += 200;
        this._updateHUD();

        // Tooth rises from box
        const t = this.add.image(box.x, box.y, 'tooth').setScale(1);
        this.tweens.add({
          targets: t, y: box.y - 50, scaleX: 3, scaleY: 3, alpha: 0,
          duration: 1000, ease: 'Power2',
          onComplete: () => t.destroy(),
        });

        const popup = this.add.text(box.x, box.y - 30, '🦷 +1', {
          fontSize: '18px', fontFamily: 'Arial', color: '#4CAF50',
          stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5);
        this.tweens.add({
          targets: popup, y: popup.y - 40, alpha: 0, duration: 1000,
          onComplete: () => popup.destroy(),
        });

        this._resetTouchInput();
        this.physics.resume();
        this.isPaused = false;
      },
      onWrong: () => {
        box.setFrame(1);
        box.setData('opened', true);
        box.body.enable = false;

        this.decayedTeeth++;
        this._updateHUD();

        // Decayed tooth rises from box
        const dt = this.add.image(box.x, box.y, 'tooth_decay').setScale(1);
        this.tweens.add({
          targets: dt, y: box.y - 50, scaleX: 3, scaleY: 3, alpha: 0,
          duration: 1000, ease: 'Power2',
          onComplete: () => dt.destroy(),
        });

        const popup = this.add.text(box.x, box.y - 30, '🦴 ฟันผุ', {
          fontSize: '16px', fontFamily: 'Arial', color: '#FF5722',
          stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5);
        this.tweens.add({
          targets: popup, y: popup.y - 40, alpha: 0, duration: 1000,
          onComplete: () => popup.destroy(),
        });

        this._resetTouchInput();
        this.physics.resume();
        this.isPaused = false;
      },
    });
  }

  _completeLevel() {
    this.isPaused = true;
    this.physics.pause();

    const cx = this.cameras.main.scrollX + GAME_WIDTH / 2;
    const popup = this.add.text(cx, GAME_HEIGHT / 2 - 40, '⭐ ผ่านด่านแล้ว! ⭐', {
      fontSize: '36px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0);

    this.tweens.add({
      targets: popup, scaleX: 1.2, scaleY: 1.2,
      duration: 500, yoyo: true, repeat: 2,
    });

    this.time.delayedCall(2000, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', {
        win: true,
        score: this.score,
        teethCollected: this.teethCollected,
        decayedTeeth: this.decayedTeeth,
      });
    });
  }

  _gameOver() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.physics.pause();

    this.cameras.main.shake(300, 0.01);
    this.time.delayedCall(500, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', {
        win: false,
        score: this.score,
        teethCollected: this.teethCollected,
        decayedTeeth: this.decayedTeeth,
      });
    });
  }

  _updateHUD() {
    const hud = this.scene.get('HUDScene');
    if (hud && hud.updateStats) {
      hud.updateStats(this.health, this.score, this.teethCollected, this.decayedTeeth);
    }
  }
}
