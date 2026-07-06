'use strict';
const mongoose = require('mongoose');

/**
 * Contract — stores uploaded contract file metadata and extracted text.
 */
const contractSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Contract title is required'],
      trim: true,
      maxlength: [300, 'Title must not exceed 300 characters'],
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storedFileName: {
      type: String,   // UUID-based name used on disk / GridFS
      required: true,
    },
    filePath: {
      type: String,   // Absolute path to temp upload (cleared after extraction)
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    contractType: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    parties: {
      type: [String],
      default: [],
    },
    effectiveDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    contractValue: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['uploaded', 'extracting', 'pending_analysis', 'analysing', 'analysed', 'failed'],
      default: 'uploaded',
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual — human-readable file size
contractSchema.virtual('fileSizeFormatted').get(function () {
  const b = this.fileSizeBytes;
  if (b < 1024)       return `${b} B`;
  if (b < 1024 ** 2)  return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(2)} MB`;
});

contractSchema.index({ status: 1, createdAt: -1 });

const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;
