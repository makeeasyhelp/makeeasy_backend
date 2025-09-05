# MakeEasy Backend API

A RESTful API for the MakeEasy application built with Node.js, Express, and MongoDB.

## Setup and Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/makeeasy
   JWT_SECRET=makeeasy_jwt_secret_key
   JWT_EXPIRE=30d
   ```
4. Run the server
   ```
   npm run dev
   ```

## API Documentation

### Authentication Routes

| Method | Endpoint                | Description               | Access      |
| ------ | ----------------------- | ------------------------- | ----------- |
| POST   | /api/auth/register      | Register a new user       | Public      |
| POST   | /api/auth/login         | Login user                | Public      |
| POST   | /api/auth/admin/login   | Admin login               | Public      |
| POST   | /api/auth/logout        | Logout user               | Public      |
| GET    | /api/auth/me            | Get current user profile  | Private     |
| PUT    | /api/auth/updatedetails | Update user details       | Private     |
| PUT    | /api/auth/updatepassword| Update user password      | Private     |
| POST   | /api/auth/forgotpassword| Request password reset    | Public      |

### User Routes

| Method | Endpoint                | Description               | Access      |
| ------ | ----------------------- | ------------------------- | ----------- |
| GET    | /api/users              | Get all users             | Admin       |
| GET    | /api/users/:id          | Get single user           | Admin       |
| POST   | /api/users              | Create new user           | Admin       |
| PUT    | /api/users/:id          | Update user               | Admin       |
| DELETE | /api/users/:id          | Delete user               | Admin       |

### Product Routes

| Method | Endpoint                | Description               | Access      |
| ------ | ----------------------- | ------------------------- | ----------- |
| GET    | /api/products           | Get all products          | Public      |
| GET    | /api/products/featured  | Get featured products     | Public      |
| GET    | /api/products/:id       | Get single product        | Public      |
| POST   | /api/products           | Create new product        | Admin       |
| PUT    | /api/products/:id       | Update product            | Admin       |
| DELETE | /api/products/:id       | Delete product            | Admin       |

### Category Routes

| Method | Endpoint                | Description               | Access      |
| ------ | ----------------------- | ------------------------- | ----------- |
| GET    | /api/categories         | Get all categories        | Public      |
| GET    | /api/categories/:id     | Get single category       | Public      |
| POST   | /api/categories         | Create new category       | Admin       |
| PUT    | /api/categories/:id     | Update category           | Admin       |
| DELETE | /api/categories/:id     | Delete category           | Admin       |

### Service Routes

| Method | Endpoint                | Description               | Access      |
| ------ | ----------------------- | ------------------------- | ----------- |
| GET    | /api/services           | Get all services          | Public      |
| GET    | /api/services/featured  | Get featured services     | Public      |
| GET    | /api/services/:id       | Get single service        | Public      |
| POST   | /api/services           | Create new service        | Admin       |
| PUT    | /api/services/:id       | Update service            | Admin       |
| DELETE | /api/services/:id       | Delete service            | Admin       |

### Booking Routes

| Method | Endpoint                | Description               | Access      |
| ------ | ----------------------- | ------------------------- | ----------- |
| GET    | /api/bookings           | Get all bookings          | Private     |
| GET    | /api/bookings/:id       | Get single booking        | Private     |
| POST   | /api/bookings           | Create new booking        | Private     |
| PUT    | /api/bookings/:id       | Update booking            | Private     |
| DELETE | /api/bookings/:id       | Delete booking            | Private     |
| PUT    | /api/bookings/:id/payment| Update payment status     | Admin       |
| PUT    | /api/bookings/:id/status| Update booking status     | Admin       |

## Models

### User
- name
- email
- phone
- password
- role [user, admin]
- resetPasswordToken
- resetPasswordExpire
- createdAt

### Category
- name
- key
- icon
- path
- createdAt

### Product
- title
- description
- price
- location
- category
- imageUrl
- available
- featured
- createdAt

### Service
- title
- description
- icon
- price
- available
- featured
- createdAt

### Booking
- user
- product or service
- startDate
- endDate
- totalAmount
- paymentStatus [pending, completed, failed, refunded]
- bookingStatus [pending, confirmed, cancelled, completed]
- customerName
- customerEmail
- customerPhone
- notes
- createdAt

## Usage

When the server starts, it will automatically seed the database with initial data if the collections are empty.

Default admin user:
- Email: admin@makeeasy.com
- Password: admin123

Default regular user:
- Email: user@makeeasy.com
- Password: admin123

## API Testing Tools

This project includes comprehensive API testing documentation and tools to help you test all endpoints:

### Documentation

1. **Complete API Testing Collection** (`COMPLETE_API_TESTING_COLLECTION.md`)
   - A comprehensive guide to testing all aspects of the API
   - Includes environment setup, authentication workflows, test scenarios, CI/CD integration, and security testing

2. **API Curl Documentation** (`API_CURL_DOCS.md`)
   - Detailed curl commands for testing all endpoints from the command line
   - Organized by endpoint category with examples

3. **API Testing Guide** (`API_TESTING_GUIDE.md`)
   - Guide for testing the API with different tools and languages
   - Includes best practices and troubleshooting tips

### Testing Tools

1. **Postman Collection** (`MakeEasy_Postman_Collection.json`)
   - Complete Postman collection with all API endpoints
   - Includes environment variables and authentication flows
   - Import directly into Postman to start testing

2. **Insomnia Collection** (`MakeEasy_Insomnia_Collection.json`)
   - Complete Insomnia REST client collection with all API endpoints
   - Alternative to Postman for API testing

### Automated Testing Scripts

1. **Node.js Testing Script** (`test-api.js`)
   - Automated testing script written in Node.js
   - Tests all endpoints sequentially and reports results
   - Run with: `npm run test:api` or `node test-api.js`

2. **Python Testing Script** (`test_api.py`)
   - Automated testing script written in Python
   - Alternative to the Node.js script
   - Run with: `npm run test:api:py` or `python test_api.py`
   - Requires: `pip install requests termcolor`

3. **Master Test Runner** (`run-all-tests.js`)
   - Runs all available test suites in sequence
   - Generates comprehensive test reports in the `test-reports` directory
   - Run with: `npm run test:all` or `node run-all-tests.js`
   - Requires the API server to be running

## Integration with Frontend

The frontend React application can connect to this backend using the API integration utility located at:
- `/my-makeeasy-app/src/services/api.js`

This utility provides methods for interacting with all backend endpoints and handles authentication.


<!-- /Users/gouravsharma/Desktop/GOURAVCODE/Vaibhav/makeeasy-backend/scripts/verify-vercel-connection.js -->