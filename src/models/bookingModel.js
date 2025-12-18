const mongoose = require('mongoose');

/**
 * Booking Schema
 */
const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order'
  },
  // Either product or service will be defined, not both
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add the total amount']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  customerName: {
    type: String,
    required: [true, 'Please add customer name'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Please add customer email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  customerPhone: {
    type: String,
    required: [true, 'Please add customer phone number'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add validation to ensure either product or service is provided
BookingSchema.pre('save', function (next) {
  if (!this.product && !this.service) {
    next(new Error('Either product or service must be provided'));
  } else if (this.product && this.service) {
    next(new Error('Cannot book both product and service together'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
