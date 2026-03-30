import api from './api';

export const PAGE_SLUGS = {
  home: {
    hero: 'home-hero',
    services: 'home-info',
    about: 'home-bienvenida',
  },
  quienes: {
    banner: 'quienes-banner',
    intro: 'quienes-intro',
    identity: 'quienes-identidad',
    trust: 'quienes-trust',
  },
  servicios: {
    banner: 'servicios-banner',
    intro: 'servicios-intro',
    list: 'servicios-lista',
    workflow: 'servicios-workflow',
    cta: 'servicios-cta',
  },
  admision: {
    banner: 'admision-banner',
    intro: 'admision-intro',
    steps: 'admision-steps',
    requirements: 'admision-requisitos',
    faq: 'admision-faq',
    cta: 'admision-cta',
  },
  contacto: {
    banner: 'contacto-banner',
    info: 'contacto-info',
  },
  cet: {
    highlight: 'cet-highlight',
    gallery: 'cet-gallery',
  },
  saie: {
    highlight: 'saie-highlight',
    gallery: 'saie-gallery',
  },
};

export const sortByOrder = (items = []) => [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

export const trimText = (value) => (typeof value === 'string' ? value.trim() : '');

export const notEmpty = (value) => trimText(value).length > 0;

export const findSectionBySlug = (sections = [], slug) => sections.find((section) => section.slug === slug);

export const getSectionBlocks = (sections = [], slug) => {
  const section = findSectionBySlug(sections, slug);
  return sortByOrder(section?.blocks || []);
};

export async function fetchSectionsByPage(page) {
  const res = await api.get(`/admin/sections?page=${page}`);
  return sortByOrder(res.data.data || []).map((section) => ({
    ...section,
    blocks: sortByOrder(section.blocks || []),
  }));
}

export async function fetchAllSections() {
  const res = await api.get('/admin/sections');
  return sortByOrder(res.data.data || []).map((section) => ({
    ...section,
    blocks: sortByOrder(section.blocks || []),
  }));
}

export async function ensureSection({ sections, page, slug, title, description = '', order = 0 }) {
  const existing = findSectionBySlug(sections, slug);
  const payload = {
    slug,
    page,
    title: trimText(title),
    description: trimText(description),
    order,
    isActive: true,
  };

  if (existing) {
    await api.put(`/admin/sections/${existing.id}`, payload);
    return existing.id;
  }

  const res = await api.post('/admin/sections', payload);
  return res.data.data.id;
}

export async function replaceSectionBlocks(sectionId, blocks = []) {
  const current = await api.get(`/admin/blocks?sectionId=${sectionId}`);
  const currentBlocks = current.data.data || [];

  for (const block of currentBlocks) {
    await api.delete(`/admin/blocks/${block.id}`);
  }

  for (const block of blocks) {
    await api.post('/admin/blocks', {
      sectionId,
      type: block.type,
      title: trimText(block.title),
      subtitle: trimText(block.subtitle),
      content: trimText(block.content),
      imageUrl: trimText(block.imageUrl),
      videoUrl: trimText(block.videoUrl),
      linkUrl: trimText(block.linkUrl),
      linkText: trimText(block.linkText),
      order: block.order,
      isActive: true,
    });
  }
}
