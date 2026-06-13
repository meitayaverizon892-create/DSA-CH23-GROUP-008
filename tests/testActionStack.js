const ActionStack = require('../src/datastructures/ActionStack');
const FriendGraph = require('../src/datastructures/FriendGraph');

// Setup: create a graph with some friendships
const graph = new FriendGraph();
graph.addUser(1); // Alice
graph.addUser(2); // Bob
graph.addUser(3); // Carol
graph.addFriendship(1, 2); // Alice - Bob

const stack = new ActionStack(10);

// Test 1: Push an action
console.log('--- Test 1: Push ADD_FRIENDSHIP action ---');
stack.push({ type: 'ADD_FRIENDSHIP', userIdA: 1, userIdB: 2, timestamp: Date.now() });
console.log('Stack size:', stack.size());

// Test 2: Peek
console.log('--- Test 2: Peek at last action ---');
console.log(stack.peek());

// Test 3: Undo the friendship
console.log('--- Test 3: Undo ADD_FRIENDSHIP ---');
console.log('Before undo - Alice & Bob friends?', graph.areFriends(1, 2));
const result1 = stack.undo(graph);
console.log('Undo result:', result1);
console.log('After undo - Alice & Bob friends?', graph.areFriends(1, 2));

// Test 4: Undo on empty stack
console.log('--- Test 4: Undo on empty stack ---');
const result2 = stack.undo(graph);
console.log('Undo result:', result2);

// Test 5: Bounded size (push 12 actions, max is 10)
console.log('--- Test 5: Bounded stack size ---');
for (let i = 1; i <= 12; i++) {
  stack.push({ type: 'SEND_FRIEND_REQUEST', senderId: 1, receiverId: i + 10, timestamp: Date.now() });
}
console.log('Stack size after pushing 12 (max 10):', stack.size());
console.log('Oldest remaining action (should be #3, since #1 and #2 were removed):');
console.log(stack.stack[0]);

// Test 6: Undo a SEND_FRIEND_REQUEST
console.log('--- Test 6: Undo SEND_FRIEND_REQUEST ---');
const result3 = stack.undo(graph);
console.log('Undo result:', result3);