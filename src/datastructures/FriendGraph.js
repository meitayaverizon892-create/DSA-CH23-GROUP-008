class FriendGraph {
  constructor() {
    // Adjacency List: HashMap<userId, Set<friendId>>
    // Each user maps to a Set of their friends' IDs
    this.adjacencyList = new Map();
  }

  // Add a new user (node) to the graph — O(1)
  addUser(userId) {
    if (!this.adjacencyList.has(userId)) {
      this.adjacencyList.set(userId, new Set());
    }
  }

  // Add a friendship (edge) between two users — O(1)
  // Friendship is mutual (undirected graph) — UC: friendships are mutual
  addFriendship(userIdA, userIdB) {
    if (userIdA === userIdB) {
      throw new Error('A user cannot be friends with themselves');
    }

    // Make sure both users exist in the graph
    this.addUser(userIdA);
    this.addUser(userIdB);

    // Check if already friends (prevent duplicates)
    if (this.areFriends(userIdA, userIdB)) {
      throw new Error('Users are already friends');
    }

    // Add edge in both directions (undirected graph)
    this.adjacencyList.get(userIdA).add(userIdB);
    this.adjacencyList.get(userIdB).add(userIdA);
  }

  // Remove a friendship between two users — O(1)
  removeFriendship(userIdA, userIdB) {
    if (this.adjacencyList.has(userIdA)) {
      this.adjacencyList.get(userIdA).delete(userIdB);
    }
    if (this.adjacencyList.has(userIdB)) {
      this.adjacencyList.get(userIdB).delete(userIdA);
    }
  }

  // Get all friends of a user — O(1) to access, returns a Set
  getFriends(userId) {
    return this.adjacencyList.get(userId) || new Set();
  }

  // Check if two users are friends — O(1)
  areFriends(userIdA, userIdB) {
    const friendsOfA = this.adjacencyList.get(userIdA);
    if (!friendsOfA) return false;
    return friendsOfA.has(userIdB);
  }

  // Get the number of friends a user has — O(1)
  getFriendCount(userId) {
    return this.getFriends(userId).size;
  }

  // Get total number of users (nodes) in the graph — O(1)
  getTotalUsers() {
    return this.adjacencyList.size;
  }

  // Get total number of friendships (edges) in the graph — O(V)
  // Each edge is counted twice (once from each side), so divide by 2
  getTotalEdges() {
    let total = 0;
    for (const friends of this.adjacencyList.values()) {
      total += friends.size;
    }
    return total / 2;
  }
}

module.exports = FriendGraph;