const mongoose = require('mongoose');

/**
 * Monthly Billing Schema - For tracking recurring rental charges
 */
const MonthlyBillingSchema = new mongoose.Schema({
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
  
  // Billing Period
  billingPeriod: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  
  // Rental Amount
  rentalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Add-on charges
  addOns: [{
    addOn: {
      type: mongoose.Schema.ObjectId,
      ref: 'AddOn'
    },
    name: String,
    charge: Number
  }],
  
  // Total add-on charges
  addOnTotal: {
    type: Number,
    default: 0
  },
  
  // GST
  gst: {
    type: Number,
    default: 0
  },
  
  // Total Amount
  totalAmount: {
    type: Number,
    default: 0
  },
  
  // Due Date
  dueDate: {
    type: Date,
    required: true
  },
  
  // Payment Details
  paidDate: {
    type: Date
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'waived', 'failed'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'auto_debit'],
    trim: true
  },
  
  transactionId: {
    type: String,
    trim: true
  },
  
  // Invoice
  invoiceUrl: {
    type: String
  },
  
  // Late fee (if overdue)
  lateFee: {
    type: Number,
    default: 0
  },
  
  // Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
MonthlyBillingSchema.index({ user: 1, paymentStatus: 1 });
MonthlyBillingSchema.index({ booking: 1 });
MonthlyBillingSchema.index({ dueDate: 1, paymentStatus: 1 });

// Calculate total before saving
MonthlyBillingSchema.pre('save', function(next) {
  // Calculate add-on total
  if (this.addOns && this.addOns.length > 0) {
    this.addOnTotal = this.addOns.reduce((sum, addon) => sum + (addon.charge || 0), 0);
  }
  
  // Calculate total amount (rental + add-ons + gst + late fee)
  const subtotal = this.rentalAmount + this.addOnTotal;
  this.gst = subtotal * 0.18; // 18% GST
  this.totalAmount = subtotal + this.gst + this.lateFee;
  
  next();
});

module.exports = mongoose.model('MonthlyBilling', MonthlyBillingSchema);
