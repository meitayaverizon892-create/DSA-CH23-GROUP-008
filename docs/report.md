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