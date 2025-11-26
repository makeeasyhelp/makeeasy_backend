const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Service = require('../models/serviceModel');

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'title price image')
            .populate('items.service', 'title price icon');

        if (!cart) {
            // Create empty cart if not exists
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, serviceId, quantity = 1, startDate, endDate } = req.body;

        if (!productId && !serviceId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide productId or serviceId'
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        // Fetch item details to get price
        let price = 0;
        if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }
            price = product.price;
        } else if (serviceId) {
            const service = await Service.findById(serviceId);
            if (!service) {
                return res.status(404).json({ success: false, error: 'Service not found' });
            }
            price = service.price;
        }

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item => {
            if (productId) return item.product && item.product.toString() === productId;
            if (serviceId) return item.service && item.service.toString() === serviceId;
            return false;
        });

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
            // Update dates if provided
            if (startDate) cart.items[itemIndex].startDate = startDate;
            if (endDate) cart.items[itemIndex].endDate = endDate;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                service: serviceId,
                quantity,
                price,
                startDate,
                endDate
            });
        }

        await cart.save();

        // Populate for response
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'title price image')
            .populate('items.service', 'title price icon');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be at least 1'
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Item not found in cart'
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        cart = await Cart.findById(cart._id)
            .populate('items.product', 'title price image')
            .populate('items.service', 'title price icon');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
exports.removeFromCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        cart = await Cart.findById(cart._id)
            .populate('items.product', 'title price image')
            .populate('items.service', 'title price icon');

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};
