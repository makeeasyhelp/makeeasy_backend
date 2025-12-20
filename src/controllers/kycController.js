const KYC = require('../models/kycModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Submit KYC documents
 * @route   POST /api/kyc
 * @access  Private
 */
exports.submitKYC = async (req, res, next) => {
  try {
    const {
      idProofType,
      idProofNumber,
      addressProofType,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark
    } = req.body;

    // Check if user already has KYC
    const existingKYC = await KYC.findOne({ user: req.user.id });
    if (existingKYC && existingKYC.status === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'KYC already verified for this user'
      });
    }

    // Check if files are uploaded
    if (!req.files || !req.files.idProofDocument || !req.files.addressProofDocument) {
      return res.status(400).json({
        success: false,
        error: 'Please upload both ID proof and address proof documents'
      });
    }

    // Get file URLs (assuming multer stores files)
    const idProofDocumentUrl = `/uploads/kyc/${req.files.idProofDocument[0].filename}`;
    const addressProofDocumentUrl = `/uploads/kyc/${req.files.addressProofDocument[0].filename}`;

    const kycData = {
      user: req.user.id,
      idProof: {
        type: idProofType,
        number: idProofNumber,
        documentUrl: idProofDocumentUrl,
        verified: false
      },
      addressProof: {
        type: addressProofType,
        documentUrl: addressProofDocumentUrl,
        verified: false
      },
      currentAddress: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark
      },
      status: 'pending',
      submittedAt: new Date()
    };

    let kyc;
    if (existingKYC) {
      // Update existing KYC
      Object.assign(existingKYC, kycData);
      kyc = await existingKYC.save();
    } else {
      // Create new KYC
      kyc = await KYC.create(kycData);
    }

    // Update user's KYC status
    await User.findByIdAndUpdate(req.user.id, {
      kycStatus: 'pending',
      kycDetails: kyc._id
    });

    res.status(201).json({
      success: true,
      message: 'KYC documents submitted successfully. Verification usually takes 24-48 hours.',
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's KYC status
 * @route   GET /api/kyc
 * @access  Private
 */
exports.getKYCStatus = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.id });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: 'No KYC documents found',
        kycStatus: 'not_submitted'
      });
    }

    res.status(200).json({
      success: true,
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update KYC documents
 * @route   PUT /api/kyc
 * @access  Private
 */
exports.updateKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.id });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: 'No KYC found. Please submit KYC first.'
      });
    }

    // Only allow updates if KYC is not verified or rejected
    if (kyc.status === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update verified KYC'
      });
    }

    const {
      idProofType,
      idProofNumber,
      addressProofType,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark
    } = req.body;

    // Update text fields
    if (idProofType) kyc.idProof.type = idProofType;
    if (idProofNumber) kyc.idProof.number = idProofNumber;
    if (addressProofType) kyc.addressProof.type = addressProofType;
    
    if (addressLine1) kyc.currentAddress.addressLine1 = addressLine1;
    if (addressLine2) kyc.currentAddress.addressLine2 = addressLine2;
    if (city) kyc.currentAddress.city = city;
    if (state) kyc.currentAddress.state = state;
    if (pincode) kyc.currentAddress.pincode = pincode;
    if (landmark) kyc.currentAddress.landmark = landmark;

    // Update documents if new files uploaded
    if (req.files) {
      if (req.files.idProofDocument) {
        kyc.idProof.documentUrl = `/uploads/kyc/${req.files.idProofDocument[0].filename}`;
        kyc.idProof.verified = false;
      }
      if (req.files.addressProofDocument) {
        kyc.addressProof.documentUrl = `/uploads/kyc/${req.files.addressProofDocument[0].filename}`;
        kyc.addressProof.verified = false;
      }
    }

    // Reset status to pending
    kyc.status = 'pending';
    kyc.submittedAt = new Date();
    kyc.rejectionReason = undefined;

    await kyc.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(req.user.id, {
      kycStatus: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'KYC documents updated successfully',
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all KYC submissions
 * @route   GET /api/kyc/admin/all
 * @access  Private/Admin
 */
exports.getAllKYCSubmissions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const kycSubmissions = await KYC.find(query)
      .populate('user', 'name email phone')
      .populate('verifiedBy', 'name email')
      .sort('-submittedAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await KYC.countDocuments(query);

    res.status(200).json({
      success: true,
      count: kycSubmissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: kycSubmissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get single KYC details
 * @route   GET /api/kyc/admin/:id
 * @access  Private/Admin
 */
exports.getKYCDetails = async (req, res, next) => {
  try {
    const kyc = await KYC.findById(req.params.id)
      .populate('user', 'name email phone addresses')
      .populate('verifiedBy', 'name email');

    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: 'KYC not found'
      });
    }

    res.status(200).json({
      success: true,
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Verify KYC
 * @route   POST /api/kyc/admin/:id/verify
 * @access  Private/Admin
 */
exports.verifyKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: 'KYC not found'
      });
    }

    if (kyc.status === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'KYC already verified'
      });
    }

    // Mark as verified
    kyc.status = 'verified';
    kyc.idProof.verified = true;
    kyc.addressProof.verified = true;
    kyc.verifiedBy = req.user.id;
    kyc.verifiedAt = new Date();

    await kyc.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(kyc.user, {
      kycStatus: 'verified'
    });

    // Populate for response
    await kyc.populate('user', 'name email');
    await kyc.populate('verifiedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'KYC verified successfully',
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Reject KYC
 * @route   POST /api/kyc/admin/:id/reject
 * @access  Private/Admin
 */
exports.rejectKYC = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a reason for rejection'
      });
    }

    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: 'KYC not found'
      });
    }

    if (kyc.status === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Cannot reject verified KYC'
      });
    }

    // Mark as rejected
    kyc.status = 'rejected';
    kyc.rejectionReason = reason;
    kyc.verifiedBy = req.user.id;
    kyc.verifiedAt = new Date();

    await kyc.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(kyc.user, {
      kycStatus: 'rejected'
    });

    // Populate for response
    await kyc.populate('user', 'name email');
    await kyc.populate('verifiedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'KYC rejected',
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Mark KYC under review
 * @route   PUT /api/kyc/admin/:id/review
 * @access  Private/Admin
 */
exports.markUnderReview = async (req, res, next) => {
  try {
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        error: 'KYC not found'
      });
    }

    kyc.status = 'under_review';
    await kyc.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(kyc.user, {
      kycStatus: 'under_review'
    });

    res.status(200).json({
      success: true,
      message: 'KYC marked as under review',
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get KYC statistics (Admin)
 * @route   GET /api/kyc/admin/stats
 * @access  Private/Admin
 */
exports.getKYCStats = async (req, res, next) => {
  try {
    const stats = await KYC.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      under_review: 0,
      verified: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};
