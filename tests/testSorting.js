const { mergeSort, binarySearch } = require('../src/algorithms/Sorting');

// Create some test users (simplified objects with just id and username)
const users = [
  { id: 3, username: 'Carol' },
  { id: 1, username: 'Alice' },
  { id: 5, username: 'eve' },
  { id: 2, username: 'Bob' },
  { id: 4, username: 'Dan' },
  { id: 6, username: 'frank' },
];

// Test 1: Merge Sort
console.log('--- Test 1: Merge Sort ---');
console.log('Before sorting:', users.map(u => u.username));
const sortedUsers = mergeSort(users);
console.log('After sorting:', sortedUsers.map(u => u.username));

// Test 2: Binary Search - existing user
console.log('--- Test 2: Binary Search (find "Dan") ---');
const found1 = binarySearch(sortedUsers, 'Dan');
console.log('Found:', found1);

// Test 3: Binary Search - case insensitive
console.log('--- Test 3: Binary Search (find "EVE", different case) ---');
const found2 = binarySearch(sortedUsers, 'EVE');
console.log('Found:', found2);

// Test 4: Binary Search - non-existent user
console.log('--- Test 4: Binary Search (find "Zara", does not exist) ---');
const found3 = binarySearch(sortedUsers, 'Zara');
console.log('Found:', found3);

// Test 5: Binary Search - first element
console.log('--- Test 5: Binary Search (find first element "Alice") ---');
const found4 = binarySearch(sortedUsers, 'Alice');
console.log('Found:', found4);

// Test 6: Binary Search - last element
console.log('--- Test 6: Binary Search (find last element "frank") ---');
const found5 = binarySearch(sortedUsers, 'frank');
console.log('Found:', found5);

// Test 7: Merge Sort with empty array
console.log('--- Test 7: Merge Sort with empty array ---');
console.log('Result:', mergeSort([]));

// Test 8: Merge Sort with single element
console.log('--- Test 8: Merge Sort with single element ---');
console.log('Result:', mergeSort([{ id: 1, username: 'Solo' }]));

// Test 9: Binary Search on empty array
console.log('--- Test 9: Binary Search on empty array ---');
console.log('Result:', binarySearch([], 'Anyone'));