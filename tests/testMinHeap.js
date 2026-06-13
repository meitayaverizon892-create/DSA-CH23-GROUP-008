const MinHeap = require('../src/datastructures/MinHeap');

const heap = new MinHeap();

// Test 1: Basic insert and peek
console.log('--- Test 1: Insert and peek ---');
heap.insert({ userId: 'A', mutualCount: 5 });
heap.insert({ userId: 'B', mutualCount: 2 });
heap.insert({ userId: 'C', mutualCount: 8 });
console.log('Peek (should be smallest, B with 2):', heap.peek());
console.log('Heap size:', heap.size());

// Test 2: Extract min
console.log('--- Test 2: Extract min ---');
const min = heap.extractMin();
console.log('Extracted:', min);
console.log('New peek (should be A with 5):', heap.peek());
console.log('Heap size after extraction:', heap.size());

// Test 3: getTopK with the candidates from Step 14
console.log('--- Test 3: getTopK (K=2) using Step 14 example ---');
const candidates = new Map([
  [4, 2], // Dan - 2 mutual friends
  [5, 1], // Eve - 1 mutual friend
  [6, 1]  // Frank - 1 mutual friend
]);
const top2 = heap.getTopK(candidates, 2);
console.log('Top 2 recommendations:', top2);

// Test 4: getTopK with more candidates, K=3
console.log('--- Test 4: getTopK (K=3) with larger candidate set ---');
const moreCandidates = new Map([
  [10, 3],
  [11, 7],
  [12, 1],
  [13, 9],
  [14, 5],
  [15, 2],
  [16, 7]
]);
const top3 = heap.getTopK(moreCandidates, 3);
console.log('Top 3 recommendations:', top3);

// Test 5: getTopK with empty candidates
console.log('--- Test 5: getTopK with empty Map ---');
const emptyTop = heap.getTopK(new Map(), 5);
console.log('Result for empty candidates:', emptyTop);

// Test 6: getTopK where K is larger than number of candidates
console.log('--- Test 6: getTopK where K > number of candidates ---');
const smallSet = new Map([[1, 4], [2, 9]]);
const topAll = heap.getTopK(smallSet, 5);
console.log('Result (only 2 candidates, K=5):', topAll);