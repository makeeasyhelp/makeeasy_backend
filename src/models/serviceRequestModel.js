const mongoose = require('mongoose');

/**
 * Service Request Schema - For maintenance, relocation, complaints
 */
const ServiceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Request Type
  type: {
    type: String,
    enum: ['maintenance', 'repair', 'relocation', 'swap', 'complaint', 'other'],
    required: true
  },
  
  // Issue Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Supporting Images
  images: [String],
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled'],
    default: 'open'
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  assignedAt: {
    type: Date
  },
  
  // Scheduled Visit
  scheduledDate: {
    type: Date
  },
  
  scheduledTimeSlot: {
    type: String,
    enum: ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']
  },
  
  // Resolution
  resolution: {
    type: String,
    trim: true
  },
  
  resolvedAt: {
    type: Date
  },
  
  closedAt: {
    type: Date
  },
  
  // Rating after resolution
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
ServiceRequestSchema.index({ user: 1, status: 1 });
ServiceRequestSchema.index({ booking: 1 });
ServiceRequestSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
