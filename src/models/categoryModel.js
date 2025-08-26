const mongoose = require('mongoose');

/**
 * Category Schema
 */
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  key: {
    type: String,
    required: [true, 'Please add a category key'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category key cannot be more than 50 characters']
  },
  icon: {
    type: String,
    required: [true, 'Please add an icon name'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'Please add a category path'],
    trim: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
