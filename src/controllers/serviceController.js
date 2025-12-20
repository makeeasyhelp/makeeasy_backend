const Service = require('../models/serviceModel');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res, next) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Service.find(JSON.parse(queryStr));
    
    // Handle search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: searchRegex },
        { description: searchRegex }
      ]);
    }
    
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments(query.getQuery());
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const services = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: services.length,
      pagination,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private (Admin)
 */
exports.createService = async (req, res, next) => {
  try {
    const serviceData = { ...req.body };
    
    // Handle image upload if present
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/categories/${req.file.filename}`;
      serviceData.image = imageUrl;
    }
    
    const service = await Service.create(serviceData);
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private (Admin)
 */
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    const updateData = { ...req.body };
    
    // Handle image upload if present
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/categories/${req.file.filename}`;
      updateData.image = imageUrl;
    }
    
    service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private (Admin)
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    await service.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured services
 * @route   GET /api/services/featured
 * @access  Public
 */
exports.getFeaturedServices = async (req, res, next) => {
  try {
    const services = await Service.find({ featured: true }).limit(6);
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload service images
 * @route   POST /api/services/:id/images
 * @access  Private (Admin)
 */
exports.uploadServiceImages = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one image'
      });
    }

    // Get uploaded image URLs
    const imageUrls = req.files.map(file => `/uploads/services/${file.filename}`);
    
    // Add images to service's images array
    service.images = [...(service.images || []), ...imageUrls];
    
    // Set first image as primary image if not set
    if (!service.image && imageUrls.length > 0) {
      service.image = imageUrls[0];
    }
    
    await service.save();
    
    res.status(200).json({
      success: true,
      data: service,
      uploadedImages: imageUrls
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete service image
 * @route   DELETE /api/services/:id/images/:imageIndex
 * @access  Private (Admin)
 */
exports.deleteServiceImage = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= service.images.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image index'
      });
    }

    // Remove image from array
    const deletedImage = service.images[imageIndex];
    service.images.splice(imageIndex, 1);
    
    // If deleted image was the primary image, set new primary
    if (service.image === deletedImage && service.images.length > 0) {
      service.image = service.images[0];
    } else if (service.images.length === 0) {
      service.image = null;
    }
    
    await service.save();
    
    // Optional: Delete file from filesystem
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, '../../', deletedImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};
