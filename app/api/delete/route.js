import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import Game from '../../../models/Game';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const data = await req.json();
  const { gameId } = data;

  if (!gameId) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
  }

  try {
    const game = await Game.findOne({ gameID: gameId });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    await Game.deleteOne({ gameID: gameId });
    return NextResponse.json({ message: 'Game deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}