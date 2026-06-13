// This file creates ONE SHARED instance of each data structure.
// Every API route imports from here, so they all operate on
// the SAME in-memory data — like a shared "database" while the
// server is running.

const UserRegistry = require('../datastructures/UserRegistry');
const FriendGraph = require('../datastructures/FriendGraph');
const ActionStack = require('../datastructures/ActionStack');
const RequestQueue = require('../datastructures/RequestQueue');
const MinHeap = require('../datastructures/MinHeap');
const MutualFriends = require('../algorithms/MutualFriends');

// Create single shared instances
const userRegistry = new UserRegistry();
const friendGraph = new FriendGraph();
const actionStack = new ActionStack(10); // max 10 actions (Step 8 fix)
const requestQueue = new RequestQueue();
const minHeap = new MinHeap();
const mutualFriends = new MutualFriends();

let nextUserId = 1; // simple auto-increment counter for new user IDs

module.exports = {
  userRegistry,
  friendGraph,
  actionStack,
  requestQueue,
  minHeap,
  mutualFriends,
  getNextUserId: () => nextUserId++,
};