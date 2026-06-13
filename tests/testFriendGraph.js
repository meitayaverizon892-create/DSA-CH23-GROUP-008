const FriendGraph = require('../src/datastructures/FriendGraph');

const graph = new FriendGraph();

// Add users
console.log('--- Test 1: Add users ---');
graph.addUser(1); // Alice
graph.addUser(2); // Bob
graph.addUser(3); // Carol
graph.addUser(4); // Dan
console.log('Total users:', graph.getTotalUsers());

// Add friendships
console.log('--- Test 2: Add friendships ---');
graph.addFriendship(1, 2); // Alice - Bob
graph.addFriendship(1, 3); // Alice - Carol
graph.addFriendship(2, 4); // Bob - Dan
graph.addFriendship(3, 4); // Carol - Dan
console.log('Total edges:', graph.getTotalEdges());

// Check friends list
console.log('--- Test 3: Get friends ---');
console.log('Alice (1) friends:', graph.getFriends(1));
console.log('Dan (4) friends:', graph.getFriends(4));

// Check areFriends
console.log('--- Test 4: areFriends check ---');
console.log('Alice & Bob friends?', graph.areFriends(1, 2));
console.log('Alice & Dan friends?', graph.areFriends(1, 4));

// Check friend count
console.log('--- Test 5: Friend count ---');
console.log('Bob (2) friend count:', graph.getFriendCount(2));

// Remove a friendship
console.log('--- Test 6: Remove friendship ---');
graph.removeFriendship(1, 2);
console.log('Alice & Bob friends after removal?', graph.areFriends(1, 2));
console.log('Total edges after removal:', graph.getTotalEdges());

// Test self-friendship error
console.log('--- Test 7: Self-friendship (should throw error) ---');
try {
  graph.addFriendship(1, 1);
} catch (error) {
  console.log('Caught error:', error.message);
}

// Test duplicate friendship error
console.log('--- Test 8: Duplicate friendship (should throw error) ---');
try {
  graph.addFriendship(1, 3); // Already friends from Test 2
} catch (error) {
  console.log('Caught error:', error.message);
}