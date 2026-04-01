const { toCloudinaryDeliveryUrl } = require('./cloudinary');

const normalizeOrigin = (value) => {
  if (!value || typeof value !== 'string') return '';
  try {
    return new URL(value.trim()).origin;
  } catch (_) {
    return '';
  }
};

const resolveRequestOrigin = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto']?.split(',')[0]?.trim();
  const forwardedHost = req.headers['x-forwarded-host']?.split(',')[0]?.trim();

  if (forwardedHost) {
    return `${forwardedProto || req.protocol || 'https'}://${forwardedHost}`;
  }

  const host = req.get('host');
  if (!host) return '';
  return `${forwardedProto || req.protocol || 'http'}://${host}`;
};

const getUploadsBaseUrl = (req) => {
  const configuredBackend = normalizeOrigin(process.env.BACKEND_URL);
  const configuredFrontend = normalizeOrigin(process.env.FRONTEND_URL);
  const requestOrigin = resolveRequestOrigin(req);

  if (requestOrigin) return requestOrigin;
  if (configuredBackend && configuredBackend !== configuredFrontend) return configuredBackend;
  if (configuredBackend) return configuredBackend;
  if (configuredFrontend) return configuredFrontend;

  return `http://localhost:${process.env.PORT || 4000}`;
};

const toAbsoluteUploadUrl = (req, filename) => {
  const base = getUploadsBaseUrl(req).replace(/\/$/, '');
  return `${base}/uploads/${filename}`;
};

const normalizeImageUrl = (req, value) => {
  if (typeof value !== 'string') return value;

  const raw = value.trim();
  if (!raw) return '';

  const uploadsBase = getUploadsBaseUrl(req).replace(/\/$/, '');
  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);

  if (raw.startsWith('/uploads/')) {
    return `${uploadsBase}${raw}`;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith('/uploads/')) {
      if (!frontendOrigin || parsed.origin === frontendOrigin) {
        return `${uploadsBase}${parsed.pathname}`;
      }
    }
    return raw;
  } catch (_) {
    // Compatibilidad con valores legacy: filename local o public_id de Cloudinary.
    const cloudinaryUrl = toCloudinaryDeliveryUrl(raw);
    if (cloudinaryUrl) return cloudinaryUrl;

    if (/^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i.test(raw)) {
      return `${uploadsBase}/uploads/${raw}`;
    }

    return raw;
  }
};

const normalizeBlockImageUrl = (req, block) => {
  if (!block || typeof block !== 'object') return block;
  if (!('imageUrl' in block)) return block;
  return {
    ...block,
    imageUrl: normalizeImageUrl(req, block.imageUrl),
  };
};

const normalizeSectionBlocksImageUrls = (req, section) => {
  if (!section || typeof section !== 'object') return section;
  if (!Array.isArray(section.blocks)) return section;
  return {
    ...section,
    blocks: section.blocks.map((block) => normalizeBlockImageUrl(req, block)),
  };
};

module.exports = {
  getUploadsBaseUrl,
  toAbsoluteUploadUrl,
  normalizeImageUrl,
  normalizeBlockImageUrl,
  normalizeSectionBlocksImageUrls,
};
