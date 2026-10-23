const mongoose = require('mongoose');

/**
 * Schema for Individual Generated Certificates
 * Tracks participant details, unique certificate verification IDs, and status.
 */
const certificateSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Associated Event ObjectId is required'],
      index: true,
    },
    participantName: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true,
    },
    participantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    certificateId: {
      type: String,
      required: [true, 'Unique certificate ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['generated', 'revoked', 'pending'],
      default: 'generated',
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
