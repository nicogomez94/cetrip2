require('dotenv').config();
const app = require('./src/app');
const { resolveUploadsDir } = require('./src/utils/uploads-dir');
const { isCloudinaryEnabled } = require('./src/utils/cloudinary');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor CETRIP corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Debug:   ${process.env.DEBUG === 'true' ? 'ACTIVADO' : 'desactivado'}`);
  console.log(`   Media:   ${isCloudinaryEnabled() ? 'Cloudinary' : 'local disk'}`);
  console.log(`   Uploads: ${resolveUploadsDir()}`);
});
