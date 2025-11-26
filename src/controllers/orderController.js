const Order = require('../models/orderModel');
const Booking = require('../models/bookingModel');
const Product = require('../models/productModel');
const Service = require('../models/serviceModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            totalAmount
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No items in order'
            });
        }

        // Verify items and calculate total
        let calculatedTotal = 0;
        const orderItems = [];

        for (const item of items) {
            let product, service;
            let price = 0;

            if (item.productId) {
                product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ success: false, error: `Product not found: ${item.productId}` });
                }
                price = product.price;
            } else if (item.serviceId) {
                service = await Service.findById(item.serviceId);
                if (!service) {
                    return res.status(404).json({ success: false, error: `Service not found: ${item.serviceId}` });
                }
                price = service.price;
            }

            calculatedTotal += price * item.quantity;

            orderItems.push({
                product: item.productId,
                service: item.serviceId,
                quantity: item.quantity,
                price: price,
                startDate: item.startDate,
                endDate: item.endDate
            });
        }

        // Create Order in DB
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalAmount: calculatedTotal,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'pending'
        });

        // Create Booking records for services
        for (const item of orderItems) {
            if (item.service) {
                await Booking.create({
                    user: req.user.id,
                    service: item.service,
                    order: order._id,
                    startDate: item.startDate || new Date(),
                    endDate: item.endDate || new Date(Date.now() + 86400000),
                    totalAmount: item.price * item.quantity,
                    paymentStatus: 'pending',
                    customerName: req.user.name,
                    customerEmail: req.user.email,
                    customerPhone: req.user.phone || 'N/A'
                });
            }
        }

        // Create Razorpay Order if payment method is online (not COD)
        let razorpayOrder = null;
        if (paymentMethod !== 'COD') {
            const options = {
                amount: Math.round(calculatedTotal * 100), // amount in paisa
                currency: "INR",
                receipt: order._id.toString(),
            };

            try {
                razorpayOrder = await razorpay.orders.create(options);
            } catch (err) {
                console.error('Razorpay order creation failed:', err);
                // Continue but warn? Or fail?
                // For now, let's return error if online payment setup fails
                // return res.status(500).json({ success: false, error: 'Payment initialization failed' });
            }
        }

        res.status(201).json({
            success: true,
            data: order,
            razorpayOrder
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update order status
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }

            order.paymentStatus = 'completed';
            order.paymentDetails = {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            };
            await order.save();

            // Update associated bookings
            await Booking.updateMany(
                { order: orderId },
                { paymentStatus: 'completed' }
            );

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid signature'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
exports.getOrders = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'admin') {
            query = Order.find();
        } else {
            query = Order.find({ user: req.user.id });
        }

        const orders = await query
            .populate('items.product', 'title price image')
            .populate('items.service', 'title price icon')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'title price image')
            .populate('items.service', 'title price icon')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Make sure user is order owner or admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order
 * @route   PUT /api/orders/:id
 * @access  Private
 */
exports.updateOrder = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Make sure user is order owner or admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this order'
            });
        }

        order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // If payment status is updated to completed, update bookings too
        if (req.body.paymentStatus === 'completed') {
            await Booking.updateMany(
                { order: req.params.id },
                { paymentStatus: 'completed' }
            );
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};
