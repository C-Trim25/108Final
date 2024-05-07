import mongoose from 'mongoose';
import Game from '../../../models/Game';
import { NextResponse } from 'next/server';


export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const data = await req.json();
  const creatorUsername = data.username;
  const username = (req.cookies.get('username')).value;

  try {
    const game = await Game.findOne({ creator: creatorUsername, isActive: true });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    if (!game.isActive) {
      return NextResponse.json({ error: 'Game is not active' }, { status: 403 });
    }

    // Check if the user is already in the game
    if (game.players.includes(username)) {
      return NextResponse.json({ error: 'User already in the game' }, { status: 409 });
    }

    // Add user to the game
    game.players.push(username);
    await game.save();
    return NextResponse.json({ game: game, username: username }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}