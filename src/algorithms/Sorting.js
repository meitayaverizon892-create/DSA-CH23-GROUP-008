/**
 * MERGE SORT — sorts an array of User objects alphabetically by username
 * Uses the classic "Divide and Conquer" approach.
 *
 * Complexity: O(n log n) — guaranteed, regardless of input order
 */
function mergeSort(users) {
  // Base case: an array of 0 or 1 elements is already sorted
  if (users.length <= 1) {
    return users;
  }

  // Divide: split the array into two halves
  const middle = Math.floor(users.length / 2);
  const leftHalf = users.slice(0, middle);
  const rightHalf = users.slice(middle);

  // Conquer: recursively sort each half
  const sortedLeft = mergeSort(leftHalf);
  const sortedRight = mergeSort(rightHalf);

  // Combine: merge the two sorted halves into one sorted array
  return merge(sortedLeft, sortedRight);
}

/**
 * Merges two already-sorted arrays into a single sorted array.
 * Compares usernames alphabetically.
 */
function merge(left, right) {
  const result = [];
  let i = 0; // pointer for left array
  let j = 0; // pointer for right array

  // Compare elements from both arrays, take the smaller each time
  while (i < left.length && j < right.length) {
    if (left[i].username.toLowerCase() <= right[j].username.toLowerCase()) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // Append any remaining elements (one array will have leftovers)
  while (i < left.length) {
    result.push(left[i]);
    i++;
  }
  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

/**
 * BINARY SEARCH — finds a user by username in an ALREADY SORTED array.
 * Repeatedly halves the search space until the target is found or
 * the search space is empty.
 *
 * IMPORTANT: the input array MUST be sorted (use mergeSort first)
 *
 * Complexity: O(log n)
 */
function binarySearch(sortedUsers, targetUsername) {
  let low = 0;
  let high = sortedUsers.length - 1;
  const target = targetUsername.toLowerCase();

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midUsername = sortedUsers[mid].username.toLowerCase();

    if (midUsername === target) {
      return sortedUsers[mid]; // Found it!
    } else if (midUsername < target) {
      low = mid + 1; // Target is in the right half
    } else {
      high = mid - 1; // Target is in the left half
    }
  }

  return null; // Not found
}

module.exports = { mergeSort, binarySearch };