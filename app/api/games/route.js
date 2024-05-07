import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import Game from '../../../models/Game';
import { cookies } from 'next/headers';
import validateSession from '../../../utils/validateSession';

export async function GET(req) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const games = await Game.find({ isActive: true }).select('-__v'); // Excludes the version key from the output
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching games' }, { status: 500 });
  }
}

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const usernameCookie = cookies(req).get('username');
    const sessionTokenCookie = cookies(req).get('sessionToken');
    const username = usernameCookie ? usernameCookie.value : null;
    const sessionToken = sessionTokenCookie ? sessionTokenCookie.value : null;

    if (!username || !sessionToken) {
      return NextResponse.json({ error: 'Username or session token not provided' }, { status: 401 });
    }

    const isValidSession = await validateSession(username, sessionToken);
    if (!isValidSession) {
      console.log('Invalid session or username');
      return NextResponse.json({ error: 'Invalid session or username' }, { status: 403 });
    }

    const existingGame = await Game.findOne({ creator: username, isActive: true });
    if (existingGame) {
      console.log('User already has an active game');
      return NextResponse.json({ error: 'User already has an active game' }, { status: 403 });
    }

    const game = new Game({
      gameID: Math.random().toString(36).substring(7),  // Generate a random gameID
      creator: username,
      players: [username],  // Initially, the creator is the only player
      isActive: true,
    });

    await game.save();
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}