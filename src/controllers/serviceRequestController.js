const ServiceRequest = require('../models/serviceRequestModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

/**
 * @desc    Create service request
 * @route   POST /api/service-requests
 * @access  Private
 */
exports.createServiceRequest = async (req, res, next) => {
  try {
    const {
      bookingId,
      type,
      title,
      description,
      priority
    } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create service request for this booking'
      });
    }

    // Check if booking is active
    if (!['active', 'paused', 'extended'].includes(booking.rentalStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Service requests can only be created for active rentals'
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/service-requests/${file.filename}`);
    }

    const serviceRequest = await ServiceRequest.create({
      user: req.user.id,
      booking: bookingId,
      product: booking.product,
      type,
      title,
      description,
      images,
      priority: priority || 'medium',
      status: 'open'
    });

    // Add service request reference to booking
    booking.serviceRequests.push(serviceRequest._id);
    await booking.save();

    // Populate details
    await serviceRequest.populate([
      { path: 'booking', select: 'selectedCity selectedTenure' },
      { path: 'product', select: 'title images' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's service requests
 * @route   GET /api/service-requests
 * @access  Private
 */
exports.getServiceRequests = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const serviceRequests = await ServiceRequest.find(query)
      .populate('booking', 'selectedCity rentalStatus')
      .populate('product', 'title images')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: serviceRequests.length,
      data: serviceRequests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service request
 * @route   GET /api/service-requests/:id
 * @access  Private
 */
exports.getServiceRequest = async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('booking', 'selectedCity rentalStatus deliveryAddress')
      .populate('product', 'title images specifications')
      .populate('assignedTo', 'name email phone');

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    // Check ownership or admin
    if (serviceRequest.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this service request'
      });
    }

    res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update service request
 * @route   PUT /api/service-requests/:id
 * @access  Private
 */
exports.updateServiceRequest = async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    // Check ownership
    if (serviceRequest.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this service request'
      });
    }

    // Only allow updates if status is 'open'
    if (serviceRequest.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: 'Can only update open service requests'
      });
    }

    const { title, description, priority } = req.body;

    if (title) serviceRequest.title = title;
    if (description) serviceRequest.description = description;
    if (priority) serviceRequest.priority = priority;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/service-requests/${file.filename}`);
      serviceRequest.images.push(...newImages);
    }

    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Service request updated',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel service request
 * @route   DELETE /api/service-requests/:id
 * @access  Private
 */
exports.cancelServiceRequest = async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    // Check ownership
    if (serviceRequest.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this service request'
      });
    }

    // Can only cancel if open or assigned
    if (!['open', 'assigned'].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        error: 'Can only cancel open or assigned service requests'
      });
    }

    serviceRequest.status = 'cancelled';
    serviceRequest.closedAt = new Date();
    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Service request cancelled',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rate resolved service request
 * @route   POST /api/service-requests/:id/rate
 * @access  Private
 */
exports.rateServiceRequest = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating (1-5)'
      });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    // Check ownership
    if (serviceRequest.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Can only rate resolved requests
    if (serviceRequest.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        error: 'Can only rate resolved service requests'
      });
    }

    serviceRequest.rating = rating;
    serviceRequest.feedback = feedback;
    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all service requests
 * @route   GET /api/service-requests/admin/all
 * @access  Private/Admin
 */
exports.getAllServiceRequests = async (req, res, next) => {
  try {
    const { status, type, priority, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const serviceRequests = await ServiceRequest.find(query)
      .populate('user', 'name email phone')
      .populate('booking', 'selectedCity rentalStatus')
      .populate('product', 'title')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ServiceRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: serviceRequests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: serviceRequests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Assign service request
 * @route   POST /api/service-requests/admin/:id/assign
 * @access  Private/Admin
 */
exports.assignServiceRequest = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: 'Please provide user ID to assign'
      });
    }

    // Verify assignee exists
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        error: 'Assignee not found'
      });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    serviceRequest.assignedTo = assignedTo;
    serviceRequest.assignedAt = new Date();
    serviceRequest.status = 'assigned';

    await serviceRequest.save();

    await serviceRequest.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'assignedTo', select: 'name email phone' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Service request assigned successfully',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Schedule visit
 * @route   PUT /api/service-requests/admin/:id/schedule
 * @access  Private/Admin
 */
exports.scheduleVisit = async (req, res, next) => {
  try {
    const { scheduledDate, scheduledTimeSlot } = req.body;

    if (!scheduledDate || !scheduledTimeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both date and time slot'
      });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    serviceRequest.scheduledDate = scheduledDate;
    serviceRequest.scheduledTimeSlot = scheduledTimeSlot;
    serviceRequest.status = 'in_progress';

    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Visit scheduled successfully',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Mark in progress
 * @route   PUT /api/service-requests/admin/:id/in-progress
 * @access  Private/Admin
 */
exports.markInProgress = async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    if (serviceRequest.status === 'open') {
      return res.status(400).json({
        success: false,
        error: 'Please assign the request first'
      });
    }

    serviceRequest.status = 'in_progress';
    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Service request marked as in progress',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Resolve service request
 * @route   PUT /api/service-requests/admin/:id/resolve
 * @access  Private/Admin
 */
exports.resolveServiceRequest = async (req, res, next) => {
  try {
    const { resolution } = req.body;

    if (!resolution) {
      return res.status(400).json({
        success: false,
        error: 'Please provide resolution details'
      });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    serviceRequest.resolution = resolution;
    serviceRequest.status = 'resolved';
    serviceRequest.resolvedAt = new Date();

    await serviceRequest.save();

    await serviceRequest.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Service request resolved',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Close service request
 * @route   PUT /api/service-requests/admin/:id/close
 * @access  Private/Admin
 */
exports.closeServiceRequest = async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    if (serviceRequest.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        error: 'Can only close resolved service requests'
      });
    }

    serviceRequest.status = 'closed';
    serviceRequest.closedAt = new Date();

    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Service request closed',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get service request statistics (Admin)
 * @route   GET /api/service-requests/admin/stats
 * @access  Private/Admin
 */
exports.getServiceRequestStats = async (req, res, next) => {
  try {
    // Status breakdown
    const statusStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Type breakdown
    const typeStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority breakdown
    const priorityStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average rating
    const ratingStats = await ServiceRequest.aggregate([
      {
        $match: { rating: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRated: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusStats,
        byType: typeStats,
        byPriority: priorityStats,
        ratings: ratingStats[0] || { avgRating: 0, totalRated: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
