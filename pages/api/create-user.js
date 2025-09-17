// create-user.js
// User creation functionality

import crypto from 'crypto';

// Simple in-memory storage - replace with actual database
let users = [];

export async function createUser(username, password) {
  try {
    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }

    // Hash password (in production, use bcrypt)
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Create user object
    const user = {
      id: crypto.randomUUID(),
      username,
      password: hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
    };

    // Store user (replace with database operation)
    users.push(user);

    // Return user without password
    const { password: _, salt: __, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };

  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Failed to create user' };
  }
}

export async function validateUser(username, password) {
  try {
    const user = users.find(u => u.username === username);
    if (!user) return null;

    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    
    if (hashedPassword === user.password) {
      const { password: _, salt: __, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}
