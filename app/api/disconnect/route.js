import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import Game from '../../../models/Game';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const data = await req.json();
  const { gameId, username } = data;

  if (!gameId || !username) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
  }

  try {
    const game = await Game.findOne({ gameID: gameId });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const playerIndex = game.players.findIndex(player => player === username);

    if (playerIndex !== -1) {
      game.players.splice(playerIndex, 1);
      await game.save();
      return NextResponse.json({ message: 'Player removed successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}