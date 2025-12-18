const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    service: {
      type: mongoose.Schema.ObjectId,
      ref: 'Service'
    },
    quantity: {
      type: Number,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    startDate: Date,
    endDate: Date,
    // For services, we might need specific booking details here or link to Booking objects
    bookingRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking'
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'completed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
