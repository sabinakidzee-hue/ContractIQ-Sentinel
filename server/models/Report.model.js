'use strict';
const mongoose = require('mongoose');

/**
 * Report — stores metadata for generated Excel deviation reports.
 */
const reportSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,   // Server-side path to the generated .xlsx
      default: '',
    },
    // When the file was generated
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    // Report summary snapshot (denormalised for fast list views)
    contractTitle: { type: String, default: '' },
    riskScore:     { type: Number, default: 0 },
    riskLevel:     { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    deviationCount:{ type: Number, default: 0 },
    // 'pending' → 'ready' → 'expired'
    reportStatus:  {
      type: String,
      enum: ['pending', 'ready', 'expired'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reportSchema.index({ contractId: 1, generatedAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
