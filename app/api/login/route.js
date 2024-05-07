import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import User from '../../../models/User';
import Session from '../../../models/Session';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers'

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const data = await req.json();
  const { username, password } = data;

  // Check if input is valid
  if (!username || !password) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    return NextResponse.json({ error: 'User does not exist!' }, { status: 401 });
  }

  // Check if password is correct
  const isValid = await bcrypt.compare(password, existingUser.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Generate session token (UUID)
  const sessionToken = uuidv4();

  // Remove any existing session for this user
  await Session.findOneAndDelete({ username });

  // Store the new session
  const session = new Session({
    username,
    sessionToken,
  });

  // Save the session
  await session.save();

  // Set cookies
  const oneDay = 24 * 60 * 60 * 1000
  cookies().set('username', username, { expires: Date.now() + oneDay })
  cookies().set('sessionToken', sessionToken, { expires: Date.now() + oneDay })

  return NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
}