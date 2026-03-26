const EMPTY_SLUG_PREFIX = 'servicio';

const decodeHtmlEntities = (value = '') =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const normalizeWhitespace = (value = '') => value.replace(/\s+/g, ' ').trim();

const sanitizeSlugCandidate = (value = '') => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return '';
  const withoutQuery = trimmed.split('?')[0].split('#')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
};

export const stripRichText = (value = '') => {
  if (!value || typeof value !== 'string') return '';

  const withoutScripts = value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');

  const plainText = withoutScripts.replace(/<[^>]*>/g, ' ');
  return normalizeWhitespace(decodeHtmlEntities(plainText));
};

export const slugifyService = (value = '', fallback = EMPTY_SLUG_PREFIX) => {
  const normalized = sanitizeSlugCandidate(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
};

export const dedupeSlugs = (slugs = []) => {
  const used = new Map();

  return slugs.map((slug, index) => {
    const fallback = `${EMPTY_SLUG_PREFIX}-${index + 1}`;
    const base = slugifyService(slug, fallback);
    const count = used.get(base) || 0;

    used.set(base, count + 1);
    if (count === 0) return base;
    return `${base}-${count + 1}`;
  });
};

export const buildServiceSlugs = (services = []) =>
  dedupeSlugs(
    services.map((service, index) => {
      const fallback = `${EMPTY_SLUG_PREFIX}-${index + 1}`;
      return slugifyService(service?.slug || service?.title || '', fallback);
    })
  );
