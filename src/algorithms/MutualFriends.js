class MutualFriends {

  /**
   * Find mutual friends between two users.
   * Uses Hash Set intersection — iterates over the SMALLER set
   * and checks membership in the LARGER set (O(1) per check).
   *
   * Fixes Bottleneck #1 (Step 7/8): O(min(dA, dB)) instead of O(dA * dB)
   */
  getMutual(graph, userIdA, userIdB) {
    const friendsA = graph.getFriends(userIdA); // Set
    const friendsB = graph.getFriends(userIdB); // Set

    // Pick the smaller set to iterate over — minimizes operations
    const [smaller, larger] = friendsA.size <= friendsB.size
      ? [friendsA, friendsB]
      : [friendsB, friendsA];

    const mutual = [];
    for (const friendId of smaller) {
      if (larger.has(friendId)) { // O(1) hash lookup
        mutual.push(friendId);
      }
    }

    return mutual;
  }

  /**
   * BFS traversal to find "friends of friends" — i.e., people who are
   * NOT yet friends with userId, but are connected through a mutual friend.
   *
   * Returns a Map: candidateId -> mutualFriendCount
   * This Map feeds directly into the Min-Heap (Step 15) for Top-K selection.
   *
   * Complexity: O(V + E) for the BFS traversal portion
   */
  getFriendsOfFriends(graph, userId) {
    const directFriends = graph.getFriends(userId); // Set of direct friends

    // visited = direct friends + the user themselves
    // (we never recommend someone who is already a friend, or the user themselves)
    const visited = new Set([userId, ...directFriends]);

    // candidates: Map<candidateId, mutualFriendCount>
    const candidates = new Map();

    // BFS queue — starts with all direct friends (these are "Level 1")
    const queue = [...directFriends];

    while (queue.length > 0) {
      const current = queue.shift(); // dequeue (front of queue)

      const theirFriends = graph.getFriends(current); // friends of this friend

      for (const candidateId of theirFriends) {
        if (!visited.has(candidateId)) {
          visited.add(candidateId); // mark as seen so we don't process twice

          // Calculate how many mutual friends this candidate shares with userId
          const mutualCount = this.getMutual(graph, userId, candidateId).length;
          candidates.set(candidateId, mutualCount);

          // Note: we do NOT enqueue candidateId further (we only go 2 hops deep)
          // This keeps BFS bounded to "friends of friends" only
        }
      }
    }

    return candidates;
  }

  /**
   * BFS to find the shortest path (degrees of separation) between two users.
   * Returns the path length (number of hops) or -1 if not connected.
   *
   * UC12: View Connection Path
   * Complexity: O(V + E)
   */
  getShortestPath(graph, startId, targetId) {
    if (startId === targetId) return 0;

    const visited = new Set([startId]);
    const queue = [[startId, 0]]; // [userId, distance]

    while (queue.length > 0) {
      const [current, distance] = queue.shift();

      const friends = graph.getFriends(current);
      for (const friendId of friends) {
        if (friendId === targetId) {
          return distance + 1; // Found it!
        }
        if (!visited.has(friendId)) {
          visited.add(friendId);
          queue.push([friendId, distance + 1]);
        }
      }
    }

    return -1; // Not connected at all
  }
}

module.exports = MutualFriends;