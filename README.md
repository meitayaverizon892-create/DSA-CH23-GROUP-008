# DSA-CH23-GROUP-008 — Social Network (Theme A1)

## Friends Graph + Mutual Friend Recommendations

A simplified social network ("Facebook-lite") demonstrating core data 
structures and algorithms through a friend connection system with 
intelligent recommendations based on mutual friends.

---

## 📋 Problem Statement

Social networks need to efficiently manage millions of user 
relationships while providing fast, relevant friend recommendations. 
This project implements a scaled-down social network that:

- Stores users and their friendships efficiently
- Processes friend requests in a fair, ordered manner
- Recommends new friends based on shared connections (mutual friends)
- Allows users to undo recent actions
- Supports fast search and alphabetical browsing of users
- Finds the "degrees of separation" between any two users

This design follows the **5-step Chapter 23 system design process** 
(Use Cases → Constraints → Basic Design → Bottlenecks → Scalability), 
documented in full in [`docs/report.md`](docs/report.md).

---

## ✨ Features

| Feature | Data Structure / Algorithm |
|---------|----------------------------|
| User registration & lookup | Hash Map |
| Friend connections | Graph (Adjacency List) |
| Undo last action | Stack (LIFO, bounded to 10) |
| Friend request processing | Queue (FIFO) |
| "People You May Know" recommendations | BFS + Hash Map + Min-Heap |
| Mutual friends finder | Hash Set Intersection |
| Degrees of separation | BFS Shortest Path |
| Alphabetical user listing | Merge Sort (O(n log n)) |
| Username search | Binary Search (O(log n)) |

---

## 🏗️ Architecture Diagram

┌──────────────────────────────────────────────────────────┐

│                     CLIENT (Thunder Client / API caller)    │

└───────────────────────────┬──────────────────────────────┘

│ HTTP Requests

▼

┌──────────────────────────────────────────────────────────┐

│                   API LAYER (Express.js)                   │

│  Routes: /users, /friend-requests, /recommendations, etc.   │

└───────────────────────────┬──────────────────────────────┘

│

┌─────────────────────┼─────────────────────┐

▼                     ▼                     ▼

┌───────────────┐   ┌──────────────────┐   ┌──────────────────┐

│ User Registry  │   │  Friend Graph     │   │  Request Queue    │

│ (HashMap)      │   │ (Adjacency List)  │   │  (Queue/FIFO)     │

└───────┬────────┘   └─────────┬─────────┘   └─────────┬────────┘

│                       │                       │

│              ┌────────┴─────────┐             │

│              ▼                  ▼             │

│      ┌──────────────┐   ┌──────────────┐      │

│      │ Mutual Friends│   │  Action Stack │◄────┘

│      │ (BFS + HashMap)│   │  (Undo - LIFO)│

│      └──────┬───────┘   └──────────────┘

│             ▼

│      ┌──────────────┐

│      │  Min-Heap     │

│      │  (Top-K Recs) │

│      └──────────────┘

│

▼

┌──────────────────────────────────────────────────────────┐

│           PERSISTENCE LAYER (PostgreSQL Database)            │

└──────────────────────────────────────────────────────────┘


A higher-resolution version is available at [`docs/architecture.png`](docs/architecture.png).

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/meitayaverizon892-create/DSA-CH23-GROUP-008.git
cd DSA-CH23-GROUP-008

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file in the root directory with:
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_NAME=social_network
#   DB_USER=postgres
#   DB_PASSWORD=your_password
#   PORT=3000

# 4. Set up the database
# Run the SQL in docs/schema.sql using pgAdmin or psql

# 5. Run the test suite
npm test

# 6. Run the benchmark
npm run benchmark

# 7. Start the server
npm run dev
```

The API will be running at `http://localhost:3000`

---

## 📡 API Endpoints & Sample Inputs/Outputs

### Register a User

### Send a Friend Request

### Process Next Friend Request

### View Friends List

### Get Mutual Friends

### Get Friend Recommendations (BFS + Min-Heap)


### Search for a User (Binary Search)

### Sorted User List (Merge Sort)

### Shortest Connection Path (BFS)

### Undo Last Action

---

## 🧪 Testing

28 automated test cases covering normal and edge cases for every 
mandatory data structure:

```bash
npm test
```

See [`tests/runAllTests.js`](tests/runAllTests.js) for full details.

---

## 📊 Benchmark Results

See [`benchmark/results.md`](benchmark/results.md) for full performance 
analysis across 100 to 10,000 users, confirming our Big-O complexity 
claims from the System Design Report.

```bash
npm run benchmark
```

---

## 📐 System Design Report

The full 5-step Chapter 23 design process (Use Cases, Constraints, 
Basic Design, Bottlenecks, Scalability) is documented in 
[`docs/report.md`](docs/report.md).

---

## 📁 Project Structure

DSA-CH23-GROUP-008/

├── src/

│   ├── models/           # User model

│   ├── datastructures/   # HashMap, Graph, Stack, Queue, MinHeap

│   ├── algorithms/        # BFS/MutualFriends, MergeSort/BinarySearch

│   └── api/               # Express server and shared data store

├── tests/                  # 28 automated test cases

├── benchmark/              # Performance benchmark script and results

├── docs/                   # System design report, architecture diagram

└── README.md

---

## 👥 Team Members & Roles

| Name | Role | GitHub Username |
|------|------|----------------|
| [Name 1] | Team Lead | @meitayaverizon892-create |
| [Name 2] | System Design Lead | @username |
| [Name 3] | Data Structures Lead | @username |
| [Name 4] | Algorithms Lead | @username |
| [Name 5] | Backend Developer | @username |
| [Name 6] | UI/CLI Developer | @username |
| [Name 7] | Testing & QA Lead | @username |
| [Name 8] | Documentation Lead | @username |
| [Name 9] | Performance/Benchmark Lead | @username |
| [Name 10] | Demo/Video Presenter | @username |

---

## 🎥 Demo Video

[YouTube Link will be added here after recording]

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Testing:** Custom test runner with Node's `assert` module
- **API Testing:** Thunder Client (VS Code extension)