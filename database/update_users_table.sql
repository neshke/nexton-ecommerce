-- Add role column to users table
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- Create an initial admin user (change the email and password as needed)
-- Password is hashed version of 'Admin123!' - replace with your own hash if needed
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2y$10$KIUnJwb5g/w2pxJtkEu7n.UmgH3pTpJpB8z8xLKhRnWto6bOH3MI6', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';
