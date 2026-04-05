import mongoose, { Schema } from 'mongoose';
const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🔧'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isComingSoon: {
    type: Boolean,
    default: false
  },
  position: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});
const Service = mongoose.model('Service', serviceSchema);
export default Service;