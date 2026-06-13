# DSA-CH23-GROUP-008 — System Design Report
## Theme A1: Friends Graph + Mutual Friend Recommendations

---

## STEP 1: USE CASES GENERATION

### Actors (who uses the system)
- **Registered User** — a person with an account on the platform
- **System** — automated background processes (e.g., generating recommendations)

### Use Cases

| ID | Use Case | Description |
|----|----------|-------------|
| UC1 | Register Account | A new user creates an account with username, email, and password |
| UC2 | Login | A registered user logs into the system |
| UC3 | Send Friend Request | A user sends a friend request to another user |
| UC4 | View Pending Requests | A user views friend requests sent to them |
| UC5 | Accept/Process Friend Request | The system processes a friend request and creates a friendship |
| UC6 | View Friends List | A user views all their current friends |
| UC7 | Get Mutual Friends | A user views mutual friends shared with another user |
| UC8 | Get Friend Recommendations | The system suggests new friends based on mutual connections |
| UC9 | Search for User | A user searches for another user by username |
| UC10 | View All Users (Sorted) | A user views a complete alphabetical list of all users |
| UC11 | Undo Last Action | A user reverses their most recent friend request |
| UC12 | View Connection Path | A user views the shortest path (degrees of separation) to another user |

### Detailed Use Case Descriptions

#### UC3: Send Friend Request
**Actor:** Registered User  
**Trigger:** User clicks "Add Friend" on another user's profile  
**Flow:**
1. User selects target user
2. System validates the request (not already friends, not self, no duplicate)
3. Request is added to the **Friend Request Queue**
4. User receives confirmation: "Request sent"

**Data Structure Used:** Queue (FIFO — requests processed in order received)

---

#### UC7: Get Mutual Friends
**Actor:** Registered User  
**Trigger:** User views another user's profile  
**Flow:**
1. System retrieves User A's friend list
2. System retrieves User B's friend list
3. System finds the intersection of both lists
4. Mutual friends are displayed

**Data Structure Used:** Graph (adjacency list) + Hash Set intersection

---

#### UC8: Get Friend Recommendations
**Actor:** Registered User  
**Trigger:** User opens "People You May Know" section  
**Flow:**
1. System performs BFS from the user to find friends-of-friends
2. System counts mutual friends for each candidate using a Hash Map
3. System extracts the top 5 candidates using a Min-Heap
4. Recommendations are displayed, sorted by mutual friend count

**Data Structures Used:** Graph + BFS (Queue) + Hash Map + Min-Heap

---

#### UC9: Search for User
**Actor:** Registered User  
**Trigger:** User types a username into the search bar  
**Flow:**
1. System sorts all users alphabetically (Merge Sort)
2. System performs Binary Search on the sorted list
3. Matching user profile is returned

**Data Structures Used:** Merge Sort (O(n log n)) + Binary Search (O(log n))

---

#### UC11: Undo Last Action
**Actor:** Registered User  
**Trigger:** User clicks "Undo" button  
**Flow:**
1. System checks the Action Stack for the most recent action
2. If the last action was "Send Friend Request", it is reversed
3. Friendship/request is removed
4. User receives confirmation: "Action undone"

**Data Structure Used:** Stack (LIFO — most recent action reversed first)

---

## STEP 2: CONSTRAINTS AND ANALYSIS

### 2.1 Functional Constraints
These are rules the system must always enforce:

- A user cannot send a friend request to themselves
- A user cannot send a duplicate friend request to the same person twice
- Friendships are mutual (undirected) — if A is friends with B, B is friends with A
- Recommendations must exclude users who are already friends
- The undo action only reverses the user's own most recent action
- Friend requests are processed in the exact order they were received (FIFO)

### 2.2 Non-Functional Constraints

| Constraint | Value | Reason |
|-----------|-------|--------|
| Max users (demo scale) | 10,000 | Realistic for testing on a laptop |
| Max friends per user | 500 | Reasonable upper bound for social networks |
| Recommendation response time | < 2 seconds | Must feel instant to the user |
| Search response time | < 100ms | Search should feel instant |
| Storage | PostgreSQL | Persistent storage; in-memory structures for speed |
| Environment | Single laptop, no cloud | Demo runs locally |
| Read vs Write ratio | 80% reads / 20% writes | Most actions are viewing, not editing |

### 2.3 Data Volume Analysis

| Metric | Estimated Value | Calculation |
|--------|-----------------|-------------|
| Total users (n) | 10,000 | Demo scale assumption |
| Average friends per user | 150 | Realistic average |
| Total friendship edges | ~750,000 | (10,000 × 150) / 2 |
| Friend requests per day | ~500 | Estimated activity |
| Recommendation requests per day | ~5,000 | Triggered on profile views |

### 2.4 Assumptions Made
- All data fits in memory for the demo (no need for distributed storage)
- A single server instance is sufficient (no load balancing required)
- Network latency is not a factor (local demo)
- Users are uniquely identified by an auto-incremented integer ID

### 2.5 Why These Constraints Matter
These numbers directly influence our data structure choices in Step 3 (Basic Design). 
For example:
- 10,000 users with 150 friends each means a naive mutual-friends check 
  (O(d²)) would require up to 22,500 comparisons per pair — this motivates 
  using Hash Set intersection (O(d)) instead.
- An adjacency matrix for 10,000 users would require 100,000,000 cells 
  (10,000²), which is wasteful — this motivates using an adjacency list instead.

---

## STEP 3: BASIC DESIGN

### 3.1 System Architecture Diagram  

┌─────────────────────────────────────────────┐

│         CLIENT (CLI / API caller)            │

└────────────────────┬──────────────────────--┘

│ HTTP Requests

▼

┌───────────────────────────────────────────--┐

│           API LAYER (Express.js)             │

│ Routes: /users, /friend-request,             │

│         /recommendations, etc.               │

└────────────────────┬─────────────────────--─┘

│

┌──────────────┼──────────────┐

▼               ▼               ▼

┌─────────────┐ ┌────────────────┐ ┌────────────────┐

│ User Registry│ │  Friend Graph   │ │ Request Queue   │

│ (HashMap)    │ │ (Adjacency List)│ │ (Queue/FIFO)    │

└──────┬───────┘ └───────┬─────────┘ └───────┬─────────┘

│                 │                   │

│        ┌────────┴────────┐          │

│        ▼                 ▼          │

│ ┌──────────────┐  ┌──────────────┐  │

│ │Mutual Friends │  │ Action Stack │◄─┘

│ │(BFS + HashMap)│  │ (Undo - LIFO)│

│ └──────┬────────┘  └──────────────┘

│        ▼

│ ┌──────────────┐

│ │  Min-Heap     │

│ │ (Top-K Recs)  │

│ └──────────────┘

▼

┌───────────────────────────────────────────--┐

│   PERSISTENCE LAYER (PostgreSQL Database)    │

│ Tables: users, friendships,                  │

│         friend_requests, action_log          │

└───────────────────────────────────────────--┘

### 3.2 Data Structure Assignment Table

| Component | Data Structure | File Location | Justification (linked to Use Case) |
|-----------|----------------|---------------|-------------------------------------|
| User Registry | Hash Map | `src/datastructures/UserRegistry.js` | O(1) lookup by ID/username (UC2, UC9) |
| Friend Graph | Graph (Adjacency List via HashMap of Sets) | `src/datastructures/FriendGraph.js` | O(1) edge add/remove; supports BFS (UC6, UC7, UC8) |
| Friend Request Queue | Queue (FIFO) | `src/datastructures/RequestQueue.js` | Requests processed in arrival order (UC3, UC5) |
| Undo History | Stack (LIFO) | `src/datastructures/ActionStack.js` | Most recent action reversed first (UC11) |
| Mutual Friends Finder | Graph BFS + Hash Map | `src/algorithms/MutualFriends.js` | Traverses friend network, counts overlaps (UC7, UC8) |
| Top-K Recommendations | Min-Heap | `src/datastructures/MinHeap.js` | Maintains only top K candidates efficiently (UC8) |
| User Listing | Merge Sort | `src/algorithms/Sorting.js` | O(n log n) alphabetical ordering (UC10) |
| User Search | Binary Search | `src/algorithms/Sorting.js` | O(log n) lookup on sorted list (UC9) |

### 3.3 Module / Class Outline

src/

├── models/

│   ├── User.js

│   │   - Properties: id, username, email, passwordHash

│   │   - Represents a single user

│   │

│   └── Friendship.js

│       - Properties: userId1, userId2, createdAt

│       - Represents a connection between two users

│

├── datastructures/

│   ├── UserRegistry.js

│   │   - addUser(user)

│   │   - getUserById(id)

│   │   - getUserByUsername(username)

│   │   - getAllUsers()

│   │

│   ├── FriendGraph.js

│   │   - addUser(userId)

│   │   - addFriendship(idA, idB)

│   │   - removeFriendship(idA, idB)

│   │   - getFriends(userId)

│   │   - areFriends(idA, idB)

│   │

│   ├── RequestQueue.js

│   │   - enqueue(request)

│   │   - dequeue()

│   │   - processNext(graph, actionStack)

│   │

│   ├── ActionStack.js

│   │   - push(action)

│   │   - pop()

│   │   - undo(graph)

│   │

│   └── MinHeap.js

│       - insert(item)

│       - extractMin()

│       - getTopK(candidates, k)

│

├── algorithms/

│   ├── MutualFriends.js

│   │   - getMutual(graph, userA, userB)

│   │   - getFriendsOfFriends(graph, userId)  ← BFS

│   │

│   └── Sorting.js

│       - mergeSort(users)

│       - binarySearch(sortedUsers, username)

│

├── api/

│   └── server.js

│       - All Express routes (endpoints)

│

└── cli/

└── cli.js (optional, if CLI interface chosen)

### 3.4 API Endpoint Map

| Method | Endpoint | Purpose | Use Case |
|--------|----------|---------|----------|
| POST | /users | Register new user | UC1 |
| POST | /login | Authenticate user | UC2 |
| POST | /friend-request | Send friend request (enqueue) | UC3 |
| GET | /friend-requests/:userId | View pending requests | UC4 |
| POST | /process-request | Process next request in queue | UC5 |
| GET | /friends/:userId | View friend list | UC6 |
| GET | /mutual-friends/:idA/:idB | Get mutual friends | UC7 |
| GET | /recommendations/:userId | Get top-K recommendations | UC8 |
| GET | /users/search?name= | Search user by name | UC9 |
| GET | /users/sorted | View alphabetical user list | UC10 |
| POST | /undo/:userId | Undo last action | UC11 |
| GET | /path/:idA/:idB | Shortest connection path (BFS) | UC12 |


---

## STEP 4: BOTTLENECKS

For each component in our Basic Design (Step 3), we analyze its behavior 
at our defined scale (10,000 users, ~150 friends average, Step 2).

### 4.1 Bottleneck 1 — Naive Mutual Friends Calculation

**Component affected:** Mutual Friends Finder (UC7, UC8)

**Naive approach:** For each friend of User A, loop through every friend 
of User B to check for a match.

**Complexity:** O(d_A × d_B), where d = number of friends

**Problem at scale:**
- If both users have 150 friends: 150 × 150 = 22,500 comparisons
- If a popular user has 500 friends: 500 × 500 = 250,000 comparisons
- Called on every profile view (5,000 times/day) → 1.125 billion 
  comparisons/day in worst case

**Verdict:** Unacceptable. Will cause noticeable lag (> 2 second 
constraint from Step 2).

---

### 4.2 Bottleneck 2 — Recalculating Top-K Recommendations Every Time

**Component affected:** Recommendation Engine (UC8)

**Naive approach:** Collect ALL friend-of-friend candidates, sort the 
entire list by mutual count, then take the top 5.

**Complexity:** O(n log n), where n = number of candidates

**Problem at scale:**
- A user with 150 friends, each having ~150 friends, generates up to 
  22,500 candidate entries (before deduplication)
- Sorting 22,500 entries fully, just to take the top 5, wastes effort 
  on the 22,495 entries we discard
- At 5,000 recommendation requests/day, this adds significant 
  unnecessary computation

**Verdict:** Wasteful. We only need the top 5 — sorting everything 
is overkill.

---

### 4.3 Bottleneck 3 — Linear Search for Users

**Component affected:** User Search (UC9)

**Naive approach:** Loop through the entire user list comparing 
usernames one by one.

**Complexity:** O(n), where n = total users

**Problem at scale:**
- At 10,000 users, a search for a non-existent username requires 
  10,000 comparisons (worst case)
- Constraint from Step 2 requires search response < 100ms — 
  linear search on 10,000 items risks exceeding this if called 
  frequently

**Verdict:** Too slow for the responsiveness constraint.

---

### 4.4 Bottleneck 4 — Adjacency Matrix for Friend Graph

**Component affected:** Friend Graph storage (UC6, UC7, UC8, UC12)

**Naive approach:** Store friendships as an n × n grid where 
matrix[i][j] = 1 if users i and j are friends.

**Complexity:** O(n²) space

**Problem at scale:**
- At 10,000 users: 10,000² = 100,000,000 cells
- Even using 1 byte per cell = 100 MB just for the friend graph, 
  for data that is mostly empty (most user pairs are NOT friends — 
  the graph is "sparse")
- This wastes memory that a standard laptop should not need to spend

**Verdict:** Memory-inefficient. A sparse graph should not use 
dense storage.

---

### 4.5 Bottleneck 5 — Undo Stack Growing Unbounded

**Component affected:** Action Stack (UC11)

**Naive approach:** Push every single action a user ever performs, 
forever, with no limit.

**Complexity:** O(1) per push, but O(n) memory growth over time, 
where n = total actions ever performed

**Problem at scale:**
- A very active user performing thousands of actions over months 
  would have a stack of thousands of entries
- Most of this history is irrelevant — users typically only undo 
  their last 1-2 actions

**Verdict:** Memory grows unnecessarily for a feature that is 
rarely used beyond the most recent action.

---

### 4.6 Summary Table

| # | Bottleneck | Operation | Naive Complexity | At Scale (10,000 users) |
|---|-----------|-----------|-------------------|--------------------------|
| 1 | Mutual friends | Nested loop comparison | O(d²) | Up to 250,000 ops/pair |
| 2 | Top-K recommendations | Full sort of candidates | O(n log n) | ~22,500 × log(22,500) |
| 3 | User search | Linear scan | O(n) | Up to 10,000 ops |
| 4 | Graph storage | Adjacency matrix | O(n²) space | ~100 MB wasted |
| 5 | Undo history | Unbounded stack | O(n) memory | Unbounded growth |


---

## STEP 5: SCALABILITY

For each bottleneck identified in Step 4, we apply a targeted fix. 
We iterate until each operation meets the performance constraints 
defined in Step 2 (response times < 2s for recommendations, 
< 100ms for search).

### 5.1 Fix for Bottleneck 1 — Hash Set Intersection for Mutual Friends

**Problem:** Nested loop comparison was O(d_A × d_B), up to 250,000 
operations per pair.

**Fix:** Represent each user's friend list as a **Hash Set**. To find 
mutual friends, iterate over the *smaller* set and check membership in 
the *larger* set using O(1) hash lookups.

**New Complexity:** O(min(d_A, d_B))

**Before vs After (500 friends each):**


**Iteration check:** With 500 operations per pair, even at 5,000 
recommendation requests/day, total operations = 2,500,000/day — 
trivial for a modern CPU. ✅ Acceptable — no further iteration needed.

---

### 5.2 Fix for Bottleneck 2 — Min-Heap for Top-K Recommendations

**Problem:** Sorting all ~22,500 candidates fully (O(n log n)) just 
to extract the top 5 was wasteful.

**Fix:** Maintain a **Min-Heap of fixed size K=5**. For each candidate:
- If the heap has fewer than K items, insert it
- Otherwise, if the candidate's mutual count is greater than the 
  heap's minimum, remove the minimum and insert the candidate

**New Complexity:** O(n log K), where K is constant (5)

**Before vs After (22,500 candidates, K=5):**


**Iteration check:** 51,750 operations per request, well within the 
2-second constraint. ✅ Acceptable.

---

### 5.3 Fix for Bottleneck 3 — Merge Sort + Binary Search for User Lookup

**Problem:** Linear search was O(n), up to 10,000 comparisons.

**Fix:** Maintain the user list in **sorted order** (sorted once using 
Merge Sort when users are loaded/added, kept sorted via insertion). 
Use **Binary Search** to find a user by username.

**New Complexity:** 
- Sorting (one-time or on update): O(n log n)
- Search (per query): O(log n)

**Before vs After (10,000 users):**


**Iteration check:** 14 comparisons is effectively instant — 
well under the 100ms constraint. ✅ Acceptable.

---

### 5.4 Fix for Bottleneck 4 — Adjacency List Instead of Matrix

**Problem:** Adjacency matrix used O(n²) space ≈ 100MB for 10,000 users.

**Fix:** Use an **adjacency list** — a Hash Map where each key is a 
user ID and the value is a Hash Set of that user's friend IDs.

**New Complexity:** O(V + E) space, where V = users, E = friendship edges

**Before vs After (10,000 users, 750,000 edges from Step 2):**


**Iteration check:** A few MB is negligible for any laptop. 
✅ Acceptable — also enables O(1) friend lookups and O(degree) 
BFS traversal, which the matrix could not provide efficiently.

---

### 5.5 Fix for Bottleneck 5 — Bounded Undo Stack

**Problem:** Unbounded action history caused unnecessary memory growth.

**Fix:** Cap the **Action Stack** at a fixed size (e.g., last 10 actions). 
When the stack exceeds this size, remove the oldest entry (bottom of stack).

**New Complexity:** O(1) memory — fixed maximum size regardless of 
total actions performed

**Before vs After:**


**Iteration check:** 10 entries is more than enough for "undo my 
last action" use cases (UC11). ✅ Acceptable.

---

### 5.6 Summary Table — Before and After

| # | Component | Before (Naive) | After (Optimized) | Result |
|---|-----------|----------------|---------------------|--------|
| 1 | Mutual friends | O(d²) | O(min(d_A, d_B)) | 500× faster |
| 2 | Top-K recommendations | O(n log n) | O(n log K) | ~6× faster |
| 3 | User search | O(n) | O(log n) | ~714× faster |
| 4 | Graph storage | O(n²) space | O(V + E) space | ~95% less memory |
| 5 | Undo history | O(n) memory | O(1) memory | Constant memory |

### 5.7 Final Iteration Check

All five components now meet the constraints defined in Step 2:
- Recommendation response time: well under 2 seconds ✅
- Search response time: well under 100ms ✅
- Memory usage: within standard laptop capacity ✅

No further iteration is required. The design is ready for implementation.