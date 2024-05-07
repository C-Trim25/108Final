import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  sessionToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }
}, { versionKey: false });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;