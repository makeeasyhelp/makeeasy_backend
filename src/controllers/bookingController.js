const Booking = require('../models/bookingModel');
const Product = require('../models/productModel');
const Service = require('../models/serviceModel');

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res, next) => {
  try {
    let query;
    
    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query = Booking.find({ user: req.user.id });
    } else {
      query = Booking.find();
    }
    
    // Add references
    query = query.populate([
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'title price location' },
      { path: 'service', select: 'title price description' }
    ]);
    
    // Execute query
    const bookings = await query;
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate([
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'title price location' },
      { path: 'service', select: 'title price description' }
    ]);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Validate product or service
    if (req.body.product) {
      // Check if product exists
      const product = await Product.findById(req.body.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      // Check if product is available
      if (!product.available) {
        return res.status(400).json({
          success: false,
          error: 'Product is not available for booking'
        });
      }
    } else if (req.body.service) {
      // Check if service exists
      const service = await Service.findById(req.body.service);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }
      
      // Check if service is available
      if (!service.available) {
        return res.status(400).json({
          success: false,
          error: 'Service is not available for booking'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a product or service ID'
      });
    }
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }
    
    // Users can only update notes field
    if (req.user.role !== 'admin') {
      req.body = { notes: req.body.notes };
    }
    
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this booking'
      });
    }
    
    await booking.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking payment status
 * @route   PUT /api/bookings/:id/payment
 * @access  Private (Admin)
 */
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        error: 'Please provide payment status'
      });
    }
    
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Admin)
 */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus } = req.body;
    
    if (!bookingStatus) {
      return res.status(400).json({
        success: false,
        error: 'Please provide booking status'
      });
    }
    
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
