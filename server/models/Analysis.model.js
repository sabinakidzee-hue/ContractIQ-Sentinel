'use strict';
const mongoose = require('mongoose');

/**
 * DeviationSchema — embedded sub-document for each detected clause deviation.
 */
const deviationSchema = new mongoose.Schema(
  {
    clauseTitle:     { type: String, required: true },
    section:         { type: String, default: '' },
    severity:        { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
    templateText:    { type: String, default: '' },
    contractText:    { type: String, default: '' },
    deviation:       { type: String, default: '' },
    recommendation:  { type: String, default: '' },
    impact:          { type: String, default: '' },
  },
  { _id: true }
);

/**
 * RecommendationSchema — embedded sub-document for each recommended action.
 */
const recommendationSchema = new mongoose.Schema(
  {
    priority:  { type: Number, required: true },
    action:    { type: String, required: true },
    owner:     { type: String, default: '' },
    deadline:  { type: String, default: '' },
    status:    { type: String, enum: ['urgent', 'required', 'recommended'], default: 'recommended' },
  },
  { _id: true }
);

/**
 * RiskBreakdownSchema — embedded sub-document per category.
 */
const riskBreakdownSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    score:    { type: Number, required: true, min: 0, max: 100 },
    level:    { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  },
  { _id: false }
);

/**
 * Analysis — stores the full AI analysis output for a contract.
 */
const analysisSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    executiveSummary: {
      type: String,
      default: '',
    },
    deviations: {
      type: [deviationSchema],
      default: [],
    },
    missingClauses: {
      type: [String],
      default: [],
    },
    recommendedActions: {
      type: [recommendationSchema],
      default: [],
    },
    riskBreakdown: {
      type: [riskBreakdownSchema],
      default: [],
    },
    // AI provenance
    aiModel:    { type: String, default: '' },
    aiProvider: { type: String, default: 'IBM watsonx Orchestrate' },
    // 'mock' | 'live'
    responseSource: {
      type: String,
      enum: ['mock', 'live'],
      default: 'mock',
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

analysisSchema.index({ contractId: 1, createdAt: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
