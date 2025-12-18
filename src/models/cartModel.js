const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One cart per user
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
            default: 1,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        // For services, we might want to store selected dates temporarily in cart
        startDate: Date,
        endDate: Date
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
CartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', CartSchema);
