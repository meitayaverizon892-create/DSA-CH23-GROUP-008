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