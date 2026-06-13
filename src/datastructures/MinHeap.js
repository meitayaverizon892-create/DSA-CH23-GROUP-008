class MinHeap {
  constructor() {
    // Internal array representation of the heap
    // Each element: { userId, mutualCount }
    this.heap = [];
  }

  // --- Helper index calculations ---
  getParentIndex(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIndex(i) { return 2 * i + 1; }
  getRightChildIndex(i) { return 2 * i + 2; }

  // Swap two elements in the heap array
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert a new item into the heap — O(log n)
  insert(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  // Move a newly inserted item UP until heap property is restored
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);

      // Min-heap property: parent must be <= child
      if (this.heap[parentIndex].mutualCount <= this.heap[index].mutualCount) {
        break; // heap property satisfied, stop
      }

      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  // Remove and return the minimum element (the root) — O(log n)
  extractMin() {
    if (this.heap.length === 0) return null;

    const min = this.heap[0];
    const last = this.heap.pop(); // remove last element

    if (this.heap.length > 0) {
      this.heap[0] = last; // move last element to root
      this.siftDown(0);    // restore heap property from the top
    }

    return min;
  }

  // Move the root element DOWN until heap property is restored
  siftDown(index) {
    const n = this.heap.length;

    while (true) {
      let smallest = index;
      const left = this.getLeftChildIndex(index);
      const right = this.getRightChildIndex(index);

      if (left < n && this.heap[left].mutualCount < this.heap[smallest].mutualCount) {
        smallest = left;
      }
      if (right < n && this.heap[right].mutualCount < this.heap[smallest].mutualCount) {
        smallest = right;
      }

      if (smallest === index) break; // heap property satisfied, stop

      this.swap(smallest, index);
      index = smallest;
    }
  }

  // View the minimum element without removing it — O(1)
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Check if heap is empty — O(1)
  isEmpty() {
    return this.heap.length === 0;
  }

  // Current size of the heap — O(1)
  size() {
    return this.heap.length;
  }

  /**
   * Get the Top-K candidates by mutualCount from a Map of candidates.
   * Maintains a heap of size K throughout — fixes Bottleneck #2 (Step 7/8)
   *
   * Complexity: O(n log K) instead of O(n log n)
   */
  getTopK(candidatesMap, k) {
    // Reset the heap for this calculation
    this.heap = [];

    for (const [userId, mutualCount] of candidatesMap) {
      const item = { userId, mutualCount };

      if (this.heap.length < k) {
        // Heap not full yet — just insert
        this.insert(item);
      } else if (mutualCount > this.heap[0].mutualCount) {
        // Heap is full, but this candidate beats the weakest one
        this.extractMin();   // remove the weakest
        this.insert(item);   // insert the stronger candidate
      }
      // else: candidate is not good enough, ignore it
    }

    // Sort final results descending by mutualCount for display
    // (only sorting K items — at most 5 — so this is cheap)
    return [...this.heap].sort((a, b) => b.mutualCount - a.mutualCount);
  }
}

module.exports = MinHeap;