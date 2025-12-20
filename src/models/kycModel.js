const mongoose = require('mongoose');

/**
 * KYC Schema - For user verification before delivery
 */
const KYCSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // ID Proof
  idProof: {
    type: {
      type: String,
      enum: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'],
      required: true
    },
    number: {
      type: String,
      required: true,
      trim: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Address Proof
  addressProof: {
    type: {
      type: String,
      enum: ['aadhaar', 'utility_bill', 'bank_statement', 'rental_agreement'],
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Current Address
  currentAddress: {
    addressLine1: {
      type: String,
      required: true,
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  
  // Verification Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },
  
  rejectionReason: {
    type: String,
    trim: true
  },
  
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  verifiedAt: {
    type: Date
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
KYCSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('KYC', KYCSchema);
