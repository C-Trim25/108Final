import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import Session from '../../../models/Session';
import { cookies } from 'next/headers'
import validateSession from '../../../utils/validateSession';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  // Extract username and session token from cookies
  const usernameCookie = cookies(req).get('username');
  const sessionTokenCookie = cookies(req).get('sessionToken');
  const username = usernameCookie ? usernameCookie.value : null;
  const sessionToken = sessionTokenCookie ? sessionTokenCookie.value : null;

  if (!username || !sessionToken) {
    return NextResponse.json({ error: 'Username or session token not provided' }, { status: 401 });
  }

  // Validate the session
  const isValidSession = await validateSession(username, sessionToken);
  if (!isValidSession) {
    return NextResponse.json({ error: 'Invalid session or username' }, { status: 403 });
  }

  // Remove session for this user
  await Session.findOneAndDelete({ sessionToken });

  // Set cookies
  cookies().delete('username')
  cookies().delete('sessionToken')

  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}