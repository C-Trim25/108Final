import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import Session from '../../../models/Session';

export async function POST(req) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Ensure MongoDB connection is established
    await mongoose.connect(process.env.MONGODB_URI);

    // Extract sessionToken and username from the request
    const data = await req.json();
    const { username, sessionToken } = data;

    if (!sessionToken || !username) {
        return NextResponse.json({ error: 'Session token or username not provided' }, { status: 401 });
    }

    // Check if a session exists with the provided username and sessionToken
    const existingSession = await Session.findOne({ username: username, sessionToken: sessionToken });

    if (!existingSession) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
}