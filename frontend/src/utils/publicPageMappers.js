import {
  ADMISION_DEFAULTS,
  CONTACTO_DEFAULTS,
  QUIENES_DEFAULTS,
  SERVICIOS_DEFAULTS,
} from '../constants/publicPageDefaults';

const sortByOrder = (items = []) => [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

const trimOrEmpty = (value) => (typeof value === 'string' ? value.trim() : '');

const fallbackText = (value, fallback) => {
  const clean = trimOrEmpty(value);
  return clean || fallback;
};

const normalize = (value) =>
  trimOrEmpty(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const includesAny = (value, keywords = []) => {
  const text = normalize(value);
  return keywords.some((keyword) => text.includes(normalize(keyword)));
};

const flattenBlocks = (sections = []) =>
  sortByOrder(sections).flatMap((section) =>
    sortByOrder(section.blocks || []).map((block) => ({ ...block, section }))
  );

const getBlocksByType = (sections, type) =>
  flattenBlocks(sections).filter((block) => block.type === type);

const pickImage = (blocks = [], fallbackUrl) => {
  const withImage = blocks.find((block) => trimOrEmpty(block.imageUrl));
  return withImage?.imageUrl || fallbackUrl;
};

const SERVICE_IMAGE_BY_TITLE = [
  { keywords: ['kinesiologia'], imageUrl: '/servicios/1.png' },
  { keywords: ['fonoaudiologia'], imageUrl: '/servicios/2.png' },
  { keywords: ['terapia ocupacional'], imageUrl: '/servicios/3.png' },
  { keywords: ['psicologia'], imageUrl: '/servicios/4.png' },
  { keywords: ['psicopedagogia'], imageUrl: '/servicios/5.png' },
  { keywords: ['estimulacion temprana'], imageUrl: '/servicios/6.png' },
];

const resolveServiceImage = (title, index, fallbackUrl) => {
  const match = SERVICE_IMAGE_BY_TITLE.find((entry) =>
    entry.keywords.some((keyword) => includesAny(title, [keyword]))
  );

  if (match) return match.imageUrl;
  if (fallbackUrl) return fallbackUrl;
  return `/servicios/${(index % SERVICE_IMAGE_BY_TITLE.length) + 1}.png`;
};

export function mapQuienesPage(sections = []) {
  const defaults = QUIENES_DEFAULTS;
  const sortedSections = sortByOrder(sections);
  const textBlocks = getBlocksByType(sections, 'TEXT');
  const imageBlocks = getBlocksByType(sections, 'IMAGE');

  const mainSection =
    sortedSections.find((section) => includesAny(section.slug, ['quienes', 'principal'])) ||
    sortedSections[0];
  const mainTextBlock =
    textBlocks.find((block) => includesAny(block.title, ['quienes', 'historia'])) || textBlocks[0];
  const mainImage = pickImage(imageBlocks, defaults.mainImage);

  const usedTextIds = new Set(mainTextBlock?.id ? [mainTextBlock.id] : []);
  const pickIdentityBlock = (keywords = []) => {
    const keywordMatch = textBlocks.find(
      (block) => !usedTextIds.has(block.id) && includesAny(block.title, keywords)
    );
    if (keywordMatch) {
      usedTextIds.add(keywordMatch.id);
      return keywordMatch;
    }

    const nextFree = textBlocks.find((block) => !usedTextIds.has(block.id));
    if (!nextFree) return null;
    usedTextIds.add(nextFree.id);
    return nextFree;
  };

  const mission = pickIdentityBlock(['mision']);
  const vision = pickIdentityBlock(['vision']);
  const focus = pickIdentityBlock(['enfoque', 'metodologia', 'trabajo']);

  const identitySource = [mission, vision, focus];
  const identity = defaults.identity.map((fallbackItem, index) => ({
    title: fallbackText(identitySource[index]?.title, fallbackItem.title),
    content: fallbackText(identitySource[index]?.content, fallbackItem.content),
  }));

  return {
    bannerTitle: fallbackText(mainSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(mainSection?.description, defaults.bannerSubtitle),
    introEyebrow: defaults.introEyebrow,
    introTitle: fallbackText(mainTextBlock?.title, defaults.introTitle),
    introBody: fallbackText(mainTextBlock?.content, defaults.introBody),
    mainImage,
    identity,
    trustTitle: defaults.trustTitle,
    trustBody: defaults.trustBody,
  };
}

export function mapServiciosPage(sections = []) {
  const defaults = SERVICIOS_DEFAULTS;
  const sortedSections = sortByOrder(sections);
  const introSection =
    sortedSections.find((section) => includesAny(section.slug, ['servicios'])) || sortedSections[0];

  const introTextBlock =
    getBlocksByType(sections, 'TEXT').find((block) =>
      includesAny(block.title || block.content, ['servicios', 'trabajamos', 'equipo'])
    ) || getBlocksByType(sections, 'TEXT')[0];

  const cardBlocks = getBlocksByType(sections, 'CARD');
  const mappedServices = cardBlocks.map((block, index) => ({
    id: block.id || `service-${index}`,
    title: fallbackText(block.title, defaults.services[index]?.title || 'Servicio'),
    content: fallbackText(block.content, defaults.services[index]?.content || ''),
    imageUrl: resolveServiceImage(
      block.title,
      index,
      defaults.services[index % defaults.services.length]?.imageUrl
    ),
  }));

  const services = mappedServices.length > 0 ? mappedServices : defaults.services;

  return {
    bannerTitle: fallbackText(introSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(introSection?.description, defaults.bannerSubtitle),
    introTitle: defaults.introTitle,
    introBody: fallbackText(introTextBlock?.content, defaults.introBody),
    services,
    workflowTitle: defaults.workflowTitle,
    workflow: defaults.workflow,
  };
}

export function mapAdmisionPage(sections = []) {
  const defaults = ADMISION_DEFAULTS;
  const sortedSections = sortByOrder(sections);
  const mainSection =
    sortedSections.find((section) => includesAny(section.slug, ['admision', 'proceso'])) ||
    sortedSections[0];

  const textBlocks = getBlocksByType(sections, 'TEXT');
  const introTextBlock =
    textBlocks.find((block) => includesAny(block.title || block.content, ['iniciar', 'proceso'])) ||
    textBlocks[0];

  const stepBlocks = getBlocksByType(sections, 'CARD');
  const mappedSteps = stepBlocks.map((block, index) => ({
    id: block.id || `step-${index}`,
    title: fallbackText(block.title, defaults.steps[index]?.title || `Paso ${index + 1}`),
    content: fallbackText(block.content, defaults.steps[index]?.content || ''),
  }));

  const steps = mappedSteps.length > 0 ? mappedSteps : defaults.steps;

  return {
    bannerTitle: fallbackText(mainSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(mainSection?.description, defaults.bannerSubtitle),
    introTitle: defaults.introTitle,
    introBody: fallbackText(introTextBlock?.content, defaults.introBody),
    steps,
    requirementsTitle: defaults.requirementsTitle,
    requirements: defaults.requirements,
    faqTitle: defaults.faqTitle,
    faq: defaults.faq,
  };
}

export function mapContactoPage(sections = []) {
  const defaults = CONTACTO_DEFAULTS;
  const sortedSections = sortByOrder(sections);
  const mainSection =
    sortedSections.find((section) => includesAny(section.slug, ['contacto'])) || sortedSections[0];
  const textBlocks = getBlocksByType(sections, 'TEXT');
  const cardBlocks = getBlocksByType(sections, 'CARD');
  const mergedBlocks = [...textBlocks, ...cardBlocks];

  const pickInfoByKeyword = (keywords, fallback) => {
    const match = mergedBlocks.find((block) => includesAny(block.title || block.content, keywords));
    return fallbackText(match?.content || match?.title, fallback);
  };

  return {
    bannerTitle: fallbackText(mainSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(mainSection?.description, defaults.bannerSubtitle),
    infoTitle: defaults.infoTitle,
    infoSubtitle: defaults.infoSubtitle,
    address: pickInfoByKeyword(['direccion', 'ubicacion'], defaults.address),
    phone: pickInfoByKeyword(['telefono', 'whatsapp'], defaults.phone),
    email: pickInfoByKeyword(['email', 'correo'], defaults.email),
    schedule: pickInfoByKeyword(['horario', 'atencion'], defaults.schedule),
  };
}
