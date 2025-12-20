const Booking = require('../models/bookingModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const AddOn = require('../models/addOnModel');

/**
 * @desc    Create new rental booking
 * @route   POST /api/rentals
 * @access  Private
 */
exports.createRental = async (req, res, next) => {
  try {
    const {
      productId,
      selectedCity,
      selectedTenure,
      selectedAddOns,
      deliveryAddress,
      deliveryDate,
      deliveryTimeSlot
    } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get city pricing
    const cityPricing = product.getCityPricing(selectedCity);
    if (!cityPricing) {
      return res.status(400).json({
        success: false,
        error: `Product not available in ${selectedCity}`
      });
    }

    // Check stock availability
    if (!cityPricing.available || cityPricing.stock <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock in this city'
      });
    }

    // Get tenure pricing
    const tenurePricing = product.getTenurePricing(selectedCity, selectedTenure);
    if (!tenurePricing) {
      return res.status(400).json({
        success: false,
        error: `${selectedTenure} months tenure not available`
      });
    }

    // Check user KYC status
    const user = await User.findById(req.user.id);
    if (user.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'KYC verification required before renting',
        redirect: '/kyc-upload',
        kycStatus: user.kycStatus
      });
    }

    // Process add-ons
    let processedAddOns = [];
    if (selectedAddOns && selectedAddOns.length > 0) {
      const addOnIds = selectedAddOns.map(addon => addon.addOnId);
      const addOns = await AddOn.find({ _id: { $in: addOnIds }, active: true });
      
      processedAddOns = addOns.map(addon => ({
        addOn: addon._id,
        name: addon.name,
        monthlyCharge: addon.monthlyCharge,
        oneTimeCharge: addon.oneTimeCharge
      }));
    }

    // Calculate total amount
    const monthlyRent = tenurePricing.monthlyRent;
    const depositAmount = cityPricing.deposit;
    const deliveryCharge = cityPricing.deliveryCharge;
    
    const addOnsMonthlyTotal = processedAddOns.reduce((sum, addon) => 
      sum + (addon.monthlyCharge || 0), 0
    );
    const addOnsOneTimeTotal = processedAddOns.reduce((sum, addon) => 
      sum + (addon.oneTimeCharge || 0), 0
    );

    // Total for first payment: deposit + first month rent + delivery + one-time add-ons
    const firstMonthTotal = depositAmount + monthlyRent + addOnsMonthlyTotal + deliveryCharge + addOnsOneTimeTotal;

    // Calculate GST (18%)
    const gst = firstMonthTotal * 0.18;
    const totalAmount = firstMonthTotal + gst;

    // Calculate planned end date
    const plannedEndDate = new Date();
    plannedEndDate.setMonth(plannedEndDate.getMonth() + selectedTenure);

    // Create rental booking
    const rental = await Booking.create({
      user: req.user.id,
      product: productId,
      bookingType: 'rental',
      selectedCity,
      selectedTenure,
      monthlyRent,
      depositAmount,
      depositStatus: 'pending',
      deliveryCharge,
      deliveryAddress,
      deliveryDate: deliveryDate || null,
      deliveryTimeSlot: deliveryTimeSlot || null,
      deliveryStatus: 'pending',
      rentalStatus: 'pending_delivery',
      selectedAddOns: processedAddOns,
      startDate: new Date(),
      endDate: plannedEndDate,
      plannedEndDate,
      totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone
    });

    // Populate rental details
    await rental.populate([
      { path: 'product', select: 'title images specifications' },
      { path: 'selectedAddOns.addOn', select: 'name description coverage' }
    ]);

    res.status(201).json({
      success: true,
      data: rental,
      summary: {
        monthlyRent,
        deposit: depositAmount,
        deliveryCharge,
        addOnsMonthly: addOnsMonthlyTotal,
        addOnsOneTime: addOnsOneTimeTotal,
        subtotal: firstMonthTotal,
        gst,
        total: totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's rentals
 * @route   GET /api/rentals
 * @access  Private
 */
exports.getRentals = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = { 
      user: req.user.id,
      bookingType: 'rental'
    };

    // Filter by rental status if provided
    if (status) {
      query.rentalStatus = status;
    }

    const rentals = await Booking.find(query)
      .populate('product', 'title images cityPricing specifications')
      .populate('selectedAddOns.addOn', 'name description')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single rental details
 * @route   GET /api/rentals/:id
 * @access  Private
 */
exports.getRental = async (req, res, next) => {
  try {
    const rental = await Booking.findById(req.params.id)
      .populate('product', 'title images cityPricing specifications')
      .populate('selectedAddOns.addOn', 'name description coverage inclusions exclusions')
      .populate('user', 'name email phone');

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    // Check ownership or admin
    if (rental.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this rental'
      });
    }

    // Calculate remaining months
    const remainingMonths = rental.getRemainingMonths();

    res.status(200).json({
      success: true,
      data: rental,
      remainingMonths
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request rental extension
 * @route   POST /api/rentals/:id/extend
 * @access  Private
 */
exports.requestExtension = async (req, res, next) => {
  try {
    const { additionalMonths } = req.body;

    if (!additionalMonths || additionalMonths < 1) {
      return res.status(400).json({
        success: false,
        error: 'Please specify valid number of months (minimum 1)'
      });
    }

    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if rental is active
    if (rental.rentalStatus !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Can only extend active rentals'
      });
    }

    // Calculate new end date
    const currentEndDate = rental.plannedEndDate || rental.endDate;
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);

    // Add extension request
    rental.extensionRequests.push({
      requestedMonths: additionalMonths,
      requestedAt: new Date(),
      status: 'pending',
      newEndDate
    });

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Extension request submitted successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request early closure
 * @route   POST /api/rentals/:id/early-closure
 * @access  Private
 */
exports.requestEarlyClosure = async (req, res, next) => {
  try {
    const rental = await Booking.findById(req.params.id).populate('product');

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Check if early closure is allowed
    if (!rental.canRequestEarlyClosure()) {
      return res.status(400).json({
        success: false,
        error: 'Early closure not allowed yet. Minimum tenure must be completed.'
      });
    }

    // Calculate early closure charge
    const remainingMonths = rental.getRemainingMonths();
    const earlyClosureCharge = rental.product.earlyClosureCharge || (rental.monthlyRent * 0.5); // 50% of one month rent

    rental.earlyClosureRequested = true;
    rental.earlyClosureRequestDate = new Date();
    rental.earlyClosureCharge = earlyClosureCharge;
    rental.rentalStatus = 'pending_pickup';

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Early closure request submitted',
      data: rental,
      charges: {
        earlyClosureCharge,
        remainingMonths,
        note: 'Pickup will be scheduled within 2-3 business days'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pause rental
 * @route   PUT /api/rentals/:id/pause
 * @access  Private
 */
exports.pauseRental = async (req, res, next) => {
  try {
    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (rental.rentalStatus !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Can only pause active rentals'
      });
    }

    rental.rentalStatus = 'paused';
    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental paused successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resume rental
 * @route   PUT /api/rentals/:id/resume
 * @access  Private
 */
exports.resumeRental = async (req, res, next) => {
  try {
    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (rental.rentalStatus !== 'paused') {
      return res.status(400).json({
        success: false,
        error: 'Can only resume paused rentals'
      });
    }

    rental.rentalStatus = 'active';
    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental resumed successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all rentals
 * @route   GET /api/rentals/admin/all
 * @access  Private/Admin
 */
exports.getAllRentals = async (req, res, next) => {
  try {
    const { status, city, page = 1, limit = 20 } = req.query;

    let query = { bookingType: 'rental' };

    if (status) {
      query.rentalStatus = status;
    }

    if (city) {
      query.selectedCity = city;
    }

    const skip = (page - 1) * limit;

    const rentals = await Booking.find(query)
      .populate('user', 'name email phone kycStatus')
      .populate('product', 'title images')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Update rental status
 * @route   PUT /api/rentals/admin/:id/status
 * @access  Private/Admin
 */
exports.updateRentalStatus = async (req, res, next) => {
  try {
    const { rentalStatus, deliveryStatus, notes } = req.body;

    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    if (rentalStatus) {
      rental.rentalStatus = rentalStatus;
      
      // If marking as active, set rental start date
      if (rentalStatus === 'active' && !rental.rentalStartDate) {
        rental.rentalStartDate = new Date();
        rental.billingCycleStart = new Date().getDate();
        
        // Calculate next billing date (next month, same day)
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        rental.nextBillingDate = nextBilling;
      }
    }

    if (deliveryStatus) {
      rental.deliveryStatus = deliveryStatus;
    }

    if (notes) {
      rental.notes = notes;
    }

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental status updated',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Schedule delivery
 * @route   PUT /api/rentals/admin/:id/schedule-delivery
 * @access  Private/Admin
 */
exports.scheduleDelivery = async (req, res, next) => {
  try {
    const { deliveryDate, deliveryTimeSlot } = req.body;

    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    rental.deliveryDate = deliveryDate;
    rental.deliveryTimeSlot = deliveryTimeSlot;
    rental.deliveryStatus = 'scheduled';
    rental.bookingStatus = 'confirmed';

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Delivery scheduled successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Schedule pickup
 * @route   PUT /api/rentals/admin/:id/schedule-pickup
 * @access  Private/Admin
 */
exports.schedulePickup = async (req, res, next) => {
  try {
    const { pickupDate, pickupTimeSlot } = req.body;

    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    rental.pickupScheduledDate = pickupDate;
    rental.pickupTimeSlot = pickupTimeSlot;
    rental.rentalStatus = 'pending_pickup';

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Approve extension request
 * @route   PUT /api/rentals/admin/:id/approve-extension/:requestIndex
 * @access  Private/Admin
 */
exports.approveExtension = async (req, res, next) => {
  try {
    const { requestIndex } = req.params;

    const rental = await Booking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: 'Rental not found'
      });
    }

    if (!rental.extensionRequests[requestIndex]) {
      return res.status(404).json({
        success: false,
        error: 'Extension request not found'
      });
    }

    // Approve the extension
    rental.extensionRequests[requestIndex].status = 'approved';
    rental.extensionRequests[requestIndex].approvedAt = new Date();

    // Update rental end date
    rental.plannedEndDate = rental.extensionRequests[requestIndex].newEndDate;
    rental.endDate = rental.extensionRequests[requestIndex].newEndDate;
    rental.selectedTenure += rental.extensionRequests[requestIndex].requestedMonths;
    rental.rentalStatus = 'extended';

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Extension request approved',
      data: rental
    });
  } catch (error) {
    next(error);
  }
};
