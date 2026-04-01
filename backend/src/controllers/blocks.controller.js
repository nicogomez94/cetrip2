const prisma = require('../utils/prisma');
const { AppError } = require('../middleware/error.middleware');
const { normalizeImageUrl, normalizeBlockImageUrl } = require('../utils/media-url');
const { normalizeImageValue, deleteManagedImageAsset } = require('../utils/media-cleanup');

const VALID_TYPES = ['HERO', 'TEXT', 'IMAGE', 'VIDEO', 'CARD', 'CTA'];

const cleanupImageIfOrphaned = async ({ imageUrl, excludingBlockId }) => {
  const normalized = normalizeImageValue(imageUrl);
  if (!normalized) return;

  const stillUsedCount = await prisma.block.count({
    where: {
      imageUrl: normalized,
      ...(excludingBlockId ? { id: { not: excludingBlockId } } : {}),
    },
  });

  if (stillUsedCount > 0) return;

  try {
    await deleteManagedImageAsset(normalized);
  } catch (error) {
    console.warn('No se pudo limpiar una imagen huérfana:', error?.message || error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { sectionId } = req.query;
    const where = sectionId ? { sectionId: parseInt(sectionId) } : {};

    const blocks = await prisma.block.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { section: { select: { id: true, title: true, page: true } } },
    });
    res.json({ success: true, data: blocks.map((block) => normalizeBlockImageUrl(req, block)) });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const block = await prisma.block.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { section: true },
    });
    if (!block) return next(new AppError('Bloque no encontrado.', 404));
    res.json({ success: true, data: normalizeBlockImageUrl(req, block) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      sectionId,
      type,
      title,
      subtitle,
      content,
      imageUrl,
      videoUrl,
      linkUrl,
      linkText,
      order,
      isActive,
    } = req.body;

    if (!sectionId) return next(new AppError('sectionId es requerido.', 400));
    if (!type || !VALID_TYPES.includes(type)) {
      return next(new AppError(`Tipo inválido. Válidos: ${VALID_TYPES.join(', ')}`, 400));
    }

    const sectionExists = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
    });
    if (!sectionExists) return next(new AppError('La sección especificada no existe.', 404));

    const parsedOrder = parseInt(order) || 0;
    const duplicateByOrder = await prisma.block.findFirst({
      where: {
        sectionId: parseInt(sectionId),
        order: parsedOrder,
      },
      select: { id: true },
    });
    if (duplicateByOrder) {
      return next(
        new AppError('Ya existe un bloque con ese orden en esta sección. Elegí otro orden.', 409)
      );
    }

    const block = await prisma.block.create({
      data: {
        sectionId: parseInt(sectionId),
        type,
        title: title?.trim(),
        subtitle: subtitle?.trim(),
        content: content?.trim(),
        imageUrl: normalizeImageUrl(req, imageUrl?.trim()),
        videoUrl: videoUrl?.trim(),
        linkUrl: linkUrl?.trim(),
        linkText: linkText?.trim(),
        order: parsedOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
    res.status(201).json({ success: true, data: normalizeBlockImageUrl(req, block) });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const {
      sectionId,
      type,
      title,
      subtitle,
      content,
      imageUrl,
      videoUrl,
      linkUrl,
      linkText,
      order,
      isActive,
    } = req.body;

    if (type && !VALID_TYPES.includes(type)) {
      return next(new AppError(`Tipo inválido. Válidos: ${VALID_TYPES.join(', ')}`, 400));
    }

    const current = await prisma.block.findUnique({ where: { id } });
    if (!current) return next(new AppError('Bloque no encontrado.', 404));

    const data = {};
    if (sectionId !== undefined) data.sectionId = parseInt(sectionId);
    if (type !== undefined) data.type = type;
    if (title !== undefined) data.title = title.trim();
    if (subtitle !== undefined) data.subtitle = subtitle.trim();
    if (content !== undefined) data.content = content.trim();
    if (imageUrl !== undefined) data.imageUrl = normalizeImageUrl(req, imageUrl.trim());
    if (videoUrl !== undefined) data.videoUrl = videoUrl.trim();
    if (linkUrl !== undefined) data.linkUrl = linkUrl.trim();
    if (linkText !== undefined) data.linkText = linkText.trim();
    if (order !== undefined) data.order = parseInt(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const targetSectionId = data.sectionId ?? current.sectionId;
    const targetOrder = data.order ?? current.order;
    const duplicateByOrder = await prisma.block.findFirst({
      where: {
        sectionId: targetSectionId,
        order: targetOrder,
        id: { not: id },
      },
      select: { id: true },
    });
    if (duplicateByOrder) {
      return next(
        new AppError('Ya existe un bloque con ese orden en esta sección. Elegí otro orden.', 409)
      );
    }

    const previousImageUrl = normalizeImageValue(current.imageUrl);
    const nextImageUrl = Object.prototype.hasOwnProperty.call(data, 'imageUrl')
      ? normalizeImageValue(data.imageUrl)
      : previousImageUrl;
    const preserveImageUrls = Array.isArray(req.body.preserveImageUrls)
      ? new Set(req.body.preserveImageUrls.map((value) => normalizeImageValue(value)).filter(Boolean))
      : new Set();

    const block = await prisma.block.update({ where: { id }, data });

    if (previousImageUrl && previousImageUrl !== nextImageUrl && !preserveImageUrls.has(previousImageUrl)) {
      await cleanupImageIfOrphaned({ imageUrl: previousImageUrl, excludingBlockId: id });
    }

    res.json({ success: true, data: normalizeBlockImageUrl(req, block) });
  } catch (err) {
    next(err);
  }
};

const toggle = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.block.findUnique({ where: { id } });
    if (!current) return next(new AppError('Bloque no encontrado.', 404));

    const block = await prisma.block.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    res.json({ success: true, data: normalizeBlockImageUrl(req, block) });
  } catch (err) {
    next(err);
  }
};

const reorder = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return next(new AppError('items debe ser un array.', 400));

    const updates = items.map(({ id, order }) =>
      prisma.block.update({ where: { id: parseInt(id) }, data: { order: parseInt(order) } })
    );
    await prisma.$transaction(updates);
    res.json({ success: true, message: 'Orden actualizado.' });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.block.findUnique({ where: { id } });
    if (!current) return next(new AppError('Bloque no encontrado.', 404));

    await prisma.block.delete({ where: { id } });
    await cleanupImageIfOrphaned({ imageUrl: current.imageUrl, excludingBlockId: id });

    res.json({ success: true, message: 'Bloque eliminado.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, toggle, reorder, remove };
