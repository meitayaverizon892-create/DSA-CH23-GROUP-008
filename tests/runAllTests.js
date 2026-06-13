const assert = require('assert');

// Import all data structures and algorithms
const UserRegistry = require('../src/datastructures/UserRegistry');
const FriendGraph = require('../src/datastructures/FriendGraph');
const ActionStack = require('../src/datastructures/ActionStack');
const RequestQueue = require('../src/datastructures/RequestQueue');
const MinHeap = require('../src/datastructures/MinHeap');
const MutualFriends = require('../src/algorithms/MutualFriends');
const { mergeSort, binarySearch } = require('../src/algorithms/Sorting');
const User = require('../src/models/User');

let passed = 0;
let failed = 0;

// Helper function to run a single test
function test(description, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

console.log('========================================');
console.log('  RUNNING ALL TEST CASES');
console.log('========================================\n');

// ============================================================
// SECTION 1: User Registry (Hash Map) Tests
// ============================================================
console.log('--- Hash Map: User Registry ---');

test('TC01: Add a user and retrieve by ID', () => {
  const registry = new UserRegistry();
  const user = new User(1, 'alice', 'alice@test.com', 'pass');
  registry.addUser(user);
  const found = registry.getUserById(1);
  assert.strictEqual(found.username, 'alice');
});

test('TC02: Retrieve a user by username', () => {
  const registry = new UserRegistry();
  registry.addUser(new User(1, 'alice', 'alice@test.com', 'pass'));
  const found = registry.getUserByUsername('alice');
  assert.strictEqual(found.id, 1);
});

test('TC03: Reject duplicate username (edge case)', () => {
  const registry = new UserRegistry();
  registry.addUser(new User(1, 'alice', 'alice@test.com', 'pass'));
  assert.throws(() => {
    registry.addUser(new User(2, 'alice', 'other@test.com', 'pass'));
  }, /already taken/);
});

test('TC04: Get all users returns correct count', () => {
  const registry = new UserRegistry();
  registry.addUser(new User(1, 'alice', 'a@test.com', 'pass'));
  registry.addUser(new User(2, 'bob', 'b@test.com', 'pass'));
  assert.strictEqual(registry.getAllUsers().length, 2);
});

// ============================================================
// SECTION 2: Friend Graph (Adjacency List) Tests
// ============================================================
console.log('\n--- Graph: Friend Graph (Adjacency List) ---');

test('TC05: Add friendship creates bidirectional connection', () => {
  const graph = new FriendGraph();
  graph.addUser(1);
  graph.addUser(2);
  graph.addFriendship(1, 2);
  assert.strictEqual(graph.areFriends(1, 2), true);
  assert.strictEqual(graph.areFriends(2, 1), true);
});

test('TC06: Reject self-friendship (edge case)', () => {
  const graph = new FriendGraph();
  graph.addUser(1);
  assert.throws(() => {
    graph.addFriendship(1, 1);
  }, /cannot be friends with themselves/);
});

test('TC07: Reject duplicate friendship (edge case)', () => {
  const graph = new FriendGraph();
  graph.addUser(1);
  graph.addUser(2);
  graph.addFriendship(1, 2);
  assert.throws(() => {
    graph.addFriendship(1, 2);
  }, /already friends/);
});

test('TC08: Remove friendship correctly disconnects users', () => {
  const graph = new FriendGraph();
  graph.addUser(1);
  graph.addUser(2);
  graph.addFriendship(1, 2);
  graph.removeFriendship(1, 2);
  assert.strictEqual(graph.areFriends(1, 2), false);
});

// ============================================================
// SECTION 3: Action Stack (LIFO / Undo) Tests
// ============================================================
console.log('\n--- Stack: Action Stack (Undo) ---');

test('TC09: Undo reverses the last friendship', () => {
  const graph = new FriendGraph();
  const stack = new ActionStack(10);
  graph.addUser(1);
  graph.addUser(2);
  graph.addFriendship(1, 2);
  stack.push({ type: 'ADD_FRIENDSHIP', userIdA: 1, userIdB: 2 });

  const result = stack.undo(graph);
  assert.strictEqual(result.success, true);
  assert.strictEqual(graph.areFriends(1, 2), false);
});

test('TC10: Undo on empty stack returns failure (edge case)', () => {
  const graph = new FriendGraph();
  const stack = new ActionStack(10);
  const result = stack.undo(graph);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.message, 'Nothing to undo');
});

test('TC11: Stack respects bounded max size (edge case)', () => {
  const stack = new ActionStack(3); // max size 3
  stack.push({ type: 'TEST', id: 1 });
  stack.push({ type: 'TEST', id: 2 });
  stack.push({ type: 'TEST', id: 3 });
  stack.push({ type: 'TEST', id: 4 }); // should evict id:1
  assert.strictEqual(stack.size(), 3);
  assert.strictEqual(stack.stack[0].id, 2); // oldest remaining is id:2
});

// ============================================================
// SECTION 4: Request Queue (FIFO) Tests
// ============================================================
console.log('\n--- Queue: Friend Request Queue (FIFO) ---');

test('TC12: Requests are processed in FIFO order', () => {
  const graph = new FriendGraph();
  const stack = new ActionStack(10);
  const queue = new RequestQueue();

  graph.addUser(1);
  graph.addUser(2);
  graph.addUser(3);

  queue.enqueue({ senderId: 1, receiverId: 2, timestamp: Date.now() });
  queue.enqueue({ senderId: 1, receiverId: 3, timestamp: Date.now() });

  const result1 = queue.processNext(graph, stack);
  assert.strictEqual(result1.message.includes('user 1 and user 2'), true);

  const result2 = queue.processNext(graph, stack);
  assert.strictEqual(result2.message.includes('user 1 and user 3'), true);
});

test('TC13: Process from empty queue returns failure (edge case)', () => {
  const graph = new FriendGraph();
  const stack = new ActionStack(10);
  const queue = new RequestQueue();

  const result = queue.processNext(graph, stack);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.message, 'No pending requests');
});

test('TC14: Duplicate request detection (edge case)', () => {
  const queue = new RequestQueue();
  queue.enqueue({ senderId: 1, receiverId: 2, timestamp: Date.now() });
  assert.strictEqual(queue.requestExists(1, 2), true);
  assert.strictEqual(queue.requestExists(2, 1), false); // different direction
});

// ============================================================
// SECTION 5: BFS / Mutual Friends (Graph Traversal) Tests
// ============================================================
console.log('\n--- Graph: BFS Mutual Friends & Recommendations ---');

// Build a shared graph for these tests:
//   Alice(1) -- Bob(2)
//   Alice(1) -- Carol(3)
//   Bob(2)   -- Dan(4)
//   Carol(3) -- Dan(4)
function buildTestGraph() {
  const graph = new FriendGraph();
  for (let i = 1; i <= 4; i++) graph.addUser(i);
  graph.addFriendship(1, 2);
  graph.addFriendship(1, 3);
  graph.addFriendship(2, 4);
  graph.addFriendship(3, 4);
  return graph;
}

test('TC15: getMutual finds correct mutual friends', () => {
  const graph = buildTestGraph();
  const mf = new MutualFriends();
  const mutual = mf.getMutual(graph, 1, 4); // Alice & Dan
  assert.deepStrictEqual(mutual.sort(), [2, 3]); // Bob and Carol
});

test('TC16: getMutual returns empty array when no overlap (edge case)', () => {
  const graph = new FriendGraph();
  graph.addUser(1);
  graph.addUser(2);
  graph.addUser(3);
  graph.addFriendship(1, 2);
  graph.addFriendship(2, 3);
  // User 1 and User 3 share NO mutual friends besides each other's direct link
  const mf = new MutualFriends();
  const mutual = mf.getMutual(graph, 1, 3);
  assert.deepStrictEqual(mutual, []);
});

test('TC17: getFriendsOfFriends excludes existing friends and self', () => {
  const graph = buildTestGraph();
  const mf = new MutualFriends();
  const candidates = mf.getFriendsOfFriends(graph, 1); // Alice
  assert.strictEqual(candidates.has(1), false); // not herself
  assert.strictEqual(candidates.has(2), false); // not Bob (already friend)
  assert.strictEqual(candidates.has(3), false); // not Carol (already friend)
  assert.strictEqual(candidates.has(4), true);  // Dan IS a candidate
  assert.strictEqual(candidates.get(4), 2);      // with 2 mutual friends
});

test('TC18: getFriendsOfFriends on isolated user returns empty (edge case)', () => {
  const graph = new FriendGraph();
  graph.addUser(99); // isolated user, no friends
  const mf = new MutualFriends();
  const candidates = mf.getFriendsOfFriends(graph, 99);
  assert.strictEqual(candidates.size, 0);
});

test('TC19: getShortestPath returns correct distance', () => {
  const graph = buildTestGraph();
  const mf = new MutualFriends();
  assert.strictEqual(mf.getShortestPath(graph, 1, 1), 0); // same user
  assert.strictEqual(mf.getShortestPath(graph, 1, 2), 1); // direct friend
  assert.strictEqual(mf.getShortestPath(graph, 1, 4), 2); // friend of friend
});

test('TC20: getShortestPath returns -1 for disconnected users (edge case)', () => {
  const graph = new FriendGraph();
  graph.addUser(1);
  graph.addUser(2); // no connection at all
  const mf = new MutualFriends();
  assert.strictEqual(mf.getShortestPath(graph, 1, 2), -1);
});

// ============================================================
// SECTION 6: Min-Heap (Top-K) Tests
// ============================================================
console.log('\n--- Heap: Min-Heap Top-K Recommendations ---');

test('TC21: getTopK returns highest mutual counts only', () => {
  const heap = new MinHeap();
  const candidates = new Map([
    [10, 3], [11, 7], [12, 1], [13, 9], [14, 5]
  ]);
  const top2 = heap.getTopK(candidates, 2);
  const ids = top2.map(c => c.userId).sort();
  assert.deepStrictEqual(ids, [11, 13]); // counts 7 and 9 are the top 2
});

test('TC22: getTopK with K larger than candidates returns all (edge case)', () => {
  const heap = new MinHeap();
  const candidates = new Map([[1, 5], [2, 3]]);
  const top = heap.getTopK(candidates, 5);
  assert.strictEqual(top.length, 2);
});

test('TC23: getTopK with empty candidates returns empty (edge case)', () => {
  const heap = new MinHeap();
  const top = heap.getTopK(new Map(), 5);
  assert.deepStrictEqual(top, []);
});

// ============================================================
// SECTION 7: Sorting & Searching Tests
// ============================================================
console.log('\n--- Sorting + Searching: Merge Sort & Binary Search ---');

test('TC24: mergeSort sorts users alphabetically (case-insensitive)', () => {
  const users = [
    { id: 1, username: 'Carol' },
    { id: 2, username: 'alice' },
    { id: 3, username: 'Bob' },
  ];
  const sorted = mergeSort(users);
  assert.deepStrictEqual(sorted.map(u => u.username), ['alice', 'Bob', 'Carol']);
});

test('TC25: binarySearch finds existing user', () => {
  const sorted = [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
    { id: 3, username: 'carol' },
  ];
  const found = binarySearch(sorted, 'bob');
  assert.strictEqual(found.id, 2);
});

test('TC26: binarySearch returns null for non-existent user (edge case)', () => {
  const sorted = [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
  ];
  const found = binarySearch(sorted, 'zara');
  assert.strictEqual(found, null);
});

test('TC27: binarySearch is case-insensitive', () => {
  const sorted = [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
  ];
  const found = binarySearch(sorted, 'ALICE');
  assert.strictEqual(found.id, 1);
});

test('TC28: mergeSort handles empty array (edge case)', () => {
  assert.deepStrictEqual(mergeSort([]), []);
});

// ============================================================
// SUMMARY
// ============================================================
console.log('\n========================================');
console.log(`  RESULTS: ${passed} passed, ${failed} failed (out of ${passed + failed})`);
console.log('========================================');

if (failed > 0) {
  process.exit(1); // non-zero exit code if any test failed
}