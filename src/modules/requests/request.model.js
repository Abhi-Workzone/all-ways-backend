import mongoose, { Schema } from 'mongoose';
export const RequestStatus = {
  REQUESTED: 'REQUESTED',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  ON_THE_WAY: 'ON_THE_WAY',
  ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};
const requestSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  address: {
    type: String, // Combined for backward compat
    required: true
  },
  mapAddress: {
    type: String,
    required: false
  },
  manualAddress: {
    type: String,
    required: false
  },
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  preferredTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.REQUESTED
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  rejectedVendors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  beforeImages: [String],
  afterImages: [String],
  logs: [{
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    role: String,
    fromStatus: String,
    toStatus: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});
requestSchema.index({
  userId: 1
});
requestSchema.index({
  status: 1
});
const Request = mongoose.model('Request', requestSchema);
export default Request;