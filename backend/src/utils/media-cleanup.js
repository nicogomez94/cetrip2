const fs = require('fs/promises');
const path = require('path');

const { resolveUploadsDir } = require('./uploads-dir');
const { deleteImageFromCloudinary, extractCloudinaryPublicId } = require('./cloudinary');

const normalizeImageValue = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const extractLocalUploadFilename = (value) => {
  const normalized = normalizeImageValue(value);
  if (!normalized) return '';

  const fromPath = (pathname) => {
    if (!pathname.startsWith('/uploads/')) return '';
    const decoded = decodeURIComponent(pathname.replace(/^\/uploads\//, ''));
    if (!decoded || decoded.includes('/') || decoded.includes('\\')) return '';
    return decoded;
  };

  if (normalized.startsWith('/uploads/')) {
    return fromPath(normalized);
  }

  try {
    const parsed = new URL(normalized);
    return fromPath(parsed.pathname);
  } catch (_) {
    return '';
  }
};

const deleteLocalUpload = async (filename) => {
  if (!filename) return false;

  const uploadsDir = resolveUploadsDir();
  const targetPath = path.join(uploadsDir, filename);

  try {
    await fs.unlink(targetPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return true;
    throw error;
  }
};

const deleteManagedImageAsset = async (value) => {
  const normalized = normalizeImageValue(value);
  if (!normalized) return false;

  if (extractCloudinaryPublicId(normalized)) {
    return deleteImageFromCloudinary(normalized);
  }

  const localFilename = extractLocalUploadFilename(normalized);
  if (localFilename) {
    return deleteLocalUpload(localFilename);
  }

  return false;
};

module.exports = { normalizeImageValue, deleteManagedImageAsset };
