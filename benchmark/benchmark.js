const UserRegistry = require('../src/datastructures/UserRegistry');
const FriendGraph = require('../src/datastructures/FriendGraph');
const MutualFriends = require('../src/algorithms/MutualFriends');
const MinHeap = require('../src/datastructures/MinHeap');
const { mergeSort, binarySearch } = require('../src/algorithms/Sorting');
const User = require('../src/models/User');

// Sizes to test, as defined in our Constraints (Step 2)
const sizes = [100, 1000, 5000, 10000];

console.log('========================================');
console.log('  BENCHMARK RESULTS');
console.log('========================================\n');

console.log(
  'n (users)'.padEnd(12) +
  'Build(ms)'.padEnd(12) +
  'Lookup(ms)'.padEnd(12) +
  'BFS(ms)'.padEnd(12) +
  'Sort(ms)'.padEnd(12) +
  'Search(ms)'.padEnd(12)
);
console.log('-'.repeat(72));

for (const n of sizes) {
  // ============================================================
  // SETUP: Build n users and a random friend graph
  // ============================================================
  const registry = new UserRegistry();
  const graph = new FriendGraph();
  const mf = new MutualFriends();

  const buildStart = Date.now();

  // Create n users
  for (let i = 1; i <= n; i++) {
    registry.addUser(new User(i, `user${i}`, `user${i}@test.com`, 'pass'));
    graph.addUser(i);
  }

  // Create random friendships (~15 friends per user on average,
  // matching our Step 2 assumptions)
  const targetFriendsPerUser = 15;
  for (let i = 1; i <= n; i++) {
    for (let f = 0; f < targetFriendsPerUser; f++) {
      const randomFriend = Math.floor(Math.random() * n) + 1;
      if (randomFriend !== i && !graph.areFriends(i, randomFriend)) {
        try {
          graph.addFriendship(i, randomFriend);
        } catch (e) {
          // ignore errors from duplicate/self attempts
        }
      }
    }
  }

  const buildTime = Date.now() - buildStart;

  // ============================================================
  // TEST 1: HashMap Lookup — O(1)
  // ============================================================
  const lookupStart = Date.now();
  for (let i = 0; i < 1000; i++) {
    const randomId = Math.floor(Math.random() * n) + 1;
    registry.getUserById(randomId);
  }
  const lookupTime = Date.now() - lookupStart;

  // ============================================================
  // TEST 2: BFS Recommendations — O(V + E)
  // ============================================================
  const bfsStart = Date.now();
  const randomUser = Math.floor(Math.random() * n) + 1;
  mf.getFriendsOfFriends(graph, randomUser);
  const bfsTime = Date.now() - bfsStart;

  // ============================================================
  // TEST 3: Merge Sort — O(n log n)
  // ============================================================
  const allUsers = registry.getAllUsers();
  const sortStart = Date.now();
  const sorted = mergeSort(allUsers);
  const sortTime = Date.now() - sortStart;

  // ============================================================
  // TEST 4: Binary Search — O(log n)
  // ============================================================
  const searchStart = Date.now();
  for (let i = 0; i < 1000; i++) {
    const randomId = Math.floor(Math.random() * n) + 1;
    binarySearch(sorted, `user${randomId}`);
  }
  const searchTime = Date.now() - searchStart;

  // ============================================================
  // Print results row
  // ============================================================
  console.log(
    n.toString().padEnd(12) +
    buildTime.toString().padEnd(12) +
    lookupTime.toString().padEnd(12) +
    bfsTime.toString().padEnd(12) +
    sortTime.toString().padEnd(12) +
    searchTime.toString().padEnd(12)
  );
}

console.log('\n========================================');
console.log('  NOTES:');
console.log('  - Lookup and Search times are for 1000 operations combined');
console.log('  - BFS time is for ONE recommendation query');
console.log('  - Sort time is for sorting ALL n users once');
console.log('========================================');