import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, default: '' },
    isDisabled: { type: Boolean, default: false },
    disabledAt: { type: Date, default: null },
    disabledBy: { type: String, default: '' }, // Admin email who disabled it
    reason: { type: String, default: '' }, // Optional reason for disabling
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ firebaseUID: 1 });
userSchema.index({ isDisabled: 1 });

const User = mongoose.model('User', userSchema);

export default User;

