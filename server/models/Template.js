const mongoose = require('mongoose');

/**
 * Schema for Fabric.js Certificate Templates
 * Stores canvas dimensions, background image, and serialized Fabric.js canvas JSON.
 */
const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [120, 'Template name cannot exceed 120 characters'],
    },
    backgroundImageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    canvasWidth: {
      type: Number,
      required: [true, 'Canvas width is required'],
      default: 1123, // Standard A4 Landscape pixel width @ 96 DPI or similar scale
    },
    canvasHeight: {
      type: Number,
      required: [true, 'Canvas height is required'],
      default: 794, // Standard A4 Landscape pixel height @ 96 DPI
    },
    canvasState: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Fabric.js canvas state object is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Template', templateSchema);
