'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Ensures a directory exists, creating it (and any parents) if necessary.
 * @param {string} dirPath  Absolute or relative path to the directory.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Safely deletes a file without throwing if it does not exist.
 * @param {string} filePath  Path of the file to delete.
 */
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {
    // Silently ignore — temp file may have already been removed
  }
}

/**
 * Returns a human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

/**
 * Returns the file extension in lower-case without the leading dot.
 * @param {string} filename
 * @returns {string}
 */
function getExtension(filename) {
  return path.extname(filename).slice(1).toLowerCase();
}

module.exports = { ensureDir, safeUnlink, formatBytes, getExtension };
