# 🦷 Dental Quest - เกมผจญภัยหมอฟัน

Dental Quest เป็นเกมแนว 2D Platformer Quiz Game ที่พัฒนาด้วย Phaser 3 และ Vite ผู้เล่นจะได้รับบทบาทเป็นหมอฟันที่ต้องผจญภัยผ่านด่านต่างๆ และตอบคำถามเกี่ยวกับทันตกรรมเพื่อเก็บคะแนนและเรียนรู้ความรู้ใหม่ๆ

## 🌟 คุณสมบัติเด่น (Features)
- **สไตล์ Mario:** การควบคุมตัวละครในรูปแบบ Platformer คลาสสิก
- **ระบบ Quiz:** แทรกชุดคำถามความรู้ด้านทันตกรรม (1-21 ข้อ) ระหว่างการเล่น
- **รองรับ Touch Controls:** ออกแบบมาให้รองรับการเล่นบนอุปกรณ์พกพา (iOS/Android) ทั้งในแนวตั้งและแนวนอน
- **กราฟิก Pixel Art:** ดีไซน์ตัวละครและสภาพแวดล้อมที่น่ารัก
- **ระบบคะแนน:** เก็บเหรียญและสะสมดาวจากการตอบคำถาม

## 🛠️ วิธีการติดตั้งและรันโปรเจค (Installation & Setup)

1. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

2. **รันในโหมด Development:**
   ```bash
   npm run dev
   ```

3. **Build สำหรับ Production:**
   ```bash
   npm run build
   ```

4. **Preview ตัว Build:**
   ```bash
   npm run preview
   ```

## 📂 โครงสร้างโปรเจค (Project Structure)
- `src/main.js`: จุดเริ่มต้นของเกมและคอนฟิกูเรชัน Phaser
- `src/scenes/`: ไฟล์ Scene ต่างๆ (Boot, Menu, Game, HUD, Quiz, GameOver)
- `src/data/questions.json`: ฐานข้อมูลคำถาม Quiz
- `public/assets/`: ไฟล์รูปภาพ เสียง และทรัพยากรต่างๆ

## 🎮 วิธีการเล่น (How to Play)
- **เคลื่อนที่:** ใช้ปุ่มลูกศรหรือปุ่มบนหน้าจอ (Touch Controls)
- **กระโดด:** ใช้ปุ่มขึ้นหรือปุ่มกระโดดบนหน้าจอ
- **Quiz:** เมื่อเจอจุดทดสอบ ให้เลือกคำตอบที่ถูกต้องเพื่อดำเนินการต่อ

---
พัฒนาโดย **Gamuuu** (siwakorn.p.1010@gmail.com)
