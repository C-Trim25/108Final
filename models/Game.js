import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameID: { type: String, required: true },
  creator: { type: String, required: true },
  players: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
});

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

export default Game;