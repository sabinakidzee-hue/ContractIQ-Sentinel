'use strict';
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const fs       = require('fs');
const path     = require('path');

/**
 * Extracts raw text from a PDF or DOCX file.
 *
 * @param {string} filePath    Absolute path to the uploaded file.
 * @param {'pdf'|'docx'} type  File type.
 * @returns {Promise<string>}  Extracted plain text.
 */
async function extractText(filePath, type) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found for text extraction: ${filePath}`);
  }

  if (type === 'pdf') {
    const buffer = fs.readFileSync(filePath);
    const data   = await pdfParse(buffer);
    return data.text?.trim() || '';
  }

  if (type === 'docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    if (result.messages?.length > 0) {
      console.warn('[parser] mammoth warnings:', result.messages.map((m) => m.message));
    }
    return result.value?.trim() || '';
  }

  throw new Error(`Unsupported file type for text extraction: "${type}"`);
}

/**
 * Returns a quick word-count estimate from extracted text.
 * @param {string} text
 * @returns {number}
 */
function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

module.exports = { extractText, wordCount };
