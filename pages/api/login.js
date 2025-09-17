// pages/api/login.js
import { setSession } from './set-session.js';
import { validateUser } from './create-user.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Validate user credentials
    const user = await validateUser(username, password);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Create session data
    const sessionData = {
      userId: user.id,
      username: user.username,
      loginTime: Date.now(),
    };

    // Set session cookie
    const sessionSet = await setSession(res, sessionData);
    
    if (!sessionSet) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create session' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      user: { username: user.username } 
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
