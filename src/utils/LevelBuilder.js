import { TILE_SIZE, GAME_HEIGHT, GAME_WIDTH } from '../config.js';

/**
 * Procedural level generator for a single long level with 21 quiz boxes.
 *
 * Jump physics (GRAVITY=800, JUMP=-520, SPEED=200):
 *   Max height: ~5 tiles (169px)  →  safe platform diff: 3 tiles
 *   Max horizontal: ~8 tiles       →  safe gap: 5 tiles
 */

const ROWS = Math.floor(GAME_HEIGHT / TILE_SIZE); // 18
const SECTION_W = 18; // tiles per section
const NUM_QUIZ = 21;

// Section templates: 18 rows × 18 cols
// Legend: G=ground, P=platform, Q=quiz, T=tooth, E=enemy, .=air

function makeSection(strings) {
  return strings.map(r => r.padEnd(SECTION_W, '.').split(''));
}

const SEC_START = makeSection([
  '..................', // 0
  '..................', // 1
  '..................', // 2
  '..................', // 3
  '..................', // 4
  '..................', // 5
  '..................', // 6
  '..................', // 7
  '..................', // 8
  '..................', // 9
  '..................', // 10
  '..................', // 11
  '..................', // 12
  '..................', // 13
  '...T...T...T......', // 14
  '..................', // 15
  '..................', // 16
  'GGGGGGGGGGGGGGGGGG', // 17
]);

// Pattern A: quiz on ground level (easy)
const SEC_QUIZ_GROUND = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..T...T...T.......',
  '..................',
  '..................',
  '.......Q..........',
  'GGGGGGGGGGGGGGGGGG',
]);

// Pattern B: quiz on low platform (easy-medium)
const SEC_QUIZ_LOW = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..T...T...........',
  '........Q.........',
  '.......PPPPP......',
  '..................',
  '..E...............',
  'GGGGGGGGGGGGGGGGGG',
]);

// Pattern C: quiz on mid platform with step (medium)
const SEC_QUIZ_MID = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '......T...........',
  '.......Q..........',
  '......PPPP........',
  '..................',
  '...PPP............',
  '..................',
  '..................',
  'GGGGGGGGGGGGGGGGGG',
]);

// Pattern D: quiz over gap (medium-hard)
const SEC_QUIZ_GAP = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..T...T...........',
  '........Q.........',
  '.......PPP........',
  '..................',
  '..................',
  '..................',
  'GGGGGGG....GGGGGGG',
]);

// Pattern E: staircase quiz (hard)
const SEC_QUIZ_STAIR = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..T...............',
  '...Q..............',
  '..PPPP............',
  '..................',
  '........PPP.......',
  '..................',
  '....PPP...........',
  '.E................',
  'GGGGGGGGGGGGGGGGGG',
]);

// Transition: simple gap
const SEC_GAP = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '......T...........',
  '.....PPP..........',
  '..................',
  '..................',
  'GGGGGGG....GGGGGGG',
]);

// Transition: flat with enemy
const SEC_FLAT_ENEMY = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..T.....T.....T...',
  '..................',
  '..................',
  '...E.......E......',
  'GGGGGGGGGGGGGGGGGG',
]);

// End section with door area
const SEC_END = makeSection([
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  'GGGGGGGGGGGGGGGGGG',
]);

const QUIZ_PATTERNS = [SEC_QUIZ_GROUND, SEC_QUIZ_LOW, SEC_QUIZ_MID, SEC_QUIZ_GAP, SEC_QUIZ_STAIR];
const TRANSITION_PATTERNS = [SEC_GAP, SEC_FLAT_ENEMY];

function stitchSections(sectionList) {
  const rows = ROWS;
  const grid = Array.from({ length: rows }, () => []);

  for (const section of sectionList) {
    for (let r = 0; r < rows; r++) {
      grid[r].push(...section[r]);
    }
  }
  return grid;
}

export function buildLongLevel() {
  const sections = [SEC_START];

  for (let i = 0; i < NUM_QUIZ; i++) {
    // Pick quiz pattern: progressively harder
    let patIdx;
    if (i < 5) patIdx = i % 2;           // easy (ground/low)
    else if (i < 10) patIdx = 1 + (i % 2); // easy-medium (low/mid)
    else if (i < 15) patIdx = 2 + (i % 2); // medium-hard (mid/gap)
    else patIdx = 3 + (i % 2);             // hard (gap/stair)

    sections.push(QUIZ_PATTERNS[patIdx]);

    // Add transition every 4 quiz boxes (not after last)
    if ((i + 1) % 4 === 0 && i < NUM_QUIZ - 1) {
      sections.push(TRANSITION_PATTERNS[i % 2]);
    }
  }

  sections.push(SEC_END);

  const grid = stitchSections(sections);
  const totalCols = grid[0].length;

  return {
    name: 'Dental Quest — ด่านผจญภัยหมอฟัน',
    grid,
    spawn: { x: 64, y: GAME_HEIGHT - 120 },
    door: { x: (totalCols - 3) * TILE_SIZE, y: GAME_HEIGHT - 96 },
    width: totalCols * TILE_SIZE,
  };
}
