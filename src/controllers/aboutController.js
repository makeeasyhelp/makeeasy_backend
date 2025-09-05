const About = require('../models/aboutModel');

/**
 * @desc    Get all about documents
 * @route   GET /api/about
 * @access  Public
 */
exports.getAbouts = async (req, res, next) => {
  try {
    const abouts = await About.find();
    
    res.status(200).json({
      success: true,
      count: abouts.length,
      data: abouts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single about document
 * @route   GET /api/about/:id
 * @access  Public
 */
exports.getAbout = async (req, res, next) => {
  try {
    const about = await About.findById(req.params.id);
    
    if (!about) {
      return res.status(404).json({
        success: false,
        error: 'About content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: about
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new about document
 * @route   POST /api/about
 * @access  Private (Admin)
 */
exports.createAbout = async (req, res, next) => {
  try {
    const about = await About.create(req.body);
    
    res.status(201).json({
      success: true,
      data: about
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update about document
 * @route   PUT /api/about/:id
 * @access  Private (Admin)
 */
exports.updateAbout = async (req, res, next) => {
  try {
    let about = await About.findById(req.params.id);
    
    if (!about) {
      return res.status(404).json({
        success: false,
        error: 'About content not found'
      });
    }
    
    about = await About.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: about
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete about document
 * @route   DELETE /api/about/:id
 * @access  Private (Admin)
 */
exports.deleteAbout = async (req, res, next) => {
  try {
    const about = await About.findById(req.params.id);
    
    if (!about) {
      return res.status(404).json({
        success: false,
        error: 'About content not found'
      });
    }
    
    await about.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
