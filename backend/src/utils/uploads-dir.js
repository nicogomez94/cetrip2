const path = require('path');

const DEFAULT_UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const resolveUploadsDir = () => {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (!configured) return DEFAULT_UPLOADS_DIR;

  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
};

module.exports = { resolveUploadsDir };
