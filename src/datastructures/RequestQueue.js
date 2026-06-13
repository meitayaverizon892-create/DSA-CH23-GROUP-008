class RequestQueue {
  constructor() {
    // Array used as a queue (FIFO)
    this.queue = [];
  }

  // Add a new friend request to the back of the queue — O(1)
  enqueue(request) {
    // request shape: { senderId, receiverId, timestamp }
    this.queue.push(request);
  }

  // Remove and return the request at the front of the queue — O(1)
  dequeue() {
    return this.queue.shift();
  }

  // View the front request without removing it — O(1)
  peek() {
    if (this.queue.length === 0) return null;
    return this.queue[0];
  }

  // Check if queue is empty — O(1)
  isEmpty() {
    return this.queue.length === 0;
  }

  // Get current number of pending requests — O(1)
  size() {
    return this.queue.length;
  }

  // Get all pending requests sent BY a specific user — O(n)
  getRequestsBySender(senderId) {
    return this.queue.filter(req => req.senderId === senderId);
  }

  // Get all pending requests sent TO a specific user — O(n)
  getRequestsByReceiver(receiverId) {
    return this.queue.filter(req => req.receiverId === receiverId);
  }

  // Check if a specific request already exists (prevent duplicates) — O(n)
  requestExists(senderId, receiverId) {
    return this.queue.some(
      req => req.senderId === senderId && req.receiverId === receiverId
    );
  }

  // Remove a specific request (used when undoing a SEND_FRIEND_REQUEST) — O(n)
  removeRequest(senderId, receiverId) {
    const index = this.queue.findIndex(
      req => req.senderId === senderId && req.receiverId === receiverId
    );
    if (index === -1) return false;

    this.queue.splice(index, 1);
    return true;
  }

  // Process the next request in line — O(1) for dequeue
  // Creates the friendship in the graph and logs the action for undo
  processNext(graph, actionStack) {
    if (this.isEmpty()) {
      return { success: false, message: 'No pending requests' };
    }

    const request = this.dequeue();

    try {
      graph.addFriendship(request.senderId, request.receiverId);

      // Log this action so it can be undone later (Step 12)
      actionStack.push({
        type: 'ADD_FRIENDSHIP',
        userIdA: request.senderId,
        userIdB: request.receiverId,
        timestamp: Date.now()
      });

      return {
        success: true,
        message: `Friendship created between user ${request.senderId} and user ${request.receiverId}`
      };
    } catch (error) {
      // e.g., if they were already friends somehow
      return { success: false, message: error.message };
    }
  }
}

module.exports = RequestQueue;