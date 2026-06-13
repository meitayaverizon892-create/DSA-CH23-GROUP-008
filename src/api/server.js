const express = require('express');
const {
  userRegistry,
  friendGraph,
  actionStack,
  requestQueue,
  minHeap,
  mutualFriends,
  getNextUserId,
} = require('./dataStore');

const User = require('../models/User');
const { mergeSort, binarySearch } = require('../algorithms/Sorting');

const app = express();
app.use(express.json()); // allows reading JSON request bodies

const PORT = process.env.PORT || 3000;

// ============================================================
// UC1: Register a new user
// POST /users
// Body: { username, email, password }
// ============================================================
app.post('/users', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }

  if (userRegistry.usernameExists(username)) {
    return res.status(409).json({ error: `Username '${username}' is already taken` });
  }

  const id = getNextUserId();
  // NOTE: For a real app, hash the password with bcrypt. 
  // For this demo, we store it as-is to keep focus on DSA.
  const user = new User(id, username, email, password);

  userRegistry.addUser(user);
  friendGraph.addUser(id);

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user.id, username: user.username, email: user.email },
  });
});

// ============================================================
// UC9: Get all users (used internally, and for testing)
// GET /users
// ============================================================
app.get('/users', (req, res) => {
  const users = userRegistry.getAllUsers().map(u => ({
    id: u.id, username: u.username, email: u.email
  }));
  res.json({ count: users.length, users });
});

// ============================================================
// UC10: Get all users SORTED alphabetically (Merge Sort)
// GET /users/sorted
// ============================================================
app.get('/users/sorted', (req, res) => {
  const users = userRegistry.getAllUsers();
  const sorted = mergeSort(users).map(u => ({
    id: u.id, username: u.username, email: u.email
  }));
  res.json({ count: sorted.length, users: sorted });
});

// ============================================================
// UC9: Search for a user by username (Binary Search)
// GET /users/search?username=alice
// ============================================================
app.get('/users/search', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'username query parameter is required' });
  }

  const allUsers = userRegistry.getAllUsers();
  const sorted = mergeSort(allUsers); // must be sorted before binary search
  const found = binarySearch(sorted, username);

  if (!found) {
    return res.status(404).json({ error: `User '${username}' not found` });
  }

  res.json({ id: found.id, username: found.username, email: found.email });
});

// ============================================================
// UC3: Send a friend request (enqueue)
// POST /friend-requests
// Body: { senderId, receiverId }
// ============================================================
app.post('/friend-requests', (req, res) => {
  const { senderId, receiverId } = req.body;

  // Validation
  if (senderId === undefined || receiverId === undefined) {
    return res.status(400).json({ error: 'senderId and receiverId are required' });
  }
  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send a friend request to yourself' });
  }
  if (!userRegistry.getUserById(senderId) || !userRegistry.getUserById(receiverId)) {
    return res.status(404).json({ error: 'One or both users do not exist' });
  }
  if (friendGraph.areFriends(senderId, receiverId)) {
    return res.status(409).json({ error: 'Users are already friends' });
  }
  if (requestQueue.requestExists(senderId, receiverId)) {
    return res.status(409).json({ error: 'Friend request already pending' });
  }

  const request = { senderId, receiverId, timestamp: Date.now() };
  requestQueue.enqueue(request);

  // Log this action so it can be undone (cancel the request)
  actionStack.push({ type: 'SEND_FRIEND_REQUEST', senderId, receiverId, timestamp: Date.now() });

  res.status(201).json({ message: 'Friend request sent', request });
});

// ============================================================
// UC4: View pending friend requests received by a user
// GET /friend-requests/:userId
// ============================================================
app.get('/friend-requests/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const received = requestQueue.getRequestsByReceiver(userId);
  const sent = requestQueue.getRequestsBySender(userId);
  res.json({ received, sent });
});

// ============================================================
// UC5: Process the next pending friend request (dequeue)
// POST /friend-requests/process
// ============================================================
app.post('/friend-requests/process', (req, res) => {
  const result = requestQueue.processNext(friendGraph, actionStack);

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// ============================================================
// UC6: View a user's friends list
// GET /friends/:userId
// ============================================================
app.get('/friends/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!userRegistry.getUserById(userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const friendIds = [...friendGraph.getFriends(userId)];
  const friends = friendIds.map(id => {
    const u = userRegistry.getUserById(id);
    return { id: u.id, username: u.username };
  });

  res.json({ userId, friendCount: friends.length, friends });
});

// ============================================================
// UC7: Get mutual friends between two users
// GET /mutual-friends/:userIdA/:userIdB
// ============================================================
app.get('/mutual-friends/:userIdA/:userIdB', (req, res) => {
  const userIdA = parseInt(req.params.userIdA);
  const userIdB = parseInt(req.params.userIdB);

  if (!userRegistry.getUserById(userIdA) || !userRegistry.getUserById(userIdB)) {
    return res.status(404).json({ error: 'One or both users do not exist' });
  }

  const mutualIds = mutualFriends.getMutual(friendGraph, userIdA, userIdB);
  const mutual = mutualIds.map(id => {
    const u = userRegistry.getUserById(id);
    return { id: u.id, username: u.username };
  });

  res.json({ userIdA, userIdB, mutualCount: mutual.length, mutualFriends: mutual });
});

// ============================================================
// UC8: Get friend recommendations (BFS + Hash Map + Min-Heap)
// GET /recommendations/:userId?k=5
// ============================================================
app.get('/recommendations/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const k = parseInt(req.query.k) || 5; // default top 5

  if (!userRegistry.getUserById(userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Step 1: BFS to find friend-of-friend candidates with mutual counts
  const candidates = mutualFriends.getFriendsOfFriends(friendGraph, userId);

  // Step 2: Use Min-Heap to extract top K
  const topK = minHeap.getTopK(candidates, k);

  // Step 3: Attach usernames for display
  const recommendations = topK.map(item => {
    const u = userRegistry.getUserById(item.userId);
    return { id: u.id, username: u.username, mutualFriendCount: item.mutualCount };
  });

  res.json({ userId, recommendations });
});

// ============================================================
// UC12: Get shortest connection path (degrees of separation)
// GET /path/:userIdA/:userIdB
// ============================================================
app.get('/path/:userIdA/:userIdB', (req, res) => {
  const userIdA = parseInt(req.params.userIdA);
  const userIdB = parseInt(req.params.userIdB);

  if (!userRegistry.getUserById(userIdA) || !userRegistry.getUserById(userIdB)) {
    return res.status(404).json({ error: 'One or both users do not exist' });
  }

  const distance = mutualFriends.getShortestPath(friendGraph, userIdA, userIdB);

  res.json({
    userIdA,
    userIdB,
    degreesOfSeparation: distance,
    connected: distance !== -1,
  });
});

// ============================================================
// UC11: Undo the last action
// POST /undo
// ============================================================
app.post('/undo', (req, res) => {
  const result = actionStack.undo(friendGraph);

  // If it was a cancelled friend request, also remove it from the queue
  if (result.success && result.action && result.action.type === 'SEND_FRIEND_REQUEST') {
    requestQueue.removeRequest(result.action.senderId, result.action.receiverId);
  }

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// ============================================================
// Health check / root route
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message: 'Social Network API is running',
    stats: {
      totalUsers: friendGraph.getTotalUsers(),
      totalFriendships: friendGraph.getTotalEdges(),
      pendingRequests: requestQueue.size(),
    },
  });
});

// ============================================================
// Start the server
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ Social Network API running on http://localhost:${PORT}`);
});