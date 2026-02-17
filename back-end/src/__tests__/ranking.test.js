/**
 * Standalone consistency test for the film ranking logic.
 * Run with: node src/__tests__/ranking.test.js
 *
 * Validates:
 *  - Descending order by average rating
 *  - Tie-break #1: higher rating_count wins
 *  - Tie-break #2: earlier created_at wins
 *  - Films with no ratings are ranked last (average_rating = null)
 *  - Rank numbers are sequential starting at 1
 */

// ── helpers ──────────────────────────────────────────────────────

/** Reproduce the JS-side ranking logic from JuryRating.getRanking() */
function applyRanking(rows) {
  // Sort exactly like the SQL ORDER BY:
  //   average_rating DESC, rating_count DESC, created_at ASC
  // NULLs (no ratings) go last.
  const sorted = [...rows].sort((a, b) => {
    // NULL averages go to the end
    if (a.average_rating === null && b.average_rating === null) {
      if (a.rating_count !== b.rating_count) return b.rating_count - a.rating_count;
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (a.average_rating === null) return 1;
    if (b.average_rating === null) return -1;

    // Primary: average rating descending
    if (a.average_rating !== b.average_rating) return b.average_rating - a.average_rating;

    // Tie-break 1: rating count descending
    if (a.rating_count !== b.rating_count) return b.rating_count - a.rating_count;

    // Tie-break 2: earliest submission ascending
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return sorted.map((row, i) => ({ rank: i + 1, ...row }));
}

// ── test dataset ─────────────────────────────────────────────────

const testDataset = [
  {
    film_id: 1,
    title: "Sunspring",
    average_rating: 8.5,
    rating_count: 4,
    created_at: "2026-01-26T10:00:00.000Z",
  },
  {
    film_id: 2,
    title: "The Frost",
    average_rating: 8.5,   // same avg as Sunspring
    rating_count: 3,        // fewer ratings → loses tie-break #1
    created_at: "2026-01-26T10:01:00.000Z",
  },
  {
    film_id: 3,
    title: "Digital Dreams",
    average_rating: 8.5,   // same avg
    rating_count: 3,        // same count as The Frost
    created_at: "2026-01-26T09:00:00.000Z", // earlier → wins tie-break #2
  },
  {
    film_id: 4,
    title: "Mars Colony 2084",
    average_rating: 7.0,
    rating_count: 5,
    created_at: "2026-01-26T10:02:00.000Z",
  },
  {
    film_id: 5,
    title: "No Ratings Film",
    average_rating: null,   // no jury votes yet
    rating_count: 0,
    created_at: "2026-01-25T08:00:00.000Z",
  },
];

// ── assertions ───────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ── run tests ────────────────────────────────────────────────────

console.log("Film ranking consistency tests\n");

const ranked = applyRanking(testDataset);

console.log("Ranked output:");
ranked.forEach((r) =>
  console.log(
    `  #${r.rank}  ${r.title.padEnd(20)} avg=${String(r.average_rating).padStart(4)}  count=${r.rating_count}  date=${r.created_at}`
  )
);
console.log("");

// Test 1: ranks are sequential 1..N
console.log("Sequential ranks:");
assert(
  ranked.every((r, i) => r.rank === i + 1),
  "Ranks are sequential from 1 to N"
);

// Test 2: highest average is ranked first
console.log("Descending average:");
assert(ranked[0].average_rating === 8.5, "Rank 1 has avg 8.5");
assert(ranked[3].average_rating === 7.0, "Rank 4 has avg 7.0");

// Test 3: tie-break #1 — more ratings wins
console.log("Tie-break #1 (rating count):");
assert(
  ranked[0].title === "Sunspring" && ranked[0].rating_count === 4,
  "Sunspring (4 ratings) beats others with avg 8.5"
);

// Test 4: tie-break #2 — earlier date wins when count is equal
console.log("Tie-break #2 (created_at):");
const digitalDreams = ranked.find((r) => r.title === "Digital Dreams");
const theFrost = ranked.find((r) => r.title === "The Frost");
assert(
  digitalDreams.rank < theFrost.rank,
  "Digital Dreams (earlier date) beats The Frost (same avg & count)"
);

// Test 5: null averages go last
console.log("Null ratings:");
const noRatings = ranked.find((r) => r.title === "No Ratings Film");
assert(
  noRatings.rank === ranked.length,
  "Film with no ratings is ranked last"
);

// Test 6: expected full ordering
console.log("Full ordering:");
const expectedOrder = [
  "Sunspring",         // 8.5, 4 ratings
  "Digital Dreams",    // 8.5, 3 ratings, earlier date
  "The Frost",         // 8.5, 3 ratings, later date
  "Mars Colony 2084",  // 7.0
  "No Ratings Film",   // null
];
const actualOrder = ranked.map((r) => r.title);
assert(
  JSON.stringify(actualOrder) === JSON.stringify(expectedOrder),
  `Order is ${expectedOrder.join(" → ")}`
);

// ── summary ──────────────────────────────────────────────────────

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
