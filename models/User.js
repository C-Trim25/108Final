import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  score: {type: Number, required: true}
}, { versionKey: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;