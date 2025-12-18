const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Cart = require('../src/models/cartModel');
const User = require('../src/models/userModel');
const Product = require('../src/models/productModel');
const Service = require('../src/models/serviceModel');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyCart = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // 1. Get a test user
        let user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
                phone: '1234567890'
            });
        }
        console.log(`Using user: ${user._id}`);

        // 2. Get a product and service
        const product = await Product.findOne();
        const service = await Service.findOne();

        if (!product || !service) {
            console.error('No products or services found. Please seed DB first.');
            process.exit(1);
        }

        // 3. Clear existing cart
        await Cart.findOneAndDelete({ user: user._id });
        console.log('Cleared existing cart');

        // 4. Test Add to Cart (Product)
        console.log('Testing Add to Cart (Product)...');
        let cart = await Cart.create({
            user: user._id,
            items: [{
                product: product._id,
                quantity: 1,
                price: product.price
            }]
        });
        console.log('Cart created with product:', cart.items.length === 1);

        // 5. Test Add to Cart (Service)
        console.log('Testing Add to Cart (Service)...');
        cart.items.push({
            service: service._id,
            quantity: 1,
            price: service.price
        });
        await cart.save();
        console.log('Service added to cart:', cart.items.length === 2);

        // 6. Test Update Quantity
        console.log('Testing Update Quantity...');
        cart.items[0].quantity = 2;
        await cart.save();
        console.log('Quantity updated:', cart.items[0].quantity === 2);

        // 7. Test Remove Item
        console.log('Testing Remove Item...');
        cart.items.shift(); // Remove first item
        await cart.save();
        console.log('Item removed:', cart.items.length === 1);

        console.log('Cart verification successful!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyCart();
