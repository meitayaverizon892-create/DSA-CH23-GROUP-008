class UserRegistry {
  constructor() {
    // Primary HashMap: userId -> User object
    // O(1) average time complexity for get/set
    this.usersById = new Map();

    // Secondary HashMap: username -> userId
    // Allows O(1) lookup by username too
    this.usernameToId = new Map();
  }

  // Add a new user to the registry — O(1)
  addUser(user) {
    if (this.usersById.has(user.id)) {
      throw new Error(`User with id ${user.id} already exists`);
    }
    if (this.usernameToId.has(user.username)) {
      throw new Error(`Username '${user.username}' is already taken`);
    }

    this.usersById.set(user.id, user);
    this.usernameToId.set(user.username, user.id);
  }

  // Get a user by their ID — O(1)
  getUserById(id) {
    return this.usersById.get(id) || null;
  }

  // Get a user by their username — O(1)
  getUserByUsername(username) {
    const id = this.usernameToId.get(username);
    if (id === undefined) return null;
    return this.usersById.get(id);
  }

  // Check if a username already exists — O(1)
  usernameExists(username) {
    return this.usernameToId.has(username);
  }

  // Remove a user — O(1)
  removeUser(id) {
    const user = this.usersById.get(id);
    if (!user) return false;

    this.usersById.delete(id);
    this.usernameToId.delete(user.username);
    return true;
  }

  // Get all users as an array — O(n)
  // Used later for sorting and searching (Steps 16)
  getAllUsers() {
    return Array.from(this.usersById.values());
  }

  // Total number of users — O(1)
  size() {
    return this.usersById.size;
  }
}

module.exports = UserRegistry;