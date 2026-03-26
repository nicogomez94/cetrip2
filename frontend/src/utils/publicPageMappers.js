import {
  ADMISION_DEFAULTS,
  CONTACTO_DEFAULTS,
  QUIENES_DEFAULTS,
  SERVICIOS_DEFAULTS,
} from '../constants/publicPageDefaults';
import { buildServiceSlugs, stripRichText } from './serviceContent';

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

const getSectionBySlug = (sections = [], slug) => sections.find((section) => section.slug === slug);

const getBlocksBySectionSlug = (sections = [], slug) =>
  sortByOrder(getSectionBySlug(sections, slug)?.blocks || []);

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

const mapServiceItems = (items = [], defaults = []) => {
  const baseItems = items.map((item, index) => ({
    id: item.id || `service-${index}`,
    title: fallbackText(item.title, defaults[index]?.title || 'Servicio'),
    content: fallbackText(item.content, defaults[index]?.content || ''),
    imageUrl: fallbackText(
      item.imageUrl,
      resolveServiceImage(item.title, index, defaults[index % defaults.length]?.imageUrl)
    ),
    slug: fallbackText(item.linkUrl || item.slug, item.title || defaults[index]?.title || ''),
  }));

  const slugs = buildServiceSlugs(baseItems);

  return baseItems.map((service, index) => ({
    ...service,
    slug: slugs[index],
    summary: stripRichText(service.content),
  }));
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

  const legacy = {
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

  const structuredBanner = getSectionBySlug(sections, 'quienes-banner');
  const structuredIntro = getSectionBySlug(sections, 'quienes-intro');
  const structuredIntroBlocks = getBlocksBySectionSlug(sections, 'quienes-intro');
  const structuredIdentityBlocks = getBlocksBySectionSlug(sections, 'quienes-identidad').filter(
    (block) => block.type === 'CARD' || block.type === 'TEXT'
  );
  const structuredTrust = getSectionBySlug(sections, 'quienes-trust');
  const structuredTrustBlocks = getBlocksBySectionSlug(sections, 'quienes-trust').filter(
    (block) => block.type === 'TEXT'
  );

  const introText = structuredIntroBlocks.find((block) => block.type === 'TEXT');
  const introImage = structuredIntroBlocks.find((block) => block.type === 'IMAGE');

  const structuredIdentity = legacy.identity.map((item, index) => ({
    title: fallbackText(structuredIdentityBlocks[index]?.title, item.title),
    content: fallbackText(structuredIdentityBlocks[index]?.content, item.content),
  }));

  return {
    bannerTitle: fallbackText(structuredBanner?.title, legacy.bannerTitle),
    bannerSubtitle: fallbackText(structuredBanner?.description, legacy.bannerSubtitle),
    introEyebrow: fallbackText(structuredIntro?.description, legacy.introEyebrow),
    introTitle: fallbackText(structuredIntro?.title, legacy.introTitle),
    introBody: fallbackText(introText?.content, legacy.introBody),
    mainImage: fallbackText(introImage?.imageUrl, legacy.mainImage),
    identity: structuredIdentity,
    trustTitle: fallbackText(structuredTrust?.title, legacy.trustTitle),
    trustBody: fallbackText(structuredTrustBlocks[0]?.content, legacy.trustBody),
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
  const mappedServices = mapServiceItems(cardBlocks, defaults.services);

  const fallbackServices = mapServiceItems(defaults.services, defaults.services);
  const services = mappedServices.length > 0 ? mappedServices : fallbackServices;
  const legacy = {
    bannerTitle: fallbackText(introSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(introSection?.description, defaults.bannerSubtitle),
    introTitle: defaults.introTitle,
    introBody: fallbackText(introTextBlock?.content, defaults.introBody),
    services,
    workflowTitle: defaults.workflowTitle,
    workflow: defaults.workflow,
    ctaTitle: defaults.cta.title,
    ctaText: defaults.cta.text,
  };

  const structuredBanner = getSectionBySlug(sections, 'servicios-banner');
  const structuredIntro = getSectionBySlug(sections, 'servicios-intro');
  const structuredIntroText = getBlocksBySectionSlug(sections, 'servicios-intro').find(
    (block) => block.type === 'TEXT'
  );
  const structuredServices = getBlocksBySectionSlug(sections, 'servicios-lista')
    .filter((block) => block.type === 'CARD');
  const mappedStructuredServices = mapServiceItems(structuredServices, legacy.services);
  const structuredWorkflowSection = getSectionBySlug(sections, 'servicios-workflow');
  const structuredWorkflowBlocks = getBlocksBySectionSlug(sections, 'servicios-workflow').filter(
    (block) => block.type === 'CARD' || block.type === 'TEXT'
  );
  const structuredWorkflow = legacy.workflow.map((item, index) => ({
    title: fallbackText(structuredWorkflowBlocks[index]?.title, item.title),
    content: fallbackText(structuredWorkflowBlocks[index]?.content, item.content),
  }));
  const structuredCta = getSectionBySlug(sections, 'servicios-cta');

  return {
    bannerTitle: fallbackText(structuredBanner?.title, legacy.bannerTitle),
    bannerSubtitle: fallbackText(structuredBanner?.description, legacy.bannerSubtitle),
    introTitle: fallbackText(structuredIntro?.title, legacy.introTitle),
    introBody: fallbackText(structuredIntroText?.content, legacy.introBody),
    services: mappedStructuredServices.length > 0 ? mappedStructuredServices : legacy.services,
    workflowTitle: fallbackText(structuredWorkflowSection?.title, legacy.workflowTitle),
    workflow: structuredWorkflow,
    ctaTitle: fallbackText(structuredCta?.title, legacy.ctaTitle),
    ctaText: fallbackText(structuredCta?.description, legacy.ctaText),
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
  const legacy = {
    bannerTitle: fallbackText(mainSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(mainSection?.description, defaults.bannerSubtitle),
    introTitle: defaults.introTitle,
    introBody: fallbackText(introTextBlock?.content, defaults.introBody),
    steps,
    requirementsTitle: defaults.requirementsTitle,
    requirements: defaults.requirements,
    faqTitle: defaults.faqTitle,
    faq: defaults.faq,
    ctaTitle: defaults.cta.title,
    ctaText: defaults.cta.text,
  };

  const structuredBanner = getSectionBySlug(sections, 'admision-banner');
  const structuredIntro = getSectionBySlug(sections, 'admision-intro');
  const structuredIntroText = getBlocksBySectionSlug(sections, 'admision-intro').find(
    (block) => block.type === 'TEXT'
  );
  const structuredSteps = getBlocksBySectionSlug(sections, 'admision-steps')
    .filter((block) => block.type === 'CARD')
    .map((block, index) => ({
      id: block.id || `structured-step-${index}`,
      title: fallbackText(block.title, legacy.steps[index]?.title || `Paso ${index + 1}`),
      content: fallbackText(block.content, legacy.steps[index]?.content || ''),
    }));
  const structuredRequirementsSection = getSectionBySlug(sections, 'admision-requisitos');
  const structuredRequirementsBlocks = getBlocksBySectionSlug(sections, 'admision-requisitos').filter(
    (block) => block.type === 'TEXT'
  );
  const structuredFaqSection = getSectionBySlug(sections, 'admision-faq');
  const structuredFaqBlocks = getBlocksBySectionSlug(sections, 'admision-faq').filter(
    (block) => block.type === 'CARD'
  );
  const structuredCta = getSectionBySlug(sections, 'admision-cta');

  return {
    bannerTitle: fallbackText(structuredBanner?.title, legacy.bannerTitle),
    bannerSubtitle: fallbackText(structuredBanner?.description, legacy.bannerSubtitle),
    introTitle: fallbackText(structuredIntro?.title, legacy.introTitle),
    introBody: fallbackText(structuredIntroText?.content, legacy.introBody),
    steps: structuredSteps.length > 0 ? structuredSteps : legacy.steps,
    requirementsTitle: fallbackText(structuredRequirementsSection?.title, legacy.requirementsTitle),
    requirements:
      structuredRequirementsBlocks.length > 0
        ? structuredRequirementsBlocks.map((block) => fallbackText(block.content, ''))
        : legacy.requirements,
    faqTitle: fallbackText(structuredFaqSection?.title, legacy.faqTitle),
    faq:
      structuredFaqBlocks.length > 0
        ? structuredFaqBlocks.map((block, index) => ({
            question: fallbackText(block.title, legacy.faq[index]?.question || ''),
            answer: fallbackText(block.content, legacy.faq[index]?.answer || ''),
          }))
        : legacy.faq,
    ctaTitle: fallbackText(structuredCta?.title, legacy.ctaTitle),
    ctaText: fallbackText(structuredCta?.description, legacy.ctaText),
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

  const legacy = {
    bannerTitle: fallbackText(mainSection?.title, defaults.bannerTitle),
    bannerSubtitle: fallbackText(mainSection?.description, defaults.bannerSubtitle),
    infoTitle: defaults.infoTitle,
    infoSubtitle: defaults.infoSubtitle,
    address: pickInfoByKeyword(['direccion', 'ubicacion'], defaults.address),
    phone: pickInfoByKeyword(['telefono', 'whatsapp'], defaults.phone),
    email: pickInfoByKeyword(['email', 'correo'], defaults.email),
    schedule: pickInfoByKeyword(['horario', 'atencion'], defaults.schedule),
  };

  const structuredBanner = getSectionBySlug(sections, 'contacto-banner');
  const structuredInfoSection = getSectionBySlug(sections, 'contacto-info');
  const structuredInfoBlocks = getBlocksBySectionSlug(sections, 'contacto-info').filter(
    (block) => block.type === 'TEXT'
  );
  const valueByKey = (key, fallback) => {
    const match = structuredInfoBlocks.find((block) => block.title === key);
    return fallbackText(match?.content, fallback);
  };

  return {
    bannerTitle: fallbackText(structuredBanner?.title, legacy.bannerTitle),
    bannerSubtitle: fallbackText(structuredBanner?.description, legacy.bannerSubtitle),
    infoTitle: fallbackText(structuredInfoSection?.title, legacy.infoTitle),
    infoSubtitle: fallbackText(structuredInfoSection?.description, legacy.infoSubtitle),
    address: valueByKey('address', legacy.address),
    phone: valueByKey('phone', legacy.phone),
    email: valueByKey('email', legacy.email),
    schedule: valueByKey('schedule', legacy.schedule),
  };
}
