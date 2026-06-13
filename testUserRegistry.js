const UserRegistry = require('./src/datastructures/UserRegistry');
const User = require('./src/models/User');

const registry = new UserRegistry();

// Add some test users
registry.addUser(new User(1, 'alice', 'alice@example.com', 'hashedpass1'));
registry.addUser(new User(2, 'bob', 'bob@example.com', 'hashedpass2'));
registry.addUser(new User(3, 'carol', 'carol@example.com', 'hashedpass3'));

// Test getUserById
console.log('--- Test 1: Get user by ID ---');
console.log(registry.getUserById(1));

// Test getUserByUsername
console.log('--- Test 2: Get user by username ---');
console.log(registry.getUserByUsername('bob'));

// Test usernameExists
console.log('--- Test 3: Username exists check ---');
console.log('alice exists?', registry.usernameExists('alice'));
console.log('dave exists?', registry.usernameExists('dave'));

// Test getAllUsers
console.log('--- Test 4: Get all users ---');
console.log(registry.getAllUsers());

// Test size
console.log('--- Test 5: Total users ---');
console.log(registry.size());

// Test duplicate username error
console.log('--- Test 6: Duplicate username (should throw error) ---');
try {
  registry.addUser(new User(4, 'alice', 'alice2@example.com', 'hashedpass4'));
} catch (error) {
  console.log('Caught error:', error.message);
}