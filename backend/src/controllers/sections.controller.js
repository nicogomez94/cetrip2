const prisma = require('../utils/prisma');
const { AppError } = require('../middleware/error.middleware');
const { normalizeSectionBlocksImageUrls } = require('../utils/media-url');

// ─── Público ──────────────────────────────────────────────────────────────────
const getByPage = async (req, res, next) => {
  try {
    const { page } = req.params;
    const sections = await prisma.section.findMany({
      where: { page, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json({
      success: true,
      data: sections.map((section) => normalizeSectionBlocksImageUrls(req, section)),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { page } = req.query;
    const where = page ? { page } : {};

    const sections = await prisma.section.findMany({
      where,
      orderBy: [{ page: 'asc' }, { order: 'asc' }],
      include: {
        blocks: { orderBy: { order: 'asc' } },
        _count: { select: { blocks: true } },
      },
    });
    res.json({
      success: true,
      data: sections.map((section) => normalizeSectionBlocksImageUrls(req, section)),
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const section = await prisma.section.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { blocks: { orderBy: { order: 'asc' } } },
    });
    if (!section) return next(new AppError('Sección no encontrada.', 404));
    res.json({ success: true, data: normalizeSectionBlocksImageUrls(req, section) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { slug, title, description, page, order, isActive } = req.body;

    const section = await prisma.section.create({
      data: {
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        title: title.trim(),
        description: description?.trim(),
        page: page.trim().toLowerCase(),
        order: parseInt(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { slug, title, description, page, order, isActive } = req.body;

    const data = {};
    if (slug !== undefined) data.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description.trim();
    if (page !== undefined) data.page = page.trim().toLowerCase();
    if (order !== undefined) data.order = parseInt(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const section = await prisma.section.update({ where: { id }, data });
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

const toggle = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.section.findUnique({ where: { id } });
    if (!current) return next(new AppError('Sección no encontrada.', 404));

    const section = await prisma.section.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

const reorder = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) return next(new AppError('items debe ser un array.', 400));

    const updates = items.map(({ id, order }) =>
      prisma.section.update({ where: { id: parseInt(id) }, data: { order: parseInt(order) } })
    );
    await prisma.$transaction(updates);
    res.json({ success: true, message: 'Orden actualizado.' });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await prisma.section.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Sección eliminada.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getByPage, getAll, getOne, create, update, toggle, reorder, remove };
