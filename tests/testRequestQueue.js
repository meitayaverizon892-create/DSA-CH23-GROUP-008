const RequestQueue = require('../src/datastructures/RequestQueue');
const FriendGraph = require('../src/datastructures/FriendGraph');
const ActionStack = require('../src/datastructures/ActionStack');

// Setup
const graph = new FriendGraph();
graph.addUser(1); // Alice
graph.addUser(2); // Bob
graph.addUser(3); // Carol

const queue = new RequestQueue();
const actionStack = new ActionStack();

// Test 1: Enqueue requests
console.log('--- Test 1: Enqueue friend requests ---');
queue.enqueue({ senderId: 1, receiverId: 2, timestamp: Date.now() }); // Alice -> Bob
queue.enqueue({ senderId: 1, receiverId: 3, timestamp: Date.now() }); // Alice -> Carol
console.log('Queue size:', queue.size());

// Test 2: Peek
console.log('--- Test 2: Peek at next request ---');
console.log(queue.peek());

// Test 3: Check for duplicate request
console.log('--- Test 3: Duplicate request check ---');
console.log('Alice -> Bob exists?', queue.requestExists(1, 2));
console.log('Bob -> Carol exists?', queue.requestExists(2, 3));

// Test 4: Process first request (FIFO order)
console.log('--- Test 4: Process next request ---');
const result1 = queue.processNext(graph, actionStack);
console.log('Result:', result1);
console.log('Queue size after processing:', queue.size());
console.log('Alice & Bob friends now?', graph.areFriends(1, 2));

// Test 5: Process second request
console.log('--- Test 5: Process next request again ---');
const result2 = queue.processNext(graph, actionStack);
console.log('Result:', result2);
console.log('Queue size after processing:', queue.size());

// Test 6: Process from empty queue
console.log('--- Test 6: Process from empty queue ---');
const result3 = queue.processNext(graph, actionStack);
console.log('Result:', result3);

// Test 7: Get requests by receiver (before processing)
console.log('--- Test 7: Filter requests by receiver ---');
queue.enqueue({ senderId: 2, receiverId: 3, timestamp: Date.now() }); // Bob -> Carol
queue.enqueue({ senderId: 1, receiverId: 3, timestamp: Date.now() }); // Alice -> Carol (again)
console.log('Requests received by Carol (3):', queue.getRequestsByReceiver(3));

// Test 8: Remove a specific request (simulate undo of SEND_FRIEND_REQUEST)
console.log('--- Test 8: Remove specific request ---');
console.log('Queue size before removal:', queue.size());
const removed = queue.removeRequest(1, 3);
console.log('Removed successfully?', removed);
console.log('Queue size after removal:', queue.size());

// Test 9: Undo the friendship created in Test 4 (using ActionStack)
console.log('--- Test 9: Undo last friendship via ActionStack ---');
console.log('Alice & Bob friends before undo?', graph.areFriends(1, 2));
const undoResult = actionStack.undo(graph);
console.log('Undo result:', undoResult);
console.log('Alice & Bob friends after undo?', graph.areFriends(1, 2));