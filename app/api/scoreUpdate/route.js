import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import User from '../../../models/User';

export default async function handler(req, res) {
    try {
      const { winnerUsername } = req.body;
  
      // Update the wins of the winning player in the database
      const updatedUser = await User.findOneAndUpdate(
        { username: winnerUsername },
        { $inc: { score: 1 } }, // Increment wins by 1
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'User wins updated successfully', user: updatedUser });
    } catch (err) {
      console.error('Error updating user wins:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
}

