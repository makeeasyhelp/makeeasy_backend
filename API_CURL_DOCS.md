# MakeEasy API Testing Documentation

This document contains curl commands for testing all endpoints of the MakeEasy backend API. Use these commands to test API functionality from the command line.

## Table of Contents
- [Authentication APIs](#authentication-apis)
- [User APIs](#user-apis)
- [Product APIs](#product-apis)
- [Category APIs](#category-apis)
- [Service APIs](#service-apis)
- [Booking APIs](#booking-apis)
- [About APIs](#about-apis)

## Authentication APIs

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

### Login user
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

### Admin login (use default admin credentials)
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@makeeasy.com",
    "password": "admin123"
  }'
```

### Logout user
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get current user profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update user details
```bash
curl -X PUT http://localhost:5000/api/auth/updatedetails \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "9876543210"
  }'
```

### Update password
```bash
curl -X PUT http://localhost:5000/api/auth/updatepassword \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### Forgot password
```bash
curl -X POST http://localhost:5000/api/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

## User APIs

### Get all users (Admin only)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Get single user by ID (Admin only)
```bash
curl -X GET http://localhost:5000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Create new user (Admin only)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "phone": "1234567890"
  }'
```

### Update user (Admin only)
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Updated User",
    "email": "updateduser@example.com",
    "role": "user",
    "phone": "9876543210"
  }'
```

### Delete user (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Product APIs

### Get all products
```bash
curl -X GET http://localhost:5000/api/products
```

### Get products with filtering
```bash
curl -X GET "http://localhost:5000/api/products?category=electronics&price[gte]=100&price[lte]=500&sort=-price&page=1&limit=10&search=tv"
```

### Get featured products
```bash
curl -X GET http://localhost:5000/api/products/featured
```

### Get single product by ID
```bash
curl -X GET http://localhost:5000/api/products/PRODUCT_ID_HERE
```

### Create new product (Admin only)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "title": "New Smart TV",
    "description": "Latest model with 4K resolution",
    "price": 699,
    "location": "Delhi",
    "category": "electronics",
    "available": true,
    "featured": true
  }'
```

### Update product (Admin only)
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "title": "Updated Smart TV",
    "price": 599,
    "featured": false
  }'
```

### Delete product (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Category APIs

### Get all categories
```bash
curl -X GET http://localhost:5000/api/categories
```

### Get single category by ID
```bash
curl -X GET http://localhost:5000/api/categories/CATEGORY_ID_HERE
```

### Create new category (Admin only)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Appliances",
    "icon": "Kitchen",
    "path": "appliances",
    "key": "appliances"
  }'
```

### Update category (Admin only)
```bash
curl -X PUT http://localhost:5000/api/categories/CATEGORY_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Home Appliances",
    "icon": "HomeAppliance"
  }'
```

### Delete category (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/categories/CATEGORY_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Service APIs

### Get all services
```bash
curl -X GET http://localhost:5000/api/services
```

### Get services with filtering
```bash
curl -X GET "http://localhost:5000/api/services?price[gte]=300&sort=-price&page=1&limit=10&search=cleaning"
```

### Get featured services
```bash
curl -X GET http://localhost:5000/api/services/featured
```

### Get single service by ID
```bash
curl -X GET http://localhost:5000/api/services/SERVICE_ID_HERE
```

### Create new service (Admin only)
```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "title": "Garden Maintenance",
    "description": "Professional garden maintenance and landscaping services",
    "icon": "Leaf",
    "price": 399,
    "available": true,
    "featured": true
  }'
```

### Update service (Admin only)
```bash
curl -X PUT http://localhost:5000/api/services/SERVICE_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "title": "Premium Garden Maintenance",
    "price": 449,
    "featured": true
  }'
```

### Delete service (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/services/SERVICE_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Booking APIs

### Get all bookings (requires authentication)
```bash
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get single booking by ID (requires authentication)
```bash
curl -X GET http://localhost:5000/api/bookings/BOOKING_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create new booking for a product (requires authentication)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "product": "PRODUCT_ID_HERE",
    "startDate": "2025-08-25T00:00:00.000Z",
    "endDate": "2025-08-28T00:00:00.000Z",
    "totalAmount": 1497,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "1234567890",
    "notes": "Please deliver before noon"
  }'
```

### Create new booking for a service (requires authentication)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "service": "SERVICE_ID_HERE",
    "startDate": "2025-08-25T09:00:00.000Z",
    "endDate": "2025-08-25T12:00:00.000Z",
    "totalAmount": 399,
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "customerPhone": "9876543210",
    "notes": "Please bring all necessary equipment"
  }'
```

### Update booking (user can only update notes, admin can update all fields)
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "notes": "Updated notes for the booking"
  }'
```

### Delete booking (requires authentication)
```bash
curl -X DELETE http://localhost:5000/api/bookings/BOOKING_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update booking payment status (Admin only)
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID_HERE/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "paymentStatus": "completed"
  }'
```

### Update booking status (Admin only)
```bash
curl -X PUT http://localhost:5000/api/bookings/BOOKING_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "bookingStatus": "confirmed"
  }'
```

## About APIs

### Get all about documents
```bash
curl -X GET http://localhost:5000/api/about
```

### Get single about document by ID
```bash
curl -X GET http://localhost:5000/api/about/ABOUT_ID_HERE
```

### Create new about document (Admin only)
```bash
curl -X POST http://localhost:5000/api/about \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "mission": {
      "title": "Our Mission Title",
      "subtitle": "Our Mission Subtitle",
      "logoUrl": "https://example.com/logo.png"
    },
    "story": {
      "heading": "Our Story",
      "description": "Description of our story.",
      "highlights": {
        "customers": "10,000+",
        "providers": "500+",
        "cities": "15+"
      }
    },
    "coreValues": [
      { "title": "Integrity", "description": "We value integrity." },
      { "title": "Innovation", "description": "We foster innovation." }
    ],
    "leadershipTeam": [
      {
        "name": "John Doe",
        "role": "CEO",
        "bio": "John is the CEO.",
        "imageUrl": "https://example.com/john.jpg",
        "socials": {
          "linkedin": "https://linkedin.com/in/johndoe",
          "twitter": "https://twitter.com/johndoe",
          "facebook": "https://facebook.com/johndoe"
        }
      }
    ],
    "blog": [
      {
        "category": "Company News",
        "date": "2025-09-05T00:00:00.000Z",
        "title": "We launched!",
        "description": "Our launch story.",
        "link": "https://example.com/blog/launch"
      }
    ],
    "journey": [
      { "year": "2020", "description": "Founded." },
      { "year": "2025", "description": "Reached 10,000 customers." }
    ],
    "community": {
      "heading": "Join the MakeEasy Community",
      "description": "Be a part of our growing community.",
      "buttons": [
        { "text": "Join Us", "link": "https://example.com/join" }
      ]
    }
  }'
```

### Update about document (Admin only)
```bash
curl -X PUT http://localhost:5000/api/about/ABOUT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "mission": {
      "title": "Updated Mission Title"
    }
  }'
```

### Delete about document (Admin only)
```bash
curl -X DELETE http://localhost:5000/api/about/ABOUT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Tips for using the API

1. After registering or logging in, save the token from the response:
   ```
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. Use this token in the Authorization header for authenticated requests:
   ```
   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. The admin user has access to all endpoints, while regular users have limited access.

4. For testing purposes, you can use the default admin credentials:
   - Email: admin@makeeasy.com
   - Password: admin123

5. When testing endpoints that require an ID (like `/api/products/:id`), replace `PRODUCT_ID_HERE` with an actual ID from your database.

6. For date fields, use ISO 8601 format: `YYYY-MM-DDTHH:MM:SS.SSSZ`
