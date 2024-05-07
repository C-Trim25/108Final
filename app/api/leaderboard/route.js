import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../models/User';

export async function GET(req) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // Query users and retrieve top scorers based on score (descending order)
    const leaderboard = await User.find({})
      .sort({ score: -1 })
      .select('username score -_id') // Select username and score fields, exclude _id
      .exec();

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching leaderboard' }, { status: 500 });
  }
}
