-- Table 1: Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Friendships
CREATE TABLE friendships (
    user_id_1 INT REFERENCES users(id),
    user_id_2 INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

-- Table 3: Friend Requests
CREATE TABLE friend_requests (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Action Log (for undo stack)
CREATE TABLE action_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action_type VARCHAR(50),
    target_user_id INT,
    created_at TIMESTAMP DEFAULT NOW()
);