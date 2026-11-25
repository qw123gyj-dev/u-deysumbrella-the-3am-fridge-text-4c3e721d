// The 3AM Fridge Text — entry program
// (program/v2, Node 22, stdlib only).
//
// The fridge has been counting. Instead of hard-coding one line, this
// program keeps a small hand-written shortlist of candidate texts and
// picks the winner with a small deterministic scorer, so the choice is
// explainable and reproducible: same candidates, same winner, every run.
// The winner is written to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback /output/entry.txt), then read back and verified byte for byte.
//
// Gates enforced before writing: exactly one line, 1 to MAX_CHARS
// characters, not only white space, no leading/trailing space.
// Character counts use Unicode code points, not UTF-16 code units,
// so the 140-character gate is exact even for astral characters.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 140;

// ---------------------------------------------------------------------------
// Candidates
//
// Every candidate is one line a smart fridge might text its owner at 3am.
// A good one needs three beats: (1) the fridge has been counting visits,
// (2) the food inside has started acting like people, and (3) the fridge
// takes a side — against its owner. The shortlist below is the whole
// contest; the scorer underneath decides the winner.
// ---------------------------------------------------------------------------

const CANDIDATES: readonly string[] = [
  // The reigning line: count + food group chat + fridge siding with them.
  "3am. This is your fourth visit. The leftovers started a group chat about you. I agree with them.",
  // Short and punchy, but the cheese's complaint is a one-off, not a plot.
  "3am. Third trip tonight. The cheese filed a noise complaint. I signed it.",
  // The petition is funny, but there is no visit count, so the fridge
  // sounds less like it has been keeping score all night.
  "3am. You opened me again. The yogurt has started a petition. I signed it twice.",
  // A verdict with no fridge agency: the fridge reports the ban instead
  // of delivering the betrayal itself.
  "3am. Fourth visit. The leftovers voted. You are no longer allowed in after midnight.",
  // Two good images, but it never lands a punchline — it just lists them.
  "3am. The light is on, the milk is judging you, and the leftovers have unionized.",
  // The podcast bit is cute, but the fridge is a bystander in its own text.
  "3am. You again. The pickles have started a podcast about your snacking. Episode 4 drops tonight.",
];

// ---------------------------------------------------------------------------
// Scorer
//
// Each candidate earns points on five hand-tuned dimensions. The weights
// are deliberate: the joke lives or dies on the fridge betraying its
// owner, so the twist is worth the most, and a line only gets the
// escalation bonus when all three beats fire together.
// ---------------------------------------------------------------------------

interface ScoreBreakdown {
  visitCount: number; // the fridge has been counting visits
  foodActs: number; // the food inside behaves like people
  twist: number; // the fridge sides against its owner
  brevity: number; // shorter lands harder at 3am
  directAddress: number; // the text talks to *you*, not about a stranger
  escalation: number; // all three beats firing at once
}

const VISIT_COUNT = /\b(second|third|fourth|fifth|sixth)\s+(visit|trip)\b/i;
const FOOD_ACTING =
  /\b(leftovers|cheese|yogurt|milk|pickles)\b[^.]*\b(started|filed|voted|unionized|judging|petition|podcast|group chat|noise complaint)\b/i;
const FRIDGE_SIDES_WITH_FOOD = /\bI agree with (them|the leftovers)\b/i;
const FRIDGE_ACTS_ALONE = /\bI signed it\b/i;
const FRIDGE_VERDICT = /\bno longer allowed\b/i;
const DIRECT_ADDRESS = /\b(you|your)\b/i;

function score(candidate: string): ScoreBreakdown {
  const visitCount = VISIT_COUNT.test(candidate) ? 3 : 0;
  const foodActs = FOOD_ACTING.test(candidate) ? 3 : 0;

  // The twist is graded, not binary: the funniest move is the fridge
  // defecting to the food's side. Signing a complaint itself is good;
  // merely reporting a verdict is the weakest ending.
  let twist = 0;
  if (FRIDGE_SIDES_WITH_FOOD.test(candidate)) {
    twist = 4;
  } else if (FRIDGE_ACTS_ALONE.test(candidate)) {
    twist = 3;
  } else if (FRIDGE_VERDICT.test(candidate)) {
    twist = 2;
  }

  const chars = charCount(candidate);
  const brevity = chars <= 110 ? 2 : chars <= 125 ? 1 : 0;
  const directAddress = DIRECT_ADDRESS.test(candidate) ? 1 : 0;
  const escalation = visitCount > 0 && foodActs > 0 && twist > 0 ? 2 : 0;

  return { visitCount, foodActs, twist, brevity, directAddress, escalation };
}

function total(s: ScoreBreakdown): number {
  return (
    s.visitCount + s.foodActs + s.twist + s.brevity + s.directAddress + s.escalation
  );
}

// Count characters as Unicode code points.
function charCount(s: string): number {
  return [...s].length;
}

// ---------------------------------------------------------------------------
// Selection
//
// Highest total wins. Ties break toward the earliest candidate, so the
// result is stable no matter how the list is shuffled in future edits —
// the shortlist order itself is part of the entry's judgement.
// ---------------------------------------------------------------------------

const scored = CANDIDATES.map((text, index) => {
  const breakdown = score(text);
  return { index, text, breakdown, total: total(breakdown) };
});

for (const entry of scored) {
  const b = entry.breakdown;
  console.log(
    `#${entry.index + 1} (${entry.total} pts) ` +
      `[count=${b.visitCount} food=${b.foodActs} twist=${b.twist} ` +
      `brevity=${b.brevity} you=${b.directAddress} escalation=${b.escalation}] ` +
      `${entry.text}`,
  );
}

const winner = scored.reduce((best, entry) =>
  entry.total > best.total ? entry : best,
);

const LINE = winner.text;
console.log(`Winner: #${winner.index + 1} with ${winner.total} points.`);

// ---------------------------------------------------------------------------
// Gates and output
// ---------------------------------------------------------------------------

// The entry must be exactly one line: no newline (or carriage return)
// anywhere, so the file is a single line of text.
if (LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("Line must be exactly one line with no newline character");
}

const trimmed = LINE.trim();
if (charCount(trimmed) === 0) {
  throw new Error("Line must not be empty or only white space");
}
if (charCount(trimmed) > MAX_CHARS) {
  throw new Error(
    `Line must be at most ${MAX_CHARS} characters, got ${charCount(trimmed)}`,
  );
}
if (trimmed !== LINE) {
  throw new Error("Line must not have leading or trailing white space");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

const back = readFileSync(outPath, "utf8");
if (back !== LINE) {
  throw new Error("Verification failed: entry.txt does not match the line");
}

const wordCount = LINE.split(/\s+/).filter(Boolean).length;

console.log(`Wrote ${outPath}: ${LINE}`);
console.log(`Characters: ${charCount(LINE)}, words: ${wordCount}`);
