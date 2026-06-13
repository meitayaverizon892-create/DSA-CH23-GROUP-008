const FriendGraph = require('../src/datastructures/FriendGraph');
const MutualFriends = require('../src/algorithms/MutualFriends');

// Build the graph from the example diagram above
const graph = new FriendGraph();
for (let i = 1; i <= 6; i++) graph.addUser(i);

// Names: 1=Alice, 2=Bob, 3=Carol, 4=Dan, 5=Eve, 6=Frank
graph.addFriendship(1, 2); // Alice - Bob
graph.addFriendship(1, 3); // Alice - Carol
graph.addFriendship(2, 4); // Bob - Dan
graph.addFriendship(2, 5); // Bob - Eve
graph.addFriendship(3, 4); // Carol - Dan
graph.addFriendship(3, 6); // Carol - Frank

const mf = new MutualFriends();

// Test 1: Mutual friends between Alice and Dan
console.log('--- Test 1: Mutual friends (Alice & Dan) ---');
console.log('Alice friends:', graph.getFriends(1));
console.log('Dan friends:', graph.getFriends(4));
console.log('Mutual:', mf.getMutual(graph, 1, 4));

// Test 2: Mutual friends between Alice and Eve
console.log('--- Test 2: Mutual friends (Alice & Eve) ---');
console.log('Mutual:', mf.getMutual(graph, 1, 5));

// Test 3: Friends-of-friends (recommendations) for Alice
console.log('--- Test 3: Friends-of-friends for Alice (BFS) ---');
const candidates = mf.getFriendsOfFriends(graph, 1);
console.log('Candidates with mutual counts:', candidates);

// Test 4: Shortest path from Alice to Frank
console.log('--- Test 4: Shortest path (Alice -> Frank) ---');
console.log('Distance:', mf.getShortestPath(graph, 1, 6));

// Test 5: Shortest path from Alice to herself
console.log('--- Test 5: Shortest path (Alice -> Alice) ---');
console.log('Distance:', mf.getShortestPath(graph, 1, 1));

// Test 6: Shortest path between direct friends
console.log('--- Test 6: Shortest path (Alice -> Bob, direct friends) ---');
console.log('Distance:', mf.getShortestPath(graph, 1, 2));

// Test 7: Friends-of-friends for a user with NO friends
console.log('--- Test 7: Friends-of-friends for isolated user ---');
graph.addUser(7); // Grace - no friendships
const isolatedCandidates = mf.getFriendsOfFriends(graph, 7);
console.log('Candidates for isolated user:', isolatedCandidates);