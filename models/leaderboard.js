import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
}, { versionKey: false });

const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', userSchema);

export default Leaderboard;