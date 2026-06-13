class ActionStack {
  constructor(maxSize = 10) {
    // Array used as a stack
    // Bounded size — fixes Bottleneck #5 from Step 7/8
    this.stack = [];
    this.maxSize = maxSize;
  }

  // Push a new action onto the stack — O(1)
  // If stack exceeds maxSize, remove the OLDEST entry (bottom of stack)
  push(action) {
    this.stack.push(action);

    if (this.stack.length > this.maxSize) {
      // Remove the oldest action (index 0) to keep memory bounded
      this.stack.shift(); // O(n) but n is capped at maxSize, so effectively O(1)
    }
  }

  // Pop the most recent action — O(1)
  pop() {
    return this.stack.pop();
  }

  // View the most recent action without removing it — O(1)
  peek() {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }

  // Check if the stack is empty — O(1)
  isEmpty() {
    return this.stack.length === 0;
  }

  // Get current number of stored actions — O(1)
  size() {
    return this.stack.length;
  }

  // Perform the actual undo logic — depends on action type
  // Returns a message describing what was undone
  undo(graph) {
    if (this.isEmpty()) {
      return { success: false, message: 'Nothing to undo' };
    }

    const lastAction = this.pop();

    switch (lastAction.type) {
      case 'ADD_FRIENDSHIP':
        // Reverse: remove the friendship that was added
        graph.removeFriendship(lastAction.userIdA, lastAction.userIdB);
        return {
          success: true,
          message: `Undid friendship between user ${lastAction.userIdA} and user ${lastAction.userIdB}`
        };

      case 'SEND_FRIEND_REQUEST':
        // Reverse: mark the request as cancelled
        // (the actual queue removal is handled in Step 13)
        return {
          success: true,
          message: `Cancelled friend request from user ${lastAction.senderId} to user ${lastAction.receiverId}`,
          action: lastAction // returned so the API layer can also remove it from the queue
        };

      default:
        return { success: false, message: `Unknown action type: ${lastAction.type}` };
    }
  }
}

module.exports = ActionStack;