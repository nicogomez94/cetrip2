const { v2: cloudinary } = require('cloudinary');

let isConfigured;

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (process.env.CLOUDINARY_URL?.trim()) return { secure: true };
  if (cloudName && apiKey && apiSecret) {
    return {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    };
  }

  return null;
};

const isCloudinaryEnabled = () => {
  if (typeof isConfigured === 'boolean') return isConfigured;

  const config = getCloudinaryConfig();
  if (!config) {
    isConfigured = false;
    return isConfigured;
  }

  cloudinary.config(config);
  isConfigured = true;
  return isConfigured;
};

const uploadImageToCloudinary = (buffer, mimetype) =>
  new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER?.trim() || 'cetrip';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        overwrite: false,
        unique_filename: true,
        use_filename: false,
        format: mimetype === 'image/jpeg' || mimetype === 'image/jpg' ? 'jpg' : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

const extractCloudinaryPublicId = (value) => {
  if (!value || typeof value !== 'string') return '';

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.endsWith('res.cloudinary.com')) return '';

    const marker = '/upload/';
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return '';

    const tail = decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
    const segments = tail.split('/').filter(Boolean);
    if (!segments.length) return '';

    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicSegments = versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
    if (!publicSegments.length) return '';

    const withExt = publicSegments.join('/');
    return withExt.replace(/\.[^/.]+$/, '');
  } catch (_) {
    return '';
  }
};

const deleteImageFromCloudinary = async (value) => {
  if (!isCloudinaryEnabled()) return false;

  const publicId = extractCloudinaryPublicId(value) || value;
  if (!publicId) return false;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });

  return result?.result === 'ok' || result?.result === 'not found';
};

module.exports = {
  isCloudinaryEnabled,
  uploadImageToCloudinary,
  extractCloudinaryPublicId,
  deleteImageFromCloudinary,
};
