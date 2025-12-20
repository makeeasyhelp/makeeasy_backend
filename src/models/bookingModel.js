const mongoose = require('mongoose');

/**
 * Booking Schema - Enhanced for Rental System
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
  
  // Booking Type
  bookingType: {
    type: String,
    enum: ['rental', 'service'],
    default: 'service'
  },
  
  // === RENTAL-SPECIFIC FIELDS ===
  
  // City & Pricing
  selectedCity: {
    type: String,
    trim: true
  },
  
  selectedTenure: {
    type: Number, // in months
    min: 1
  },
  
  monthlyRent: {
    type: Number,
    min: 0
  },
  
  // Deposit Management
  depositAmount: {
    type: Number,
    default: 0
  },
  
  depositStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'adjusted'],
    default: 'pending'
  },
  
  depositPaidDate: {
    type: Date
  },
  
  depositRefundDate: {
    type: Date
  },
  
  // Delivery
  deliveryCharge: {
    type: Number,
    default: 0
  },
  
  deliveryAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  deliveryDate: {
    type: Date
  },
  
  deliveryTimeSlot: {
    type: String,
    enum: ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']
  },
  
  deliveryStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'out_for_delivery', 'delivered', 'failed'],
    default: 'pending'
  },
  
  // Rental Lifecycle
  rentalStatus: {
    type: String,
    enum: ['pending_delivery', 'active', 'paused', 'extended', 'pending_pickup', 'returned', 'closed'],
    default: 'pending_delivery'
  },
  
  rentalStartDate: {
    type: Date // Actual date when product was delivered
  },
  
  plannedEndDate: {
    type: Date // Original planned end date
  },
  
  actualEndDate: {
    type: Date // Actual return date
  },
  
  // Monthly Billing
  billingCycleStart: {
    type: Number, // Day of month (1-31)
    default: 1
  },
  
  nextBillingDate: {
    type: Date
  },
  
  // Add-ons
  selectedAddOns: [{
    addOn: {
      type: mongoose.Schema.ObjectId,
      ref: 'AddOn'
    },
    name: String,
    monthlyCharge: Number,
    oneTimeCharge: Number
  }],
  
  // Service Requests
  serviceRequests: [{
    type: mongoose.Schema.ObjectId,
    ref: 'ServiceRequest'
  }],
  
  // Extension Management
  extensionRequests: [{
    requestedMonths: Number,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    approvedAt: Date,
    newEndDate: Date
  }],
  
  // Early Closure
  earlyClosureRequested: {
    type: Boolean,
    default: false
  },
  
  earlyClosureRequestDate: {
    type: Date
  },
  
  earlyClosureCharge: {
    type: Number,
    default: 0
  },
  
  pickupScheduledDate: {
    type: Date
  },
  
  pickupTimeSlot: {
    type: String,
    enum: ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']
  },
  
  // === ORIGINAL FIELDS ===
  
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

// === METHODS ===

// Calculate total rental amount for the tenure
BookingSchema.methods.calculateTotalRentalAmount = function() {
  if (this.bookingType !== 'rental') return 0;
  
  const baseAmount = (this.monthlyRent || 0) * (this.selectedTenure || 1);
  const addOnsTotal = this.selectedAddOns.reduce((sum, addon) => {
    return sum + ((addon.monthlyCharge || 0) * (this.selectedTenure || 1)) + (addon.oneTimeCharge || 0);
  }, 0);
  
  return baseAmount + addOnsTotal + (this.deliveryCharge || 0);
};

// Check if early closure is allowed
BookingSchema.methods.canRequestEarlyClosure = function() {
  if (this.bookingType !== 'rental') return false;
  if (this.rentalStatus !== 'active') return false;
  if (this.earlyClosureRequested) return false;
  
  // Check if minimum tenure completed (e.g., at least 1 month)
  if (!this.rentalStartDate) return false;
  
  const oneMonthFromStart = new Date(this.rentalStartDate);
  oneMonthFromStart.setMonth(oneMonthFromStart.getMonth() + 1);
  
  return new Date() >= oneMonthFromStart;
};

// Calculate remaining rental months
BookingSchema.methods.getRemainingMonths = function() {
  if (this.bookingType !== 'rental' || !this.rentalStartDate) return 0;
  
  const now = new Date();
  const endDate = this.plannedEndDate || this.endDate;
  
  if (now >= endDate) return 0;
  
  const diffTime = endDate - now;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return Math.max(0, diffMonths);
};

// Update rental status based on dates
BookingSchema.methods.updateRentalStatus = function() {
  if (this.bookingType !== 'rental') return;
  
  const now = new Date();
  
  if (this.deliveryStatus === 'delivered' && !this.rentalStartDate) {
    this.rentalStartDate = now;
    this.rentalStatus = 'active';
  }
  
  if (this.rentalStatus === 'active' && this.plannedEndDate && now > this.plannedEndDate) {
    this.rentalStatus = 'pending_pickup';
  }
};

// === INDEXES ===
BookingSchema.index({ user: 1, rentalStatus: 1 });
BookingSchema.index({ product: 1 });
BookingSchema.index({ nextBillingDate: 1, rentalStatus: 1 });
BookingSchema.index({ deliveryDate: 1, deliveryStatus: 1 });

// === VALIDATIONS ===

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

// Set booking type based on product/service
BookingSchema.pre('save', function(next) {
  if (this.product) {
    this.bookingType = 'rental';
  } else if (this.service) {
    this.bookingType = 'service';
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
