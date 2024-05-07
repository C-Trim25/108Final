import mongoose from 'mongoose';
import Session from '../models/Session';

async function validateSession(username, sessionToken) {
  if (!sessionToken || !username) {
    console.error('Session token or username not provided');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if a session exists with the given username and sessionToken
    const existingSession = await Session.findOne({ username: username, sessionToken: sessionToken });

    return existingSession !== null;
  } catch (error) {
    console.error('Error connecting to MongoDB or finding session:', error);
    return false;
  }
}

export default validateSession;