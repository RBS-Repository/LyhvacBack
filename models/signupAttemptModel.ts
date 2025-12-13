import mongoose from 'mongoose';

const signupAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    ipAddress: { type: String },
    attemptCount: { type: Number, default: 1 },
    lastAttempt: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false },
    blockUntil: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
signupAttemptSchema.index({ email: 1 });
signupAttemptSchema.index({ ipAddress: 1 });
signupAttemptSchema.index({ lastAttempt: 1 });

const SignupAttempt = mongoose.model('SignupAttempt', signupAttemptSchema);

export default SignupAttempt;

