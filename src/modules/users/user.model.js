import mongoose, { Schema } from 'mongoose';
export let UserRole = /*#__PURE__*/function (UserRole) {
  UserRole["USER"] = "USER";
  UserRole["VENDOR"] = "VENDOR";
  UserRole["ADMIN"] = "ADMIN";
  return UserRole;
}({});
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Vendor specific
  fullName: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  businessName: { type: String, trim: true },
  businessAddress: { type: String, trim: true }, // Combined for backward compat
  businessMapAddress: { type: String, trim: true },
  businessManualAddress: { type: String, trim: true },
  businessLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  providedServices: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  bio: { type: String, trim: true },
  adminComments: { type: String, trim: true },
  businessStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});
userSchema.index({
  email: 1
});
const User = mongoose.model('User', userSchema);
export default User;